from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, AIMessageChunk
from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.vectorstores import FAISS
from langchain_core.runnables import RunnablePassthrough, Runnable
from langchain_openai import AzureOpenAIEmbeddings
from typing import Optional, Union
from langchain.memory import ChatMessageHistory
import asyncio
from typing import AsyncIterator, NamedTuple
from langchain.chains.combine_documents import create_stuff_documents_chain
from app.services.ext.azure_ai import get_llm, get_embeddings
from config import AzureModels
import re

class AIStreamResponse(NamedTuple):
    response: str
    finished:bool

DEFAULT_EMBEDDINGS = get_embeddings(AzureModels.ada_embeddings)


def create_vector_store(
    documents: list[Document],
    embeddings: AzureOpenAIEmbeddings = DEFAULT_EMBEDDINGS,
    persist_directory: Optional[str] = None,
):
    """Create a FAISS vector store from documents."""
    # Split documents into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(documents)

    # Create and save the vector store
    vector_store = FAISS.from_documents(splits, embeddings)

    if persist_directory:
        vector_store.save_local(persist_directory)

    return vector_store


def load_vector_store(persist_directory: str):
    return FAISS.load_local(persist_directory, DEFAULT_EMBEDDINGS)


def get_default_retrieval_chain(
    vector_store: FAISS,
    prompt_template: ChatPromptTemplate,
    model: AzureModels = AzureModels.gpt_4o,
):
    """Create a conversational retrieval chain."""
    llm = get_llm(model)

    # Create document chain for question answering
    document_chain = create_stuff_documents_chain(llm, prompt_template)
    
    def parse_retriever_input(params: dict):
    # Grab the last user message, pass it to retriever
        return params["messages"][-1].content

    # Create retrieval chain using RunnablePassthrough
    retrieval_chain = RunnablePassthrough.assign(
        context=parse_retriever_input | vector_store.as_retriever(search_kwargs={"k": 3})
    ).assign(
        answer=document_chain,
    )

    return retrieval_chain


async def get_complete_response(
    chain: Runnable,
    user_input: str,
    chat_history: ChatMessageHistory = ChatMessageHistory(),
    prompt_kwargs: dict = None,
) -> str:
    
    async for chunk in await _get_retrieval_response(chain, user_input, chat_history, prompt_kwargs):
        if chunk.get("event") == "on_parser_end":
            return chunk.get("data", {}).get("output")

async def get_response_stream(
    chain: Runnable,
    user_input: str,
    chat_history: ChatMessageHistory = ChatMessageHistory(),
    prompt_kwargs: dict = None,
) -> AsyncIterator[AIStreamResponse]:



    async for chunk in await _get_retrieval_response(chain, user_input, chat_history, prompt_kwargs):
        
        event = chunk.get("event")
    
        if event == "on_chat_model_stream":
            ai_response_chunk : AIMessageChunk = chunk.get("data", {}).get("chunk", None)
            if ai_response_chunk:
                finish_reason = ai_response_chunk.response_metadata.get("finish_reason")
                response = ai_response_chunk.content
                yield AIStreamResponse(response=response, finished=finish_reason is not None)

async def _get_retrieval_response(
    chain: Runnable,
    user_input: str,
    chat_history: ChatMessageHistory = ChatMessageHistory(),
    prompt_kwargs: dict = None,
) -> AsyncIterator[AIMessageChunk]:
    """Get response from the retrieval chain."""
    chat_history.add_user_message(user_input)
    response = chain.astream_events(
        {
            "messages": chat_history.messages,
        } | (prompt_kwargs or {}),
        version="v2",
        
    )
    return response


# IMPORTANT: MAKE SURE TO HAVE A FIELD "{context}" WITHIN THE SYSTEM MESSAGE
def get_prompt_template(sys_prompt: str, leading_prompt: str) -> ChatPromptTemplate:
    """Create a prompt template for the retrieval chain."""
    return ChatPromptTemplate.from_messages([
        ("system", sys_prompt),
        ("placeholder", "{messages}"),
        ("system", leading_prompt),
    ])


async def get_response_sentences(response_gen : AsyncIterator[AIStreamResponse]) -> AsyncIterator[str]:
    
    curr_sentence = ""
    prev_sentence = ""

    def get_sentence():
        nonlocal curr_sentence
        sentence = curr_sentence
        curr_sentence = ""
        return sentence

    async for chunk in response_gen:
        content = chunk.response
        curr_sentence = prev_sentence + curr_sentence
        prev_sentence = ""
        if content:
            curr_sentence += content
        
        if (len(curr_sentence) == 1 and re.search(r"[.!?]", curr_sentence)) or re.match(
                r"^-?\d+\./$", curr_sentence.strip()
            ):
            curr_sentence = ""
            continue

        split_sentence = curr_sentence.split()
        if (
            "\n" in content
            or re.search(r"[.!?]", content)
            or ("," in content and len(split_sentence) > 3)
        ):
            yield get_sentence()
            continue

        if len(split_sentence) > 14:
            prev_sentence = " ".join(split_sentence[9:])
            curr_sentence = " ".join(split_sentence[0:9]) + " "
            yield get_sentence()
            continue


            
        

        
        

# 1. First, let's create some sample documents
documents = [
    Document(
        page_content="Python is a high-level programming language.",
        metadata={"source": "python_docs", "page": 1}
    ),
    Document(
        page_content="Python was created by Guido van Rossum.",
        metadata={"source": "python_history", "page": 1}
    ),
]

# 2. Create a vector store from the documents
vector_store = create_vector_store(
    documents=documents,
    persist_directory="./vector_store"  # Optional: persist the vector store
)

# 3. Create a prompt template
system_prompt = """You are a helpful assistant. Use the following context to answer questions.
Context: {context}"""
leading_prompt = "Based on the above context, please answer the following question:"

prompt_template = get_prompt_template(
    sys_prompt=system_prompt,
    leading_prompt=leading_prompt
)

# 4. Create the retrieval chain
retrieval_chain = get_default_retrieval_chain(
    vector_store=vector_store,
    prompt_template=prompt_template
)

# 5. Initialize chat history
chat_history = ChatMessageHistory()

# 6. Get responses for questions
async def ask_question(question: str):
    response_gen = get_response_stream(
        chain=retrieval_chain,
        user_input=question,
        chat_history=chat_history
    )

    async for response in get_response_sentences(response_gen):
        print(response)

