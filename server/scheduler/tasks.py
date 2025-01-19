from celery_app import celery_app
from app.services.core.userdata import UserDataService
from app.models.user import User
import requests
from datetime import datetime
from pytz import timezone
from config import HOST_DOMAIN

@celery_app.task(name="scheduler.tasks.schedule_daily_calls")
def schedule_daily_calls():

    print("\nIt's midnight! Time to schedule calls with my clients in the morning!\n")

    for user in UserDataService.get_all_users():
        print(user)

        datetime_now = datetime.now().replace(hour=8, minute=0, second=0, microsecond=0)
        schedule_call.apply_async(
            args=[user.id, "morning_bot"], 
            eta=timezone('US/Eastern').localize(
                datetime_now
            )
        )

        print(f"Scheduled a call for user {user.id} at {datetime_now}")

        datetime_now = datetime.now().replace(hour=16, minute=0, second=0, microsecond=0)
        schedule_call.apply_async(
            args=[user.id, "day_call_bot"], 
            eta=timezone('US/Eastern').localize(
                datetime_now
            )
        )

        print(f"Scheduled a Follow up call for user {user.id} at {datetime_now}")

@celery_app.task(name="scheduler.tasks.schedule_call")
def schedule_call(user_id: str, bot_id: str):
    user_data_service = UserDataService()
    user_data_service.load_data_from_id(user_id)

    print(f"\n **Time to dial user {user_id}! **")
    
    if not user_data_service.data.phone_number:
        print(f"Aw man, no phone number found for user {user_id}")
        return

    response = requests.post(f"{HOST_DOMAIN}/dispatch", json={
        "target_phone_number": user_data_service.data.phone_number,
        "custom_params": {
            "user_id": user_id,
            "bot_id": bot_id,
            "first_name": user_data_service.data.first_name,
        },
    })

    print(f"Response from dispatch: {response.status_code}")



# Test schedule
schedule_call.apply_async(
    args=["9150f849-1d01-4df8-bc5c-90d868a51536"], 
    eta=timezone('US/Eastern').localize(
        datetime.now().replace(hour=3, minute=6, second=0, microsecond=0)
    )
)