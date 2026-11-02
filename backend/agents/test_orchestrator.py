import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the main project folder
PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")

# Check that the API key is available (without displaying it)
if not os.getenv("GOOGLE_API_KEY"):
    raise ValueError(
        "GOOGLE_API_KEY not found. Please check your project's .env file."
    )

# Import agents only AFTER loading the environment variables
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from backend.agents.orchestrator import root_agent

APP_NAME = "wedwise"
USER_ID = "wedwise_user"
SESSION_ID = "wedwise_test_session"


async def main():

    print("\n======================================")
    print("       WEDWISE MULTI-AGENT SYSTEM")
    print("======================================\n")

    # 1. Create session service
    session_service = InMemorySessionService()

    # 2. Create a new session
    await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=SESSION_ID
    )

    # 3. Create ADK runner
    runner = Runner(
        agent=root_agent,
        app_name=APP_NAME,
        session_service=session_service
    )

    # 4. Wedding requirements
    wedding_requirements = """
    Plan a two-day wedding in Indore, India.

    Number of guests: 500
    Total budget: 15 lakh INR

    Events:
    - Haldi
    - Mehendi
    - Wedding
    - Reception

    Food preference: Vegetarian

    Decoration preference: Traditional decoration
    Photography preference: Candid photography and cinematic video

    Please provide practical recommendations and estimated costs.
    """

    print("Wedding requirements submitted.")
    print("\nStarting all agents...\n")

    # 5. Send requirements to the orchestrator
    message = types.Content(
        role="user",
        parts=[types.Part(text=wedding_requirements)]
    )

    # 6. Execute all agents sequentially
    async for event in runner.run_async(
        user_id=USER_ID,
        session_id=SESSION_ID,
        new_message=message
    ):

        if event.is_final_response() and event.content:
            for part in event.content.parts:
                if part.text:
                    print("\nFINAL RESPONSE:")
                    print(part.text)

    # 7. Retrieve session results
    session = await session_service.get_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=SESSION_ID
    )

    print("\n======================================")
    print("       INDIVIDUAL AGENT RESULTS")
    print("======================================")

    result_keys = [
        "venue_result",
        "catering_result",
        "decoration_result",
        "photography_result",
        "budget_result",
        "schedule_result",
        "final_report"
    ]

    for key in result_keys:
        print(f"\n\n========== {key.upper()} ==========\n")

        result = session.state.get(key)

        if result:
            print(result)
        else:
            print("No result found for this agent.")

    print("\n======================================")
    print("       WEDWISE EXECUTION COMPLETED")
    print("======================================")


if __name__ == "__main__":
    asyncio.run(main())
