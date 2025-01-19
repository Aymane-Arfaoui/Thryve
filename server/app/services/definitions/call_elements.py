from abc import ABC, abstractmethod
from app.models.context import ConversationContext
class CallElement(ABC):

    @abstractmethod
    async def initialize_from_start_data(self, conversation_context : ConversationContext):
        pass