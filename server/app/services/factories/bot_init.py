
from app.services.factories.bot_builder import VoiceBotBuilder
from app.models.bot import Voices

MASTER_GSHEET = "https://docs.google.com/spreadsheets/d/1C8wde5O5lF05mmwsRMHcSXkz9_CI-KjTqB5EiGc47Os/edit?usp=sharing"

def init_bots():

    print("Initializing bots")
    VoiceBotBuilder("day_call_bot") \
                .with_gsheet(MASTER_GSHEET) \
                .with_voice(Voices.KAJEN) \
                .load_prompts() \
                .build()

    VoiceBotBuilder("morning_bot") \
                    .with_gsheet(MASTER_GSHEET) \
                    .with_voice(Voices.KAJEN) \
                    .load_prompts() \
                    .build()

    VoiceBotBuilder("setup_bot") \
                    .with_gsheet(MASTER_GSHEET) \
                    .with_voice(Voices.KAJEN) \
                    .load_prompts() \
                    .build()
