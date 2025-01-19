from app.services.ext.firebase_db import *
from app.services.ext.supabase_client import *
from app.models.user import User
from typing import Iterator
from app.services.ext.firebase_db import get_long_term_goal_descriptions
from app.models.activities import LongTermGoal, Habit


class UserDataService:

    def __init__(self):
        self.data = User()
        self.long_term_goals : list[LongTermGoal] = []
        self.habits : list[Habit] = []

    def load_data_from_id(self, id : str) -> None:

        user_data = supabase.from_('users').select('*').eq('id', id).execute()
        if user_data.data:
            self.data.id = user_data.data[0].get("id")
            self.data.first_name = user_data.data[0].get("first_name")
            self.data.phone_number = user_data.data[0].get("phone_number")
        else:
            raise ValueError(f"User with id {id} not found")

    @classmethod
    def get_all_users(cls) -> Iterator[User]:
        users = supabase.from_('users').select('*').execute()
        for user in users.data:
            if user:
                yield User(id=user.get("id"), first_name=user.get("first_name"), phone_number=user.get("phone_number"))

    def fetch_goals(self):
        try:
            self.long_term_goals = [LongTermGoal(name=goal) for goal in get_long_term_goal_descriptions(self.data.id)]
        except Exception as e:
            print(f"Error fetching goals for user {self.data.id}: {e}")
            self.long_term_goals = []

    def fetch_habits(self):
        try:
            self.habits = [Habit(name=habit.get("name"), description=habit.get("description")) for habit in get_habits_data(self.data.id)]
        except Exception as e:
            print(f"Error fetching habits for user {self.data.id}: {e}")
            self.habits = []

    def get_goals_string(self):

        if not self.long_term_goals:
            return ""

        res = ""
        for i, goal in enumerate(self.long_term_goals):
            res += f"Goal {i+1}: {goal.name}\n"
        return res

    def get_habits_string(self):

        if not self.habits:
            return ""

        res = ""
        for i, habit in enumerate(self.habits):
            res += f"Action {i+1}: {habit.description}\n"
        return res