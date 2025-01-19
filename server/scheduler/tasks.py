from celery_app import celery_app
from app.services.core.userdata import UserDataService
from app.models.user import User
import requests
from datetime import datetime
from pytz import timezone
from config import HOST_DOMAIN

@celery_app.task(name="scheduler.tasks.schedule_daily_calls")
def schedule_daily_calls():
    for user in UserDataService.get_all_users():
        print(user)
        schedule_call.apply_async(
            args=[user.id], 
            eta=timezone('US/Eastern').localize(
                datetime.now().replace(hour=8, minute=0, second=0, microsecond=0)
            )
        )

@celery_app.task(name="scheduler.tasks.schedule_call")
def schedule_call(user_id: str):
    user_data_service = UserDataService()
    user_data_service.load_data_from_id(user_id)
    requests.post(f"{HOST_DOMAIN}/dispatch", json={
        "target_phone_number": user_data_service.data.phone_number,
        "custom_params": {
            "user_id": user_id,
            "bot_id": "morning_bot",
            "first_name": user_data_service.data.first_name,
        },
    })

# Test schedule
schedule_call.apply_async(
    args=["9150f849-1d01-4df8-bc5c-90d868a51536"], 
    eta=timezone('US/Eastern').localize(
        datetime.now().replace(hour=3, minute=6, second=0, microsecond=0)
    )
)