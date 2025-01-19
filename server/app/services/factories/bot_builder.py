from app.models.bot import BotBuilder, VoiceBot, Voices


from dataclasses import dataclass


@dataclass()
class VoiceBotBuilder(BotBuilder):

    sys_prompt : str = ""
    leading_prompt : str = ""
    voice : Voices = Voices.KAJEN

    def with_voice(self, voice : Voices):
        self.voice = voice
        return self

    def load_prompts(self):
        with open(f"resources/prompts/{self.id}/main.txt", "r") as f:
            self.sys_prompt = f.read()

        return self

    def build(self):
        return VoiceBot(id=self.id, knowledge_base=self.knowledge_base, sys_prompt=self.sys_prompt, leading_prompt=self.leading_prompt, voice=self.voice)
    