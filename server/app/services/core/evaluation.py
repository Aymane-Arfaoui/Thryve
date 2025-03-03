import re
import app.services.ext.firebase_db as firebase_db
from app.services.ext.azure_ai import get_llm
from config import AzureModels


def openai_call(prompt: str):
    llm = get_llm(AzureModels.gpt_4o)
    response = llm.invoke(prompt)
    return response.content.strip()


def setup_evaluation(transcript: str):
    # Extract goals
    # Extract 2 daily actions
    prompt = f"""From the following transcript, extract the goals and the 2 daily actions.
{transcript}

Extract the goals and 2 daily action in the following format:

Goal 1: [goal 1]
Goal 2: [goal 2]

Daily Action 1: [daily action 1]
Daily Action 2: [daily action 2]"""
    
    ai_response = openai_call(prompt)

    return ai_response


def extract_goals_and_actions(response: str):
    goals_and_actions = {
        'goal1': re.search(r'Goal 1: (.*?)(?:\n|$)', response).group(1),
        'goal2': re.search(r'Goal 2: (.*?)(?:\n|$)', response).group(1),
        'action1': re.search(r'Daily Action 1: (.*?)(?:\n|$)', response).group(1),
        'action2': re.search(r'Daily Action 2: (.*?)(?:\n|$)', response).group(1)
    }

    return goals_and_actions


def extract_action_name(action_description: str):
    prompt = f"""From the action description below shorten it into a title that I can display in an app that encaspulates the action.Extract the name of the action in the following format and keep in less than 2 words. For example if the user says they want to drink water everyday the action name is "Water" or if they said they want to quit vaping the action name is "Vaping":
Action Description: {action_description}
Action Title:"""
        
    ai_response = openai_call(prompt)
    return ai_response


def call_time_extractor(transcript: str):
    # Extract time for next call
    prompt = f"""From the following transcript, extract the time for the next call.
{transcript}

Extract the time for the next call in the following format:
Call Time: 13:00"""

    return prompt


# Function to create a user
def setup_up_call_update(transcript: str, user_id: str):
    # Extract goals and actions
    goals_ai_extraction = setup_evaluation(transcript)
    goals_and_actions = extract_goals_and_actions(goals_ai_extraction)


    print("\nExtracted goals and actions: ", goals_and_actions)

    # Get long term goals and action descriptions
    ltg_1_description = goals_and_actions['goal1']
    ltg_2_description = goals_and_actions['goal2']

    action_1_description = goals_and_actions['action1']
    action_2_description = goals_and_actions['action2']

    # Shorten long term goals to 2 words
    action_title_1 = extract_action_name(action_1_description).replace('"', '')
    action_title_2 = extract_action_name(action_2_description).replace('"', '')

    print("\Determined action titles: ", action_title_1, action_title_2)

    # Update long term goals
    firebase_db.create_long_term_goals(user_id, [ltg_1_description, ltg_2_description])

    # Update daily actions
    firebase_db.add_habit(user_id, action_title_1, action_1_description)
    firebase_db.add_habit(user_id, action_title_2, action_2_description)

    print("Updated user profile :)")




# sample_transcript = """Coach: Hi Michael, Im Goggins, your personal life coach. Hows it going?
# User: Im good, how are you?

# Coach: Im doing great, Michael. Thanks for asking! So, tell me, whats going on in school for you these days?
# User: Nothing much, things are just really busy for me.

# Coach: I hear you, Michael. Life can get overwhelming when things pile up. Whats keeping you the busiest right now? Are there any specific projects, assignments, or responsibilities taking up most of your time?
# User: Im just a bit behind in class, so I gotta keep up.

# Coach: Got it, Michael. Catching up can definitely feel like a grind, but it’s good that you’re aware of it and working on it. Outside of school, what do you like to do for fun to keep yourself balanced?
# User: I like to play video games.

# Coach: Nice, video games can be a great way to relax and recharge. Do you play casually, or are you really competitive with it?
# User: I like to play casually, but I’m competitive whenever I feel like it.

# Coach: That’s a solid mix, Michael—keeps it fun but still challenging when you’re in the mood. Shifting gears a bit, what’s one long-term goal you have for this next year? Something meaningful to you.
# User: I really want to get in better shape.

# Coach: That’s a great goal, Michael. Getting in shape can improve so many areas of life. Do you have anything specific in mind for this—like losing weight, building muscle, or just feeling healthier overall?
# User: I think just healthier overall, but I want to lose some weight and build muscle.

# Coach: That’s a solid combo, Michael—getting healthier while losing weight and building muscle will make a big difference. What’s another long-term goal you want to work on this year?
# User: I don’t really know.

# Coach: That’s okay, Michael. Sometimes it’s hard to pinpoint a second goal. Let’s think about areas like wealth, career, or relationships. Is there anything you’d like to improve in one of those areas? Maybe saving more money, making progress in school, or strengthening connections with friends or family?
# User: Yea, I guess I want to quit my vaping addiction.

# Coach: That’s an amazing goal, Michael. Kicking vaping will do wonders for your health and mindset. So now we’ve got two big goals: getting in better shape and quitting vaping. What do you think you can do each day to work toward these goals? Let’s start small but consistent.
# User: I can go to the gym every day.

# Coach: That’s a strong commitment, Michael. Hitting the gym every day will definitely help you get in shape and keep your mind off vaping. What’s one more thing you can do daily to support your progress? Maybe something like setting a specific time to avoid cravings or focusing on healthier habits.
# User: I really get cravings during the morning, so maybe I can keep busy during that time.

# Coach: That’s a smart move, Michael. Keeping busy in the mornings can really help you push through those cravings. With these two daily habits—going to the gym and staying occupied during cravings—you’re setting yourself up for success. Let’s keep building on this momentum. Anything else you want to focus on today?
# User: No, nothing else.

# Coach: Alright, Michael, you’ve got a solid plan in place. Stick to it, and remember, small daily steps lead to big changes. I’ll be here if you ever need a push or some guidance. Let’s crush these goals together! Talk soon!
# """





# sample_response = """Goal 1: Get in better shape (lose weight, build muscle, and improve overall health)
# Goal 2: Try to quit vaping

# Daily Action 1: Go to the gym every day
# Daily Action 2: Stay occupied during morning cravings"""