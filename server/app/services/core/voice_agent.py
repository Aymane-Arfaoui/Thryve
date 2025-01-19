from app.models.context import ConversationContext
from app.services.core.observers import VoiceAgentEvent, VoiceAgentObserver
from app.services.core.response_engine import ChatMessageTypes, ResponseEngine
from app.services.definitions.transcriptions import (
    TranscriptionResult,
    TranscriptionService,
)
from app.services.definitions.voiceinterface import StreamingVoiceInterface
from app.utils.misc import remove_trailing_punctuation
import json
from app.utils.audio import AudioConverter
import asyncio
import base64
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


        async def on_audio_generated(audio_b64: str):
            await self.notify_observers(VoiceAgentEvent.AUDIO_GENERATED, base64.b64decode(audio_b64))

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

            if self.voice_context.agent_speaking:
                print("User Interrupted")

                self.voice_interface.set_ignore_incoming_audio(True)
                self.voice_interface.force_flush()
                self.voice_context.interruption = True
                await self.notify_observers(VoiceAgentEvent.INTERRUPTED, True)

            if speech_ended:
                print("Speech ended")
                print("Current transcript: ", self.voice_context.current_transcript)
                self.voice_context.interruption = False
                self.voice_interface.set_ignore_incoming_audio(False)
                self.voice_context.agent_speaking = True
                await self.generate_response(self.voice_context.current_transcript)

            
        
    async def generate_response(self, input: str):

        if not input:
            return

        print("All keyword args: ", {"state" : json.dumps(self.voice_context.call_state), **self.voice_context.const_keyword_args})


        response_gen = self.response_engine.create_response_gen(
            input,
            **{"state" : self.voice_context.call_state, **self.voice_context.const_keyword_args}
        )

        print("Sentence response gen: ", response_gen)

        agent_response = ""

        FLUSH_THRESHOLD_WITH_COMMA = 8
        FLUSH_FIRST_STREAM_THRESHOLD_WITH_COMMA = 4
        FLUSH_THRESHOLD = 20
        FLUSH_FIRST_STREAM_THRESHOLD = 10

        response_to_be_flushed = []
        first_stream_temp = True

        async for text in response_gen:

            if not text:
                continue

            if self.voice_context.interruption:
                print("Interruption detected")
                break

            response_to_be_flushed.append(text)

            if (any(char in text for char in ['.', '?', '!']) 
                        or ',' in text and len(response_to_be_flushed) >= FLUSH_THRESHOLD_WITH_COMMA
                        or ',' in text and first_stream_temp and len(response_to_be_flushed) >= FLUSH_FIRST_STREAM_THRESHOLD_WITH_COMMA
                        or len(response_to_be_flushed) >= FLUSH_THRESHOLD
                        or first_stream_temp and len(response_to_be_flushed) >= FLUSH_FIRST_STREAM_THRESHOLD):
            
                await self.voice_interface.send_audio_request(text, flush = True)
                agent_response += text
                first_stream_temp = False
                response_to_be_flushed = []

            else:
                await self.voice_interface.send_audio_request(text, flush = False)

        self.voice_context.agent_speaking = False
        self.response_engine.add_to_chat_history(agent_response, ChatMessageTypes.AI)

    async def put_raw_audio(self, audio_bytes: bytes):
        await self.stt_service.send_audio(audio_bytes)

    async def start(self):

        await asyncio.gather(self.stt_service.start_connection(), self.voice_interface.start_connection())

    async def stop(self, message : str):
        await self.stt_service.stop_connection()
        await self.voice_interface.stop_connection()
