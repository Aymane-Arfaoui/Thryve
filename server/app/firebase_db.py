import firebase_admin
from firebase_admin import credentials, firestore
from firebase_admin import storage
import json

cred = credentials.Certificate("server/app/firebase_creds.json")
firebase_admin.initialize_app(cred)


# Function to create a new user with long term goals
def create_document_in_bucket(user_id: str, long_term_goals: list):
    # Get Firestore client
    db = firestore.client()
    collection_name = "user_goals"

    # Document data
    document_data = {
        "long_term_goals": long_term_goals
    }

    # Create document in the specified collection
    doc_ref = db.collection(collection_name).document(user_id)
    doc_ref.set(document_data)

    return f"Document with user_id '{user_id}' created successfully in '{collection_name}' collection."

# USER_ID = "example_user_id"
# LONG_TERM_GOALS = ["Quit", "Start"]

# response = create_document_in_bucket(USER_ID, LONG_TERM_GOALS)
# print(response)

# Function to get the user's long term goals
def get_long_term_goals(user_id: str):
    db = firestore.client()
    collection_name = "user_goals"
    doc_ref = db.collection(collection_name).document(user_id)
    doc = doc_ref.get()
    return doc.to_dict()["long_term_goals"]

# long_term_goals = get_long_term_goals("example_user_id")


# Function to add a daily action to a user
def add_daily_action(user_id: str, action_name: str, action_description: str):
    # Get Firestore client
    db = firestore.client()
    collection_name = "user_goals"

    # Reference to the user document
    doc_ref = db.collection(collection_name).document(user_id)

    # Fetch the existing document data
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict()
    else:
        data = {}

    # Prepare the new daily action
    new_action = {
        "Name": action_name,
        "Description": action_description
    }

    # Append the new action to the daily_action array
    if "daily_action" in data:
        data["daily_action"].append(new_action)
    else:
        data["daily_action"] = [new_action]

    # Update the document with the new data
    doc_ref.set(data)

    return f"Daily action added successfully to user_id '{user_id}' in '{collection_name}' collection."

# USER_ID = "example_user_id"
# ACTION_NAME = "Smoking"
# ACTION_DESCRIPTION = "I want to quit smoking everyday"
# response = add_daily_action(USER_ID, ACTION_NAME, ACTION_DESCRIPTION)


# Function to get the user's daily actions
def get_daily_actions(user_id: str):
    # Get Firestore client
    db = firestore.client()
    collection_name = "user_goals"

    # Reference to the user document
    doc_ref = db.collection(collection_name).document(user_id)

    # Fetch the document data
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict()
        return data.get("daily_action", [])
    else:
        return f"No document found for user_id '{user_id}' in '{collection_name}' collection."

# USER_ID = "example_user_id"
# daily_actions = get_daily_actions(USER_ID)
# print(daily_actions[0]["Name"])
# print(daily_actions[0]["Description"])



# Function to store log of all daily actions
def log_daily_action_completion(user_id: str, date: str, action_name: str, action_description: str, completed: bool):
    db = firestore.client()
    collection_name = "user_goals"
    doc_ref = db.collection(collection_name).document(user_id)

    # Fetch the existing document data
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict()
    else:
        data = {}

    # Prepare the daily action completion data
    action_data = {
        "Name": action_name,
        "Description": action_description,
        "Completed": completed
    }

    # Add the completion data to the specified date
    if "daily_action_logs" not in data:
        data["daily_action_logs"] = {}

    if date not in data["daily_action_logs"]:
        data["daily_action_logs"][date] = []

    data["daily_action_logs"][date].append(action_data)

    # Update the document with the new data
    doc_ref.set(data)

    return f"Daily action for date '{date}' logged successfully to user_id '{user_id}' in '{collection_name}' collection."

# # Example usage
# USER_ID = "example_user_id"
# DATE = "2024-12-31"
# ACTION_NAME = "Gym"
# ACTION_DESCRIPTION = "I want to go to the gym everyday"
# COMPLETED = True

# response = log_daily_action_completion(USER_ID, DATE, ACTION_NAME, ACTION_DESCRIPTION, COMPLETED)
# print(response)


