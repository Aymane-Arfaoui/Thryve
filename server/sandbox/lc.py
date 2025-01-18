import dotenv
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.memory import ChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableBranch
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from app.services.ext.azure_ai import get_llm, get_embeddings
from config import AzureModels
# Load environment variables
dotenv.load_dotenv()

# Initialize chat model
chat = get_llm(AzureModels.gpt_4o)
embeddings = get_embeddings(AzureModels.ada_embeddings)

# Create the ChatPromptTemplate
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

# Create a chat model (replace model name with one available in your environment)

# Pipe the prompt into the chat model to form a chain
chain = prompt | chat

# Invoke the chain with a few example messages
response = chain.invoke(
    {
        "messages": [
            HumanMessage(
                content="Translate this sentence from English to French: I love programming."
            ),
            AIMessage(content="J'adore la programmation."),
            HumanMessage(content="What did you just say?"),
        ],
    }
)

print("Chain response:\n", response.content)
# Example output:
# AIMessage(content='I said "J\'adore la programmation," which means "I love programming" in French.')


# --- 2. Message history usage ---

from langchain.memory import ChatMessageHistory

# Create an in-memory chat history
demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("hi!")
demo_ephemeral_chat_history.add_ai_message("whats up?")

print("\nCurrent chat history:")
for msg in demo_ephemeral_chat_history.messages:
    print(msg)

# Add another user message
demo_ephemeral_chat_history.add_user_message(
    "Translate this sentence from English to French: I love programming."
)

# Invoke the chain, passing the stored messages
response = chain.invoke({"messages": demo_ephemeral_chat_history.messages})
print("\nChain response:\n", response.content)

# Add the AI's message to history, then ask a follow-up
demo_ephemeral_chat_history.add_ai_message(response)
demo_ephemeral_chat_history.add_user_message("What did you just say?")

followup_response = chain.invoke({"messages": demo_ephemeral_chat_history.messages})
print("\nFollow-up response:\n", followup_response.content)


# --- 3. Setting up a Retriever (for RAG) with a vector database ---

# Make sure you've installed extra dependencies:
# !pip install --upgrade langchain-chroma beautifulsoup4

from langchain_community.document_loaders import WebBaseLoader


# Split documents
from langchain_text_splitters import RecursiveCharacterTextSplitter

documents = [
        Document(
            page_content="The Python programming language was created by Guido van Rossum and was first released in 1991.",
            metadata={"source": "python_history.txt", "page": 1}
        ),
        Document(
            page_content="Python is known for its simple syntax and readability. It follows the philosophy of 'explicit is better than implicit'.",
            metadata={"source": "python_features.txt", "page": 1}
        )
    ]   

vectorstore = FAISS.from_documents(documents=documents, embedding=embeddings)

# Create a retriever from the vectorstore
retriever = vectorstore.as_retriever(k=4)

# Test retrieving some docs
retrieved_docs = retriever.invoke("how can langsmith help with testing?")
print("\nRetrieved docs:\n", retrieved_docs)


# --- 4. Handling documents in a chain ---

question_answering_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Answer the user's questions based on the below context:\n\n{context}",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

# Combine documents with the stuff chain
document_chain = create_stuff_documents_chain(chat, question_answering_prompt)

# Example usage: ephemeral chat history
demo_ephemeral_chat_history = ChatMessageHistory()
demo_ephemeral_chat_history.add_user_message("how can langsmith help with testing?")

# Pass retrieved docs + user messages to chain
answer_from_docs = document_chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
        "context": retrieved_docs,
    }
)

print("\nAnswer from docs:\n", answer_from_docs)


# --- 5. Creating a retrieval chain ---

from typing import Dict
from langchain_core.runnables import RunnablePassthrough

def parse_retriever_input(params: Dict):
    # Grab the last user message, pass it to retriever
    return params["messages"][-1].content

retrieval_chain = (
    RunnablePassthrough.assign(
        context=parse_retriever_input | retriever,
    ).assign(
        answer=document_chain,
    )
)

# Test the retrieval chain
demo_ephemeral_chat_history = ChatMessageHistory()
demo_ephemeral_chat_history.add_user_message("how can langsmith help with testing?")

response = retrieval_chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    }
)
print("\nRetrieval chain response:\n", response["answer"])

# Add the AI message to history, ask a follow-up
demo_ephemeral_chat_history.add_ai_message(response["answer"])
demo_ephemeral_chat_history.add_user_message("tell me more about that!")

followup = retrieval_chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    }
)
print("\nFollow-up retrieval chain response:\n", followup["answer"])


# --- 6. A shorter version to return only the final answer ---

retrieval_chain_with_only_answer = (
    RunnablePassthrough.assign(
        context=parse_retriever_input | retriever,
    )
    | document_chain
)

answer_only = retrieval_chain_with_only_answer.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    },
)

print("\nRetrieval chain (answer only):\n", answer_only)