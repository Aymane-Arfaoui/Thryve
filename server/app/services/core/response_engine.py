from app.services.ext.elvnlabs import ElevenLabsClient
from app.services.definitions.transcriptions import TranscriptionService
from app.services.definitions.voiceinterface import StreamingVoiceInterface

class ResponseEngine:

    def __init__(self, 
                 stt_service : TranscriptionService,
                 voice_interface : StreamingVoiceInterface):
        

        self.stt_service = stt_service
        self.voice_interface = voice_interface


