
from config import AzureModels, AZURE_MODELS
import json
import requests
from langchain_openai import AzureChatOpenAI
from langchain_openai import AzureOpenAIEmbeddings


def get_azure_model_data(model: AzureModels):
    return AZURE_MODELS[model]

def get_llm(model: AzureModels):
    azure_model_data = get_azure_model_data(model)
    return AzureChatOpenAI(
        azure_endpoint=azure_model_data.endpoint,
        api_key=azure_model_data.api_key,
        api_version=azure_model_data.api_version,
        azure_deployment=model.value,
        streaming=True

    )

def get_embeddings(model: AzureModels):
    azure_model_data = get_azure_model_data(model)
    return AzureOpenAIEmbeddings(api_key=azure_model_data.api_key, 
                                 azure_endpoint=azure_model_data.endpoint,
                                 azure_deployment=model.value,
                                 api_version=azure_model_data.api_version,
                                 )

