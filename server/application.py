from aiohttp import web
from app import init_app
import os

if __name__ == "__main__":
    application = init_app()
    web.run_app(application, port=os.getenv("PORT", 5000))


