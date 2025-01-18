from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    LiveTranscriptionEvents,
    LiveResultResponse,
    LiveOptions,
)
from config import DEEPGRAM_API_KEY
from abc import ABC
from typing import NamedTuple
from app.services.definitions.transcriptions import TranscriptionResult


DEEPGRAM_CLIENT = DeepgramClient(api_key=DEEPGRAM_API_KEY,
                                 )

class DeepgramTranscriptionService():

    def __init__(self):
        self.options = self._get_default_stream_options()
        self.dg_connection = DEEPGRAM_CLIENT.listen.asyncwebsocket.v("1")

    def set_on_transcript_received(self, func : callable):

        async def on_result_func(_, result : LiveResultResponse):
            await func(result, self.transcription_parser)


        self.dg_connection.on(LiveTranscriptionEvents.Transcript, 
                              on_result_func)

    def transcription_parser(self, result : LiveResultResponse):
        # print("Parsing Transcription result: ", result)
        transcript = result.channel.alternatives[0].transcript
        is_final = result.is_final
        speech_final = result.speech_final
        confidence = result.channel.alternatives[0].confidence < 0.67
    
        return TranscriptionResult(transcript, is_final, speech_final, confidence)



    async def start_connection(self):
        await self.dg_connection.start(self.options)

    async def stop_connection(self):
        await self.dg_connection.finish()

    async def send_audio(self, audio_data: bytes):
        await self.dg_connection.send(audio_data)

    async def initialize_from_start_data(self, data : dict):
        pass   

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

    
    

