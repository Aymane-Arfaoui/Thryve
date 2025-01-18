from typing import NamedTuple, Any
from abc import ABC, abstractmethod

class TranscriptionResult(NamedTuple):
    transcript : str
    is_transcription_final : bool
    speech_ended : bool
    confidence : float 

class TranscriptionService(ABC):

    @abstractmethod
    def set_on_transcript_received(self, func : callable) -> None:
        pass

    @abstractmethod
    def transcription_parser(self, result : Any) -> TranscriptionResult:
        pass

    @abstractmethod
    def start_connection(self) -> None:
        pass

    @abstractmethod
    def stop_connection(self) -> None:
        pass
