from app.services.core import response_generators as rg
from langchain_community.vectorstores import VectorStore
from enum import Enum
from app.services.definitions.call_elements import CallElement
from langchain_community.vectorstores import FAISS

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
        self.chat_history = rg.ChatMessageHistory()

    def create_sentence_response_gen(self, input, **kwargs):
        response_gen = rg.get_response_stream(
            chain=self.retrieval_chain,
            user_input=input,
            chat_history=self.chat_history
        )

        return rg.get_response_sentences(response_gen)


    # TODO: Add logic to load prompts from start data
    def initialize_from_start_data(self, data : dict):
        self.vector_store = FAISS.from_documents([])
        self.system_prompt = "Be nice to the user"
        self.leading_prompt = "You are a helpful assistant"    


    


