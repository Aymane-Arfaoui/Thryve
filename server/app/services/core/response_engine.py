from app.services.definitions.transcriptions import TranscriptionService, TranscriptionResult
from app.services.definitions.voiceinterface import StreamingVoiceInterface
from app.services.core import response_generators as rg
from typing import Any
from langchain_community.vectorstores import VectorStore
from enum import Enum
from dataclasses import dataclass
import re
from app.utils.misc import remove_trailing_punctuation

class ChatMessageTypes(Enum):
    HUMAN = "human"
    AI = "ai"

class ResponseEngine:

    def __init__(self,
                 vector_store : VectorStore,
                 system_prompt : str,
                 leading_prompt : str,
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


@dataclass
class VoiceContext:
    current_transcript : str = ""
    user_speaking : bool = False
    last_final_transcript : str = ""


class VoiceAgentEvent(Enum):
    AUDIO_GENERATED = "audio_generated"

class VoiceAgentObserver:

    def __init__(self):
        self.events_map : dict[VoiceAgentEvent, callable] = {}

    def add_event_listener(self, event : VoiceAgentEvent, func : callable):
        self.events_map[event] = func

    def on_event(self, event : VoiceAgentEvent, data : Any):
        if event in self.events_map:
            self.events_map[event](data)


class VoiceAgent:

    def __init__(self, 
                 stt_service : TranscriptionService,
                 voice_interface : StreamingVoiceInterface,
                 response_engine : ResponseEngine,
                 voice_context : VoiceContext = VoiceContext(),
                 observers : list[VoiceAgentObserver] = []):
        

        self.stt_service = stt_service
        self.voice_interface = voice_interface
        self.response_engine = response_engine
        self.voice_context = voice_context
        self.observers : list[VoiceAgentObserver] = []
        

    async def notify_observers(self, event : VoiceAgentEvent, data : Any):
        for observer in self.observers:
            await observer.on_event(event, data)

    def prepare(self):
        self.stt_service.set_on_transcript_received(self.handle_transcription)

        async def on_audio_generated(audio_bytes : bytes):
            await self.notify_observers(VoiceAgentEvent.AUDIO_GENERATED, audio_bytes)

        self.voice_interface.on_audiogen_response_received(on_audio_generated)


    def should_enable_user_speech(self, transcript : str) -> bool:

        transcript = transcript.strip()

        NO_INTERRUPT_DELIMITERS = ["yeah", "yes", "yep", "okay", "ok"]
        transcript_lower = re.sub(r"[^\w]", "", transcript).lower()
        pattern = "|".join(map(re.escape, NO_INTERRUPT_DELIMITERS))

        if ("".join(re.split(pattern, transcript_lower)).strip() == "" 
                    or set(transcript_lower).issubset({"u", "h", "m"})):
                    
                    self.voice_context.last_final_transcript = "" 
                    return False
    
        
        if len(transcript) > 0:

            strings_to_ignore = {"", "h", "uh", "ah", "um", "hm", "u", "a"}
            transcript_without_h = (
                remove_trailing_punctuation(transcript_lower).strip().rstrip("h")
            )
            transcript_without_m = (
                remove_trailing_punctuation(transcript_lower).strip().rstrip("m")
            )

            transcript_set: set = set(transcript_without_h.split()).union(
                set(transcript_without_m.split())
            )

            if transcript_set.issubset(strings_to_ignore):
                return False
                    
            return True


    async def handle_transcription(self, result : Any, parser : callable):

        transcription_result : TranscriptionResult = parser(result)
        transcript, is_final, speech_ended, confidence = transcription_result
        

        if is_final:
            self.voice_context.last_final_transcript += transcript
            self.voice_context.current_transcript = self.voice_context.last_final_transcript
            self.voice_context.last_final_transcript = ""

        else:
            self.voice_context.current_transcript = self.voice_context.last_final_transcript + transcript

        if self.should_enable_user_speech(transcript):
            self.voice_context.user_speaking = True

        if speech_ended:
            self.voice_context.user_speaking = False
            await self.generate_response(self.voice_context.current_transcript)

    async def generate_response(self, input : str):
        sentence_response_gen = self.response_engine.create_sentence_response_gen(input)

        agent_response = ""

        async for sentence in sentence_response_gen:
            if self.voice_context.user_speaking:
                break
            else:
                self.voice_interface.send_audio_request(sentence)
                agent_response += sentence

        self.response_engine.add_to_chat_history(agent_response, ChatMessageTypes.AI)

    def put_raw_audio(self, audio_bytes : bytes):
        self.stt_service.send_audio(audio_bytes)

    async def start(self):
        
        self.stt_service.start_connection()
        self.voice_interface.start_connection()

    


