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
            "long_term_goals": {
                "goal1": "Get a job",
                "goal2": "get a girlfriend",
                "action1": "Go to the gym",
                "action2": "Apply to 10 jobs",
            },
        },
    },
)
