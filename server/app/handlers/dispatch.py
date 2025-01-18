from aiohttp import web
from app.services.ext.twilio import TwimlStreamBuilder
from twilio.rest import Client
from config import HOST_DOMAIN

async def dispatch_call(request : web.Request):
    
    json_body : dict = await request.json()
    target_phone_number = json_body.get("target_phone_number")

    twiml_builder = TwimlStreamBuilder()
    twiml_builder.with_ws_url(f"{HOST_DOMAIN}/call")
    twiml_builder.with_params(To=target_phone_number)
    twiml_response = twiml_builder.build()

    client = Client()

    call = client.calls.create(
        to=target_phone_number,
        from_="+1 855 910 0592",
        twiml=twiml_response.to_xml()
    )

    return web.json_response({"call_id": call.sid})