from app.models.context import ConversationContext
from app.services.definitions.call_elements import CallElement
from app.models.bot import VoiceBot
import json

class CallInitializer:

    def __init__(self, 
                 call_context : ConversationContext,
                 call_elements : list[CallElement]):
        self.call_context = call_context
        self.call_elements = call_elements

    async def initialize_call(self, start_data : dict):
        
        self.call_context.call_id = start_data.get("callSid")
        
        custom_params = start_data.get("customParameters", {})
        
        self.call_context.user_id = custom_params.pop("user_id")
        bot_id = custom_params.pop("bot_id")

        print("Bot id: ", bot_id)

        self.call_context.bot = VoiceBot.get_bot(bot_id)

        print("Bot: ", self.call_context.bot)

        self.call_context.const_keyword_args = custom_params
        self.call_context.const_keyword_args = start_data.get("customParameters", {})



        for key, value in self.call_context.const_keyword_args.items():

            print("Key: ", key, "Value: ", value)

            if isinstance(value, str):
                try:
                    self.call_context.const_keyword_args[key] = json.loads(value.strip())
                except Exception as e   :
                    print("Error loading json: ", value, "Error: ", e)
                pass

        print("Const keyword args: ", self.call_context.const_keyword_args)

        for call_element in self.call_elements:
            await call_element.initialize_from_start_data(self.call_context)


