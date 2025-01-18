
from aiohttp import web
import json
from app.services.core.observers import CallObserver, CallEvent
import base64
from app.utils.audio import convert_mulaw_to_b64
from typing import Any
from twilio.twiml.voice_response import VoiceResponse, Pause, Say, Start,Connect, Parameter, Play, Conference, Dial
from twilio.rest import Client


class TwilioCallStreamClient:

    def __init__(self, call_observers : list[CallObserver]):
        self.ws = web.WebSocketResponse()
        self.stream_sid = None
        self.call_observers = call_observers
        

    async def notify_observers(self, event : CallEvent, data : Any):
        for observer in self.call_observers:
            await observer.on_event(event, data)

    async def start_connection(self, request : web.Request):
        await self.ws.prepare(request)

        async for msg in self.ws:
            if msg.type == web.WSMsgType.TEXT:
                data : dict = json.loads(msg.data)
                event = data.get("event")

                if event == 'start':
                    start_data = data.get("start")
                    self.stream_sid = start_data.get("streamSid")
                    await self.notify_observers(CallEvent.CALL_STARTED, start_data)
                    
                elif event == 'media':
                    media_data = data.get("media", {}).get("payload", "")
                    await self.notify_observers(CallEvent.AUDIO_CHUNK, 
                                                base64.b64decode(media_data))  
                elif event == 'stop':
                    await self.notify_observers(CallEvent.CALL_ENDED, "stopped")


            elif msg.type == web.WSMsgType.ERROR:
                print(f"Error: {msg.data}")


    async def send_clear(self, *args):
        clear_msg = {"event": "clear", "streamSid": self.stream_sid}
        print("sending clear message")
        await self.ws.send_str(json.dumps(clear_msg))

    async def send_audio(self, audio_data : bytes):
        
        converted_chunk = convert_mulaw_to_b64(audio_data)
        message = {
            "event": "media",
                "streamSid": self.stream_sid,
                "media": {"payload": converted_chunk},
            }
        
        await self.ws.send_str(json.dumps(message))

class TwimlStreamBuilder:

    def __init__(self):
        self.response = VoiceResponse()
        self.connect = None
        self.stream_element = None
    
    def with_ws_url(self, ws_url : str):
        self.connect = Connect()
        self.stream_element = self.connect.stream(url = ws_url)

    def with_params(self, **kwargs):
        for key, value in kwargs.items():
            param = Parameter(name=key, value=value)
            self.stream_element.append(param)

    def build(self):
        self.response.append(self.connect)
        self.response.append(Pause(length="1000"))
        return self.response
