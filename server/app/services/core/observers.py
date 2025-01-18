from enum import Enum
from typing import Any

class Observer:

    def __init__(self):
        self.events_map : dict[Any, callable] = {}

    def add_event_listener(self, event : Any, func : callable):
        self.events_map[event] = func

    async def on_event(self, event : Any, data : Any):
        if event in self.events_map:
            await self.events_map[event](data)

class VoiceAgentEvent(Enum):
    AUDIO_GENERATED = "audio_generated"
    USER_SPEAKING = "user_speaking"
class VoiceAgentObserver(Observer):

    def __init__(self):
        self.events_map : dict[VoiceAgentEvent, callable] = {}

    def add_event_listener(self, event : VoiceAgentEvent, func : callable):
        super().add_event_listener(event, func)

class CallEvent(Enum):
    CALL_STARTED = "call_started"
    CALL_ENDED = "call_ended"
    AUDIO_CHUNK = "audio_chunk"
    


class CallObserver(Observer):

    def __init__(self):
        self.events_map : dict[CallEvent, callable] = {}

    def add_event_listener(self, event : CallEvent, func : callable):
        super().add_event_listener(event, func)



