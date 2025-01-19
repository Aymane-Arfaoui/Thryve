from aiohttp import web
from app.handlers.dispatch import dispatch_call
from app.handlers.call import call_handler
from app.services.core.MLModels.getPredictions import get_goal_prediction


def setup_routes(app: web.Application):
    app.router.add_post("/dispatch", dispatch_call)
    app.router.add_get("/call", call_handler)
    app.router.add_get("/predict-goals", get_goal_prediction)