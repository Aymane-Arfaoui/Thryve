from supabase import create_client, Client
import os
from dotenv import load_dotenv


load_dotenv()  # Load environment variables from .env file
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
# Replace with your Supabase project URL and API key
SUPABASE_URL = "https://iuxxctpityftaywmmosp.supabase.co"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)



def get_user_data(user_id):
    try:
        response = supabase.table('users').select('*').eq('id', user_id).single().execute()

        if response.get('error'):
            return {'success': False, 'msg': response['error']['message']}
        
        return {'success': True, 'data': response['data']}
    
    except Exception as e:
        print(f"Error fetching user data: {str(e)}")
        return {'success': False, 'msg': str(e)}

# Example usage:
user_id = "7f52e101-4f72-4dab-b548-50a2575aa146"
result = get_user_data(user_id)
if result['success']:
    print("User data:", result['data'])
else:
    print("Error:", result['msg'])
















def get_user_data(user_id):
    try:
        # Query the 'users' table for the specified user_id
        response = supabase.table('action_tracker').select("*").eq('id', user_id).single().execute()

        # Check for errors in the response
        if response.get('error'):
            return {'success': False, 'msg': response['error']['message']}
        
        return {'success': True, 'data': response['data']}
    except Exception as error:
        print(error)
        return {'success': False, 'msg': str(error)}

print(get_user_data('7f52e101-4f72-4dab-b548-50a2575aa146'))




def get_long_term_goals(user_id):
    response = supabase.table("users").select("long-term-goals").eq("id", user_id).execute()
    if response.data:
        return response.data[0].get("long-term-goals", [])
    else:
        return f"User with ID {user_id} not found."

def add_long_term_goal(user_id, new_goal):
    # Fetch existing goals
    existing_goals = get_long_term_goals(user_id)
    if isinstance(existing_goals, str):  # Error handling
        return existing_goals
    
    # Add new goal
    existing_goals.append({"description": new_goal})
    
    # Update in the database
    response = supabase.table("users").update({"long_term_goals": existing_goals}).eq("id", user_id).execute()
    return response.data


def set_long_term_goals(user_id, goals):
    # Update the database with new goals
    response = supabase.table("users").update({"long_term_goals": goals}).eq("id", user_id).execute()
    return response.data






# {
#   "long_term_goals": [
#     {
#       "description": "Achieve and maintain a healthy level of physical fitness through consistent exercise, balanced nutrition, and adequate rest."
#     },
#     {
#       "description": "Develop a successful business by solving a real-world problem with a scalable product and strong customer focus."
#     }
#   ]
# }


# {
#   "daily_actions": [
#     {
#       "name": "Gym",
#       "description": "Go to the gym every day"
#     },
#     {
#       "name": "Startup",
#       "description": "Work on my startup 10 hours a day."
#     }
#   ]
# }


# {
#   "tracked_actions": [{"2025-01-18": [{"name": "Gym", "description": "Go to the gym every day", "committed": true, "completed": true}, 
#                                     {"name": "Startup", "description": "Work on my startup 10 hours a day", "committed": true, "completed": true}
#                                     ], "score": -1
#                         }, 
#                         {"2025-01-19": [{"name": "Gym", "description": "Go to the gym every day", "committed": true, "completed": true}, 
#                                     {"name": "Startup", "description": "Work on my startup 10 hours a day", "committed": true, "completed": true}
#                                     ], "score": -1
#                         }
#   ]
# }