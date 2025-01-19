import requests
from config import HOST_DOMAIN

requests.post(
    f"{HOST_DOMAIN}/dispatch",
    json={
        "target_phone_number": "+16475148397",
        "custom_params": {
            "user_id" : "123",
            "bot_id" : "morning_bot",
            "first_name": "John",
            "goals" : """
            Goal 1: Get a job
            Goal 2: Get a girlfriend
            """,
            "actions" : """
            Action 1: Go to the gym
            Action 2: Apply to 10 jobs
            """
        },
    },
)
