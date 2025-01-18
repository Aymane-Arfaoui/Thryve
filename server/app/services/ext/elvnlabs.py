
import websockets
import websockets.connection
import asyncio
import json
from config import ELEVENLABS_API_KEY
from app.services.definitions.voiceinterface import StreamingVoiceInterface
from enum import Enum

ELEVENLABS_STREAM_URL = "wss://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}/stream-input"

class ElevenLabsVoices(Enum):
    KAJEN = "47zW6C63rcp2Ui4o25NB"

class ElevenLabsClient(StreamingVoiceInterface):

    def __init__(self, voice_id: ElevenLabsVoices):
        self.voice_id = voice_id
        self.stream_url = ELEVENLABS_STREAM_URL
        self.options = self._get_default_options()
        self.ws_connection : websockets.WebSocketClientProtocol = None
        self.started = False
        self.on_audio_received_callback = None   



    async def start_connection(self):
        stream_url = self.stream_url.format(ELEVENLABS_VOICE_ID=self.voice_id.value) + "?" + "&".join([f"{key}={value}" for key, value in self.options.items()])
        async with websockets.connect(stream_url) as ws:
            self.ws_connection = ws
            self.started = True
            await self._receive_message()

    async def stop_connection(self):
        if not self.started:
            return
        await self.ws_connection.close()
        self.started = False

    async def _receive_message(self):

        if not self.started:
            return
        try:
            async for msg in self.ws_connection:
                response : dict = json.loads(msg)

                if response.get('audio') and self.on_audio_received_callback:
                    self.on_audio_received_callback(response['audio'])
        except websockets.exceptions.ConnectionClosed as e:
            print(f"Connection closed: {e}")
            await self.ws_connection.close()

    async def send_audio_request(self, text, flush=False):
        print(f"Sending request to elevenlabs: {text}")


        while not self.started:
            await asyncio.sleep(0.1)

        await self.ws_connection.send(json.dumps({
                "text": text + " " * (flush),
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "use_speaker_boost": False},
                "xi_api_key": ELEVENLABS_API_KEY,
                "flush": flush
            }))

    @staticmethod
    def _get_default_options():
        return {
            "model_id": "eleven_flash_v2_5",
            "output_format": "ulaw_8000",
            "inactivity_timeout": 180
        }
    

