from supabase import create_client, Client

url = "https://iuxxctpityftaywmmosp.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1eHhjdHBpdHlmdGF5d21tb3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxNzcwOTksImV4cCI6MjA1Mjc1MzA5OX0.AJee9EGCpCcsUeNemdLrjVlHWOQgEgd0BkaAMw6Ae6Q"
supabase: Client = create_client(url, key)

def get_user_data():
    try:
        response = supabase.table('users').select('').execute()

        return {'success': True, 'data': response.data}
    except Exception as e:
        print(e)
        return {'success': False, 'msg': str(e)}

# Usage
user_data = get_user_data()
print(user_data)