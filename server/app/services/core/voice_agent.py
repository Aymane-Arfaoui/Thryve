from server.app.models.context import ConversationContext
from server.app.services.core.observers import VoiceAgentEvent, VoiceAgentObserver
from server.app.services.core.response_engine import ChatMessageTypes, ResponseEngine
from server.app.services.definitions.transcriptions import (
    TranscriptionResult,
    TranscriptionService,
)
from server.app.services.definitions.voiceinterface import StreamingVoiceInterface
from server.app.utils.misc import remove_trailing_punctuation
import json
from utils.audio import AudioConverter
import asyncio

import re
from typing import Any


class VoiceAgent:

    def __init__(
        self,
        stt_service: TranscriptionService,
        voice_interface: StreamingVoiceInterface,
        response_engine: ResponseEngine,
        audio_converter : AudioConverter,
        voice_context: ConversationContext,
        observers: list[VoiceAgentObserver] = [],
        
    ):

        self.stt_service = stt_service
        self.voice_interface = voice_interface
        self.response_engine = response_engine
        self.voice_context = voice_context
        self.observers: list[VoiceAgentObserver] = observers
        self.audio_converter = audio_converter  

    async def notify_observers(self, event: VoiceAgentEvent, data: Any):
        for observer in self.observers:
            await observer.on_event(event, data)

    def prepare(self):
        self.stt_service.set_on_transcript_received(self.handle_transcription)

        async def on_audio_generated(audio_bytes: bytes):
            await self.notify_observers(VoiceAgentEvent.AUDIO_GENERATED, self.audio_converter.convert_mp3_to_b64mulaw(audio_bytes))

        self.voice_interface.on_audiogen_response_received(on_audio_generated)

    def should_enable_user_speech(self, transcript: str) -> bool:

        transcript = transcript.strip()

        NO_INTERRUPT_DELIMITERS = ["yeah", "yes", "yep", "okay", "ok"]
        transcript_lower = re.sub(r"[^\w]", "", transcript).lower()
        pattern = "|".join(map(re.escape, NO_INTERRUPT_DELIMITERS))

        if "".join(re.split(pattern, transcript_lower)).strip() == "" or set(
            transcript_lower
        ).issubset({"u", "h", "m"}):

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

    async def handle_transcription(self, result: Any, parser: callable):

        transcription_result: TranscriptionResult = parser(result)
        transcript, is_final, speech_ended, confidence = transcription_result

        if is_final:
            self.voice_context.last_final_transcript += transcript
            self.voice_context.current_transcript = (
                self.voice_context.last_final_transcript
            )
            self.voice_context.last_final_transcript = ""

        else:
            self.voice_context.current_transcript = (
                self.voice_context.last_final_transcript + transcript
            )

        if self.should_enable_user_speech(transcript):
            self.voice_context.user_speaking = True
            await self.notify_observers(VoiceAgentEvent.USER_SPEAKING, True)

        if speech_ended:
            self.voice_context.user_speaking = False
            await self.generate_response(self.voice_context.current_transcript)

    async def generate_response(self, input: str):
        sentence_response_gen = self.response_engine.create_sentence_response_gen(
            input,
            **{"state" : json.dumps(self.voice_context.call_state), **self.voice_context.const_keyword_args}
        )

        agent_response = ""

        async for sentence in sentence_response_gen:
            if self.voice_context.user_speaking:
                break
            else:
                await self.voice_interface.send_audio_request(sentence)
                agent_response += sentence

        self.response_engine.add_to_chat_history(agent_response, ChatMessageTypes.AI)

    def put_raw_audio(self, audio_bytes: bytes):
        self.stt_service.send_audio(audio_bytes)

    async def start(self):

        await asyncio.gather(self.stt_service.start_connection(), self.voice_interface.start_connection())

    async def stop(self, message : str):
        await self.stt_service.stop_connection()
        await self.voice_interface.stop_connection()
