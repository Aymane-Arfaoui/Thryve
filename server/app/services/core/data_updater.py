from app.models.context import ConversationContext
from app.services.core import response_tools as rg

class DataUpdateService:
    def __init__(self, 
                 context : ConversationContext):
        self.context = context


    async def update_data(self, 
                          final_chat_history : rg.ChatMessageHistory):
        pass
