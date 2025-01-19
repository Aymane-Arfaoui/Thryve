from aiohttp import web
from app import init_app
import os

if __name__ == "__main__":
    application = init_app()
<<<<<<< HEAD
    web.run_app(application, port=int(os.getenv("PORT", 5000)))
=======
    web.run_app(application, port=int(os.getenv("PORT", 5001)))
>>>>>>> main


