from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print(SUPABASE_KEY, SUPABASE_URL)
def get_user_data():

    response = supabase.schema('public').table('users').select('*').execute()
    
    print(response)
    return response.data
