from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    LiveTranscriptionEvents,
    LiveOptions,
)
from config import DEEPGRAM_API_KEY



DEEPGRAM_CLIENT = DeepgramClient(api_key=DEEPGRAM_API_KEY,
                                 )

class DeepgramTranscriptionService():

    def __init__(self):
        self.options = self._get_default_stream_options()
        self.dg_connection = DEEPGRAM_CLIENT.listen.asyncwebsocket.v("1")

    def set_message_handler(self, message : LiveTranscriptionEvents, async_func : callable):
        self.dg_connection.on(message, async_func)

    async def start_connection(self):
        await self.dg_connection.start(self.options)

    async def stop_connection(self):
        await self.dg_connection.finish()

    async def send_audio(self, audio_data: bytes):
        await self.dg_connection.send(audio_data)

    @staticmethod
    def _get_default_stream_options():
        options = LiveOptions(
                    model="nova-2-phonecall",
                    punctuate=True,
                    language="en-US",
                    encoding="mulaw",
                    channels=1,
                    sample_rate=8000,
                    endpointing=1,
                    vad_events=True,
                    interim_results=True,
                )
        return options
