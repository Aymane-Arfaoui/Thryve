from dataclasses import dataclass
from enum import Enum
from app.services.core.response_tools import vector_store_from_gsheet
from typing import ClassVar, Optional
from langchain_community.vectorstores import FAISS


class Voices(Enum):
    KAJEN = "47zW6C63rcp2Ui4o25NB"

@dataclass(frozen=True)
class Bot:
    id : str
    knowledge_base : Optional[FAISS] = None

@dataclass(frozen=True)
class VoiceBot(Bot):

    sys_prompt : str = ""
    leading_prompt : str = ""
    voice : Voices = Voices.KAJEN

    _voice_bots : ClassVar[dict[str : "VoiceBot"]] = {}       

    def __post_init__(self):
        if self.id in self._voice_bots:
            return
        self._voice_bots[self.id] = self

    @classmethod
    def get_bot(cls, id : str) -> Optional["VoiceBot"]:
        return cls._voice_bots.get(id)
    
@dataclass()
class BotBuilder:
    id : str
    knowledge_base : Optional[FAISS] = None

    def with_gsheet(self, gsheet_url : str):
        self.knowledge_base = vector_store_from_gsheet(gsheet_url)
        return self
    
    def build(self):
        return Bot(id=self.id, knowledge_base=self.knowledge_base)

@dataclass()
class VoiceBotBuilder(BotBuilder):

    sys_prompt : str = ""
    leading_prompt : str = ""
    voice : Voices = Voices.KAJEN

    def with_voice(self, voice : Voices):
        self.voice = voice
        return self
    
    def load_prompts(self):
        with open(f"resources/prompts/{self.id}/main.txt", "r") as f:
            self.sys_prompt = f.read()
        
        return self
        
    def build(self):
        return VoiceBot(id=self.id, knowledge_base=self.knowledge_base, sys_prompt=self.sys_prompt, leading_prompt=self.leading_prompt, voice=self.voice)

MASTER_GSHEET = "https://docs.google.com/spreadsheets/d/1C8wde5O5lF05mmwsRMHcSXkz9_CI-KjTqB5EiGc47Os/edit?usp=sharing"

VoiceBotBuilder("day_call_bot") \
                .with_gsheet(MASTER_GSHEET) \
                .with_voice(Voices.KAJEN) \
                .load_prompts() \
                .build()

VoiceBotBuilder("morning_bot") \
                .with_gsheet(MASTER_GSHEET) \
                .with_voice(Voices.KAJEN) \
                .load_prompts() \
                .build()

VoiceBotBuilder("setup_bot") \
                .with_gsheet(MASTER_GSHEET) \
                .with_voice(Voices.KAJEN) \
                .load_prompts() \
                .build()
    












        
    
    

