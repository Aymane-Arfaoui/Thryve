from enum import Enum
from dotenv import load_dotenv
import os
from typing import NamedTuple, TypedDict


load_dotenv()

class AzureModels(Enum):
    gpt_4o = "gpt-4o"
    gpt_4o_mini = "gpt-4o-mini"
    ada_embeddings = "text-embedding-ada-002"

class AzureModelConfig(NamedTuple):
    api_key: str
    endpoint: str
    api_version: str

AZURE_MODELS  = {
    AzureModels.gpt_4o : AzureModelConfig(
        api_key=os.getenv("AZURE_KEY_AI_gpt4o"),
        endpoint=os.getenv("AZURE_ENDPOINT_AI_gpt4o"),
        api_version="2024-08-01-preview"
    ),
    AzureModels.gpt_4o_mini: AzureModelConfig(
        api_key=os.getenv("AZURE_KEY_AI_gpt4omini"),
        endpoint=os.getenv("AZURE_ENDPOINT_AI_gpt4omini"),
        api_version="2024-08-01-preview"
    ),
    AzureModels.ada_embeddings: AzureModelConfig(
        api_key=os.getenv("AZURE_KEY_ADA_EMBEDDINGS"),
        endpoint=os.getenv("AZURE_ENDPOINT_ADA_EMBEDDINGS"),
        api_version="2023-03-15-preview"
    ),
}

HOST_DOMAIN = "https://ffb2-34-130-234-203.ngrok-free.app"

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")