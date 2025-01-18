from typing import NamedTuple, Any
from abc import ABC, abstractmethod
from app.services.definitions.call_elements import CallElement

class TranscriptionResult(NamedTuple):
    transcript : str
    is_transcription_final : bool
    speech_ended : bool
    confidence : float 

class TranscriptionService(CallElement, ABC):

    @abstractmethod
    def set_on_transcript_received(self, func : callable) -> None:
        pass

    @abstractmethod
    def transcription_parser(self, result : Any) -> TranscriptionResult:
        pass

    @abstractmethod
    async def start_connection(self) -> None:
        pass

    @abstractmethod
    async def stop_connection(self) -> None:
        pass

    @abstractmethod
    async def send_audio(self, audio_bytes : bytes) -> None:
        pass
