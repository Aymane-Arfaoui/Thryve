from dataclasses import dataclass, field
from app.services.core import response_generators as rg
from langchain_core.messages import HumanMessage

@dataclass
class ConversationContext:
    current_transcript : str = ""
    user_speaking : bool = False
    last_final_transcript : str = ""
    user_id : str = ""
    call_id : str = ""
    system_prompt : str = "" 
    leading_prompt : str = ""
    const_keyword_args : dict = field(default_factory=dict)
    call_state : dict = field(default_factory=dict)
    final_chat_history : rg.ChatMessageHistory = field(default_factory=rg.ChatMessageHistory)
    
    async def parse_twilio_start_data(self, data : dict):
        self.call_id = data.get("callSid")
        custom_params = data.get("customParameters", {})
        
        self.user_id = custom_params.pop("user_id")
        self.const_keyword_args = custom_params

        # ADD LOGIC TO LOAD PROMPTS HERE 