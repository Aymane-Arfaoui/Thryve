from dataclasses import dataclass, field
from app.services.core import response_tools as rg
from app.models.bot import VoiceBot

@dataclass
class ConversationContext:
    current_transcript : str = ""
    interruption : bool = False
    agent_speaking : bool = False
    last_final_transcript : str = ""
    user_id : str = ""
    call_id : str = ""
    system_prompt : str = "" 
    leading_prompt : str = ""
    const_keyword_args : dict = field(default_factory=dict)
    call_state : dict = field(default_factory=dict)
    final_chat_history : rg.ChatMessageHistory = field(default_factory=rg.ChatMessageHistory)
    bot : VoiceBot = None