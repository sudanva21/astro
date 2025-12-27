import os
from autogen_agentchat.agents import AssistantAgent
from config.models import build_chat_completion_client

# Load Prompts
def load_prompt(filename):
    base_path = os.path.join(os.path.dirname(__file__), "..", "prompts", "library")
    with open(os.path.join(base_path, filename), "r") as f:
        return f.read()

model_client = build_chat_completion_client()

# THE MAHARISHI (Synthesizer)
maha_rishi = AssistantAgent(
    name="MahaRishi",
    model_client=model_client,
    system_message=load_prompt("synthesis_rules.md"),
    description="synthesizes reports from all specialists into a final coherent prediction."
)
