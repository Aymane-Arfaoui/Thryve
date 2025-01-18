from dataclasses import dataclass
from langchain_core.messages import HumanMessage, AIMessage
from config import AzureModels

@dataclass
class Conversation:
    messages: list[HumanMessage | AIMessage]
    
    def add_human_message(self, message: str):
        self.messages.append(HumanMessage(content=message))

    def add_ai_message(self, message: str):
        self.messages.append(AIMessage(content=message))

    

