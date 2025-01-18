from aiohttp import web
from app.handlers.dispatch import dispatch_call
from app.handlers.call import call_handler

def setup_routes(app: web.Application):
    app.router.add_post("/dispatch", dispatch_call)
    app.router.add_get("/call", call_handler)