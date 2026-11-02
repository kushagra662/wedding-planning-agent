
import argparse
import asyncio
from pathlib import Path

from dotenv import load_dotenv
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

# Load the Gemini API key from the project's root .env file
PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")

# Import all six agents
from backend.agents.venue_agent import venue_agent
from backend.agents.catering_agent import catering_agent
from backend.agents.decoration_agent import decoration_agent
from backend.agents.photography_agent import photography_agent
from backend.agents.budget_agent import budget_agent
from backend.agents.schedule_agent import schedule_agent


AGENTS = {
    "venue": venue_agent,
    "catering": catering_agent,
    "decoration": decoration_agent,
    "photography": photography_agent,
    "budget": budget_agent,
    "schedule": schedule_agent,
}


SAMPLE_REQUIREMENTS = """
Plan a two-day Indian wedding.

Location: Indore, Madhya Pradesh
Total budget: INR 15,00,000
Number of guests: 500
Duration: 2 days
Events: Haldi, Mehendi, Wedding and Reception
Food preference: Vegetarian
Preferred style: Traditional Indian wedding

Provide recommendations based on these requirements.
All prices must be estimates, not confirmed quotations.
"""


async def test_agent(agent_name):

    agent = AGENTS[agent_name]

    print("\n" + "=" * 60)
    print(f"TESTING: {agent.name}")
    print("=" * 60)

    session_service = InMemorySessionService()

    runner = Runner(
        agent=agent,
        app_name="wedwise",
        session_service=session_service
    )

    user_id = "wedwise_customer"

    session = await session_service.create_session(
        app_name="wedwise",
        user_id=user_id
    )

    message = types.Content(
        role="user",
        parts=[
            types.Part.from_text(text=SAMPLE_REQUIREMENTS)
        ]
    )

    print("\nSending requirements to Gemini...\n")

    try:
        async for event in runner.run_async(
            user_id=user_id,
            session_id=session.id,
            new_message=message
        ):
            if event.is_final_response() and event.content:
                for part in event.content.parts:
                    if part.text:
                        print(part.text)

        print("\n" + "=" * 60)
        print(f"{agent.name} TEST COMPLETED")
        print("=" * 60)

    finally:
        await runner.close()


async def main():

    parser = argparse.ArgumentParser(
        description="Test WedWise individual AI agents"
    )

    parser.add_argument(
        "agent",
        choices=list(AGENTS.keys()),
        help="Select an agent to test"
    )

    args = parser.parse_args()

    await test_agent(args.agent)


if __name__ == "__main__":
    asyncio.run(main())
