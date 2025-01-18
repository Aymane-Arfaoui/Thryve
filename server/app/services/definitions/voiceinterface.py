from abc import ABC, abstractmethod

class StreamingVoiceInterface(ABC):

    @abstractmethod
    def start_connection(self) -> None:
        pass

    @abstractmethod
    def stop_connection(self) -> None:
        pass

    @abstractmethod
    def send_audio_request(self, 
                           text : str, 
                           flush : bool = False) -> None:
        pass