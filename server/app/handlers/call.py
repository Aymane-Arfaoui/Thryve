from aiohttp import web
from app.services.ext.twilio import TwilioCallStreamClient
from app.services.core.observers import CallObserver, VoiceAgentObserver, CallEvent, VoiceAgentEvent
from app.services.core.voice_agent import VoiceAgent
from app.services.ext.elvnlabs import ElevenLabsClient, ElevenLabsVoices
from app.services.ext.dpgram import DeepgramTranscriptionService
from app.models.context import ConversationContext
from app.services.core.response_engine import ResponseEngine
from app.utils.audio import AudioConverter
import asyncio


async def parse_start_data(data : dict):


    return ConversationContext(user_id=data.get("user_id"), call_id=data.get("call_id"))

async def call_handler(request : web.Request):
    
    call_context = ConversationContext()
    audio_converter = AudioConverter()
    call_observer = CallObserver()
    voice_agent_observer = VoiceAgentObserver()

    deepgram_stt_service = DeepgramTranscriptionService()
    elevenlabs_voice_interface = ElevenLabsClient(ElevenLabsVoices.KAJEN)
    response_engine = ResponseEngine()

    call_stream_client = TwilioCallStreamClient([call_observer])
    voice_agent = VoiceAgent(deepgram_stt_service, 
                             elevenlabs_voice_interface, 
                             response_engine, 
                             audio_converter,
                             call_context,
                             [voice_agent_observer])

    call_observer.add_event_listener(CallEvent.CALL_STARTED, call_context.parse_twilio_start_data)
    call_observer.add_event_listener(CallEvent.CALL_STARTED, response_engine.initialize_from_start_data)
    call_observer.add_event_listener(CallEvent.CALL_STARTED, elevenlabs_voice_interface.initialize_from_start_data)
    call_observer.add_event_listener(CallEvent.CALL_STARTED, deepgram_stt_service.initialize_from_start_data)
    
    call_observer.add_event_listener(CallEvent.AUDIO_CHUNK, voice_agent.put_raw_audio)
    call_observer.add_event_listener(CallEvent.CALL_ENDED, voice_agent.stop)

    voice_agent_observer.add_event_listener(VoiceAgentEvent.AUDIO_GENERATED, call_stream_client.send_audio)

    voice_agent.prepare()

    await asyncio.gather(voice_agent.start(), call_stream_client.start_connection(request))

    return call_stream_client.ws
