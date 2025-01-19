from app.services.ext.firebase_db import *
from app.services.ext.supabase_client import *
from app.models.user import User
from typing import Iterator

class UserDataService:

    def __init__(self):
        self.data = User()

    def load_data_from_id(self, id : str) -> None:

        user_data = supabase.from_('users').select('*').eq('id', id).execute()
        if user_data.data:
            self.data.id = user_data.data[0]["id"]
            self.data.first_name = user_data.data[0]["first_name"]
            self.data.phone_number = user_data.data[0]["phone_number"]
        else:
            raise ValueError(f"User with id {id} not found")

    @classmethod
    def get_all_users(cls) -> Iterator[User]:
        users = supabase.from_('users').select('*').execute()
        for user in users.data:
            if user:
                yield User(id=user.get("id"), first_name=user.get("first_name"), phone_number=user.get("phone_number"))

    def get_goals(self):

        pass