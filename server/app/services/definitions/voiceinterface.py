from abc import ABC, abstractmethod
from app.services.definitions.call_elements import CallElement

class StreamingVoiceInterface(CallElement, ABC):

    @abstractmethod
    def set_ignore_incoming_audio(self) -> None:
        pass

    @abstractmethod
    def on_audiogen_response_received(self, func : callable) -> None:
        pass

    @abstractmethod
    async def start_connection(self) -> None:
        pass

    @abstractmethod
    async def stop_connection(self) -> None:
        pass

    @abstractmethod
    async def send_audio_request(self, 
                           text : str, 
                           flush : bool = False) -> None:
        pass

    @abstractmethod
    async def force_flush(self, *args):
        pass