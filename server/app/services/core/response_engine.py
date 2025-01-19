from app.services.core import response_tools as rg
from langchain_community.vectorstores import VectorStore
from enum import Enum
from app.services.definitions.call_elements import CallElement
from langchain_community.vectorstores import FAISS
import asyncio
from app.services.core.response_tools import create_vector_store
from langchain_core.documents import Document
import json
from typing import AsyncIterator
from app.models.context import ConversationContext

class ChatMessageTypes(Enum):
    HUMAN = "human"
    AI = "ai"

class ResponseEngine(CallElement):

    def __init__(self,
                 vector_store : VectorStore = None,
                 system_prompt : str = "",
                 leading_prompt : str = "",
                 ):
        
        self.vector_store = vector_store
        self.system_prompt = system_prompt
        self.leading_prompt = leading_prompt

        self.prompt_template = None
        self.retrieval_chain = None
        self.chat_history = rg.ChatMessageHistory()
        

    def add_to_chat_history(self, message : str, role : ChatMessageTypes):
        
        if role == ChatMessageTypes.HUMAN:  
            self.chat_history.add_user_message(message)
        elif role == ChatMessageTypes.AI:
            self.chat_history.add_ai_message(message)

    def initialize_defaults(self):
        self.prompt_template = rg.get_prompt_template(
            sys_prompt=self.system_prompt,
            leading_prompt=self.leading_prompt
        )
        self.retrieval_chain = rg.get_default_retrieval_chain(
            vector_store=self.vector_store,
            prompt_template=self.prompt_template
        )

        print("Retrieval chain: ", self.retrieval_chain)
        print("Prompt template: ", self.prompt_template)

    async def create_response_gen(self, input, **kwargs) -> AsyncIterator[str]:
        print("Creating response gen with input: ", input)
        response_gen = rg.get_response_stream(
            chain=self.retrieval_chain,
            user_input=input,
            chat_history=self.chat_history,
            prompt_kwargs=kwargs
        )

        async for chunk in response_gen:
            yield chunk.response

    # TODO: Add logic to load prompts from start data
    async def initialize_from_start_data(self, call_context : ConversationContext):
        
        self.vector_store = call_context.bot.knowledge_base
        self.system_prompt = call_context.bot.sys_prompt
        self.leading_prompt = call_context.bot.leading_prompt
        
        self.initialize_defaults()



    


