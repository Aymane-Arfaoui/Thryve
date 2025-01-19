from app.services.core.LogisticRegressionModel import GoalPredictionModel
from aiohttp import web

async def get_goal_prediction(request):
    try:
        model = GoalPredictionModel()
        prediction = model.predict_tomorrow()
        return web.json_response(prediction)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)
