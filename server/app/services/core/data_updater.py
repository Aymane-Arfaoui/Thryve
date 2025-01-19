from app.models.context import ConversationContext
from app.services.core import response_tools as rg
from langchain_core.messages import (
    HumanMessage,
    AIMessage,
    SystemMessage,
    AIMessageChunk,
)
import app.evaluation as evaluation

class DataUpdateService:
    def __init__(self, 
                 context : ConversationContext):
        self.context = context


    async def update_data(self, final_chat_history : rg.ChatMessageHistory):
        # Get a transcript from the final chat history
        transcript = ""

        for message in final_chat_history.messages:
            if isinstance(message, HumanMessage):
                transcript += f"User: {message.content}\n"
            elif isinstance(message, AIMessage):
                transcript += f"Coach: {message.content}\n"
        
        print(transcript)
        # Get the goals and actions from the transcript and update the database
        evaluation.setup_up_call_update(transcript, self.context.user_id)




# # ## TESTING
# async def main():
#     conversation_context = ConversationContext()
#     conversation_context.user_id = "example_user_id"

#     # Generate a chat history
#     chat_history = rg.ChatMessageHistory()
#     chat_history.add_ai_message("Hello, how are you?")
#     chat_history.add_user_message("I'm good, thanks for asking.")
#     chat_history.add_ai_message("What's your name?")
#     chat_history.add_user_message("My name is John.")
#     chat_history.add_ai_message("Nice to meet you, John. How can I help you today?")
#     chat_history.add_user_message("I'm looking for a new job.")
#     chat_history.add_ai_message("That's great! What kind of job are you looking for?")
#     chat_history.add_user_message("I'm looking for a job in the tech industry. I have an addiciton to vaping and I really want to quit. This year it's my goal to be healthy and quit vaping.")
#     chat_history.add_ai_message("Awesome! What kind of skills do you have?")
#     chat_history.add_user_message("I have experience in Python, Java, and SQL. I want to quit vaping by taking up drinking water and meditating.")
#     chat_history.add_ai_message("Ok that's great, what habits do you want to take up each day")
#     chat_history.add_user_message("I want to drink water and meditate every single day.")

#     new_updater = DataUpdateService(conversation_context)
#     await new_updater.update_data(chat_history)

# if __name__ == "__main__":
#     import asyncio
#     asyncio.run(main())