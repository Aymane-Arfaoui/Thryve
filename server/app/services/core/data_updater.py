from app.models.context import ConversationContext
from app.services.core import response_tools as rg


class DataUpdateService:
    def __init__(self, 
                 context : ConversationContext):
        self.context = context


    async def update_data(self, 
                          final_chat_history : rg.ChatMessageHistory):
        pass


conversation_context = ConversationContext()
conversation_context.user_id = "1asdasdasd23"


new_updater = DataUpdateService(conversation_context)
new_updater.update_data(rg.ChatMessageHistory())    