from abc import ABC, abstractmethod

class StreamingVoiceInterface(ABC):


    @abstractmethod
    def on_audiogen_response_received(self, func : callable) -> None:
        pass

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