# Function to get the user's daily action logs
def get_daily_action_logs(user_id: str):
    db = firestore.client()
    collection_name = "user_goals"
    doc_ref = db.collection(collection_name).document(user_id)
    doc = doc_ref.get()
    return doc.to_dict().get("daily_action_logs", {})

# USER_ID = "example_user_id"
# daily_action_logs = get_daily_action_logs(USER_ID)
# print(daily_action_logs)
# # {'2024-12-31': [{'Completed': True, 'Name': 'Gym', 'Description': 'I want to go to the gym everyday'}], '2024-12-30': [{'Completed': True, 'Name': 'Smoking', 'Description': 'I want to quit smoking'}, {'Description': 'I want to go to the gym everyday', 'Name': 'Gym', 'Completed': True}]}

# Function to get the user's daily action logs for a specific date
def get_daily_action_logs_for_date(user_id: str, date: str):
    daily_action_logs = get_daily_action_logs(user_id)
    return daily_action_logs.get(date, [])

# USER_ID = "example_user_id"
# DATE = "2024-12-30"
# daily_action_logs = get_daily_action_logs_for_date(USER_ID, DATE)
# print(daily_action_logs)
# # [{'Completed': True, 'Name': 'Smoking', 'Description': 'I want to quit smoking'}, {'Description': 'I want to go to the gym everyday', 'Name': 'Gym', 'Completed': True}]


# Create a task list for a user
def add_task_list(user_id: str, tasks: list):
    # Get Firestore client
    db = firestore.client()
    collection_name = "user_goals"
    # Reference to the user document
    doc_ref = db.collection(collection_name).document(user_id)

    # Fetch the existing document data
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict()
    else:
        data = {}

    # Initialize tasks list if not present
    if "tasks" not in data:
        data["tasks"] = []

    # Add the new tasks to the list
    for task in tasks:
        task_data = {
            "name": task["name"],
            "dueDate": task["dueDate"],
            "priority": task["priority"],
            "completed": task["completed"],
            "createdAt": task["createdAt"]
        }
        data["tasks"].append(task_data)

    # Update the document with the new tasks
    doc_ref.set(data)

    return f"Tasks added successfully to user_id '{user_id}' in '{collection_name}' collection."

# USER_ID = "example_user_id"
# TASKS = [
#     {
#         "name": "Don't finish project report",
#         "dueDate": "2025-02-20T23:59:59Z",
#         "priority": "High",
#         "completed": False,
#         "createdAt": "2025-02-18T10:00:00Z"
#     },
#     {
#         "name": "Reprepare presentation",
#         "dueDate": "2025-03-22T14:00:00Z",
#         "priority": "Medium",
#         "completed": False,
#         "createdAt": "2025-02-18T10:30:00Z"
#     }
# ]

# response = add_task_list(USER_ID, TASKS)
# print(response)


# Function to get the user's task list
def get_task_list(user_id: str):
    db = firestore.client()
    collection_name = "user_goals"
    doc_ref = db.collection(collection_name).document(user_id)
    doc = doc_ref.get()
    return doc.to_dict().get("tasks", [])

# USER_ID = "example_user_id"
# task_list = get_task_list(USER_ID)
# print(task_list)
# # [{'dueDate': '2025-01-20T23:59:59Z', 'createdAt': '2025-01-18T10:00:00Z', 'completed': False, 'priority': 'High', 'name': 'Finish project report'}, {'dueDate': '2025-01-22T14:00:00Z', 'createdAt': '2025-01-18T10:30:00Z', 'completed': False, 'priority': 'Medium', 'name': 'Prepare presentation'}, {'dueDate': '2025-02-20T23:59:59Z', 'createdAt': '2025-02-18T10:00:00Z', 'completed': False, 'priority': 'High', 'name': "Don't finish project report"}, {'dueDate': '2025-03-22T14:00:00Z', 'createdAt': '2025-02-18T10:30:00Z', 'completed': False, 'priority': 'Medium', 'name': 'Reprepare presentation'}]
