from aiohttp import web
from aiohttp.web import middleware
from aiohttp.web_exceptions import HTTPException
import logging

# Setup logging
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

@middleware
async def error_middleware(request, handler):
    try:
        return await handler(request)
    except HTTPException as ex:
        # Log and return HTTP exceptions (400, 401, 404, etc.)
        logger.error(f"HTTP Exception: {ex.status} - {ex.reason}")
        return web.json_response(
            {'error': ex.reason},
            status=ex.status
        )
    except Exception as ex:
        # Log unexpected errors
        logger.error(f"Unexpected error: {str(ex)}", exc_info=True)
        return web.json_response(
            {'error': 'Internal Server Error'},
            status=500
        )

def setup_middlewares(app: web.Application):
    app.middlewares.append(error_middleware) 