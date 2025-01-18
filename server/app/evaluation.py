import re

def setup_evaluation(transcript: str):
    # Extract goals
    # Extract 2 daily actions
    prompt = f"""From the following transcript, extract the goals and the 2 daily actions.
{transcript}

Extract the goals and 2 daily action in the following format:

Goal 1: [goal 1]
Goal 2: [goal 2]

Daily Action 1: [daily action 1]
Daily Action 2: [daily action 2]
"""



sample_response = """Goal 1: Get in better shape (lose weight, build muscle, and improve overall health)
Goal 2: Quit vaping

Daily Action 1: Go to the gym every day
Daily Action 2: Stay occupied during morning cravings"""

def extract_goals_and_actions(response: str):
    goals_and_actions = {
        'goal1': re.search(r'Goal 1: (.*?)(?:\n|$)', response).group(1),
        'goal2': re.search(r'Goal 2: (.*?)(?:\n|$)', response).group(1),
        'action1': re.search(r'Daily Action 1: (.*?)(?:\n|$)', response).group(1),
        'action2': re.search(r'Daily Action 2: (.*?)(?:\n|$)', response).group(1)
    }

    return goals_and_actions

# extract_goals_and_actions(sample_response)


def night_call_evaluation(transcript: str):
    # Extract followed & not followed status for each action
    pass








# sample_transcript = """Coach: Hi Michael, I’m Goggins, your personal life coach. How’s it going?
# User: I’m good, how are you?

# Coach: I’m doing great, Michael. Thanks for asking! So, tell me, what’s going on in school for you these days?
# User: Nothing much, things are just really busy for me.

# Coach: I hear you, Michael. Life can get overwhelming when things pile up. What’s keeping you the busiest right now? Are there any specific projects, assignments, or responsibilities taking up most of your time?
# User: I’m just a bit behind in class, so I gotta keep up.

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

