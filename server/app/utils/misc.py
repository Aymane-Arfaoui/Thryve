from json import loads
import string
import pandas as pd

def remove_trailing_punctuation(input_string: str) -> str:
    punctuation_set = set(string.punctuation)
    for i in range(len(input_string) - 1, -1, -1):
        char = input_string[i]
        if char not in punctuation_set:
            return input_string[: i + 1]

    return ""

def read_gsheet(sheet_url : str) -> pd.DataFrame:
    
    if "/view" in sheet_url:
        file_id = sheet_url.split("/d/")[1].split("/view")[0]
    elif "edit" in sheet_url:
        file_id = sheet_url.split("/d/")[1].split("/edit")[0]
        
    download_url = (
            f"https://docs.google.com/spreadsheets/d/{file_id}/export?format=csv"
    )

    return pd.read_csv(download_url)


def is_json_serializable(obj):
    try:
        loads(obj)
        return True
    except (TypeError, ValueError):
        return False