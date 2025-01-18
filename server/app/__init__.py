from aiohttp import web
from app.middlewares import setup_middlewares
from app.routes import setup_routes

def create_app() -> web.Application:
    app = web.Application()
    
    setup_middlewares(app)
    setup_routes(app)
    
    return app

async def init_app():
    app = create_app()
    return app
