import requests
from config import HOST_DOMAIN

requests.post(
    f"{HOST_DOMAIN}/dispatch",
    json={
        "target_phone_number": "+0000000000",
        "custom_params": {
            "user_id" : "64d59467-5d45-4fa0-ba25-b967abdcdc29",
            "bot_id" : "setup_bot",
            "first_name": "Michael",
        },
    },
)
