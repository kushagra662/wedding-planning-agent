import os
import uuid
import re
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

# --------------------------------------------------
# 1. LOAD ENVIRONMENT VARIABLES
# --------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / ".env")

if not os.getenv("GOOGLE_API_KEY"):
    raise ValueError("GOOGLE_API_KEY is missing from your .env file")

# --------------------------------------------------
# 2. IMPORT WEDWISE ORCHESTRATOR
# --------------------------------------------------
from backend.agents.orchestrator import root_agent

# --------------------------------------------------
# 3. FASTAPI APPLICATION
# --------------------------------------------------
app = FastAPI(
    title="WedWise API",
    description="AI-powered multi-agent wedding planning system",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# 4. ADK SESSION AND RUNNER
# --------------------------------------------------
APP_NAME = "wedwise"
session_service = InMemorySessionService()
runner = Runner(
    agent=root_agent,
    app_name=APP_NAME,
    session_service=session_service,
)

# --------------------------------------------------
# 5. CUSTOMER WEDDING REQUEST
# --------------------------------------------------
class WeddingRequest(BaseModel):
    name: str
    email: str
    city: str
    guests: str
    budget: str
    date: str = ""
    food_preference: str = "Vegetarian"
    decoration_preference: str = "Traditional"
    photography_preference: str = "Candid and cinematic"
    events: list[str] = ["Haldi", "Mehendi", "Wedding", "Reception"]


# --------------------------------------------------
# 6. DEMO MODE HELPERS
# --------------------------------------------------
def is_gemini_capacity_error(error: Exception) -> bool:
    """Return True for quota/rate-limit and temporary Gemini availability errors."""
    message = str(error).lower()
    markers = (
        "429",
        "resource_exhausted",
        "quota",
        "rate limit",
        "503",
        "unavailable",
        "high demand",
        "exceeded your current quota",
    )
    return any(marker in message for marker in markers)


def parse_budget_inr(label: str) -> int:
    """Convert the budget dropdown label into a conservative demo budget in INR."""
    text = (label or "").lower().replace(",", "").replace("–", "-").replace("—", "-")
    numbers = [int(value) for value in re.findall(r"\d+", text)]
    if "below 5" in text:
        return 400_000
    if "above 50" in text:
        return 6_000_000
    if len(numbers) >= 2:
        return int((numbers[0] + numbers[1]) / 2 * 100_000)
    if numbers:
        return numbers[0] * 100_000
    return 1_000_000


def build_demo_results(request: WeddingRequest, reason: str) -> dict:
    """Create clearly labelled fictional recommendations without making Gemini calls."""
    try:
        guests = max(1, int(re.findall(r"\d+", str(request.guests))[0]))
    except (IndexError, ValueError):
        guests = 200

    budget = parse_budget_inr(request.budget)
    # Illustrative category split. Values are estimates, not vendor quotations.
    allocations = {
        "Venue": 0.30,
        "Catering": 0.30,
        "Decoration": 0.15,
        "Photography": 0.10,
        "Logistics & contingency": 0.15,
    }
    amounts = {key: round(budget * share) for key, share in allocations.items()}
    money = lambda value: f"₹{value:,.0f}"
    events = request.events or ["Wedding"]

    venue = f"""DEMO MODE — SAMPLE RECOMMENDATION
Wedding city: {request.city}
Guest count: approximately {guests}
Suggested venue: A mid-to-large banquet lawn or hotel convention space in {request.city}.
Capacity target: {guests + max(10, round(guests * 0.10))} guests, including a small buffer.
Estimated venue allocation: {money(amounts['Venue'])}
Suggested facilities: covered indoor backup, parking, accessible washrooms, power backup and separate vendor loading access.
Planning note: Shortlist at least three venues and confirm date availability, taxes, overtime charges and cancellation terms directly.
All venue details and prices here are fictional planning estimates."""

    per_person = amounts["Catering"] / guests
    catering = f"""DEMO MODE — SAMPLE RECOMMENDATION
Food preference: {request.food_preference}
Guest count: {guests}
Suggested service: Buffet with welcome drinks, starters, main course, breads/rice and dessert.
Illustrative catering allocation: {money(amounts['Catering'])} (about {money(per_person)} per guest).
Menu direction: Include clearly labelled dishes, drinking water, a children's option where needed and a small buffer for vendor meals.
Planning note: Confirm the final menu, tasting, service staff count, dietary requirements and per-plate taxes with the caterer.
Menu and cost are illustrative, not a live quotation."""

    decoration = f"""DEMO MODE — SAMPLE RECOMMENDATION
Preferred style: {request.decoration_preference}
Suggested concept: Coordinate the entrance, stage/mandap, guest tables and photo corner using one consistent colour palette.
Estimated decoration allocation: {money(amounts['Decoration'])}
Priorities: weather-safe structures, safe electrical wiring, reusable elements where practical and a clear guest circulation path.
Planning note: Ask decorators for a mood board, itemised quotation, setup/teardown timing and rain contingency.
Design and price are illustrative."""

    photography = f"""DEMO MODE — SAMPLE RECOMMENDATION
Preferred coverage: {request.photography_preference}
Suggested package: One candid photographer, one traditional photographer and a videography option for the main ceremony.
Estimated photography allocation: {money(amounts['Photography'])}
Must-have moments: getting ready, family portraits, ceremony rituals, couple portraits and reception highlights.
Planning note: Review complete event galleries, delivery timeline, backup equipment, usage rights and overtime charges.
Package and price are illustrative."""

    budget_lines = "\n".join(
        f"- {category}: {money(value)}"
        for category, value in amounts.items()
    )
    budget_result = f"""DEMO MODE — SAMPLE BUDGET
Customer budget selection: {request.budget}
Planning budget used for this illustration: {money(budget)}
{budget_lines}
TOTAL PLANNED: {money(sum(amounts.values()))}
The category allocations add up to the illustrative planning budget. Keep a written contingency and revise estimates after receiving actual vendor quotations.
This is not a financial quote."""

    schedule_lines = []
    schedule_table_rows = []
    default_times = {
        "Haldi": "09:00–11:00",
        "Mehendi": "15:00–18:00",
        "Wedding": "18:00–23:00",
        "Reception": "19:00–22:30",
    }
    for index, event_name in enumerate(events, start=1):
        time = default_times.get(event_name, f"{9 + index:02d}:00–{11 + index:02d}:00")
        schedule_lines.append(f"{index}. {event_name}: {time} — allow setup, guest arrival and photography buffer.")
        schedule_table_rows.append(f"| {event_name} | {time} |")
    schedule_result = (
        "DEMO MODE — SAMPLE EVENT SCHEDULE\n"
        f"Wedding date: {request.date or 'To be confirmed'}\n"
        + "\n".join(schedule_lines)
        + "\nConfirm timings with the venue, family, officiant and vendors. These are draft timings."
    )

    budget_table_rows = "\n".join(
        f"| {category} | {money(value)} |"
        for category, value in amounts.items()
    )
    schedule_table_rows = "\n".join(schedule_table_rows)
    final_report = f"""# WedWise — Wedding Planning Summary

> **DEMO MODE — SAMPLE DATA** (not live vendor quotes or confirmed bookings)

## 1. Wedding Overview

- **Name:** {request.name}
- **City:** {request.city}
- **Wedding date:** {request.date or 'To be confirmed'}
- **Guest count:** approximately {guests}
- **Budget selection:** {request.budget}

### Preferences

- **Food:** {request.food_preference}
- **Decoration:** {request.decoration_preference}
- **Photography:** {request.photography_preference}
- **Events:** {', '.join(events)}

## 2. Illustrative Budget

| Category | Estimated allocation |
| --- | ---: |
{budget_table_rows}
| **Total** | **{money(sum(amounts.values()))}** |

These are illustrative allocations, not a financial quote.

## 3. Draft Event Schedule

| Event | Suggested time |
| --- | --- |
{schedule_table_rows}

Confirm timings with the venue, family, officiant and vendors. These are draft timings.

## 4. Planning Actions

1. Contact and compare at least three venues and confirm date availability.
2. Request itemised catering and decoration quotations.
3. Review full photography portfolios and written deliverables.
4. Confirm event timings, vendor arrival windows and backup arrangements.
5. Recalculate the budget using verified quotations before making payments.

## 5. Status and Important Notes

This report was generated using WedWise's local demo fallback because Gemini was unavailable or its quota was exhausted.

- **Reason:** {reason}
- All recommendations, prices and schedules are simulated examples."""

    return {
        "venue": venue,
        "catering": catering,
        "decoration": decoration,
        "photography": photography,
        "budget": budget_result,
        "schedule": schedule_result,
        "final_report": final_report,
    }


# --------------------------------------------------
# 7. HEALTH CHECK API
# --------------------------------------------------
@app.get("/")
async def home():
    return {"message": "Welcome to WedWise API", "status": "running"}


@app.get("/api/health")
async def health():
    return {"status": "healthy", "application": "WedWise"}


# --------------------------------------------------
# 8. WEDDING PLANNING API WITH AUTOMATIC FALLBACK
# --------------------------------------------------
@app.post("/api/plan-wedding")
async def plan_wedding(request: WeddingRequest):
    user_id = "customer_" + str(uuid.uuid4())
    session_id = "session_" + str(uuid.uuid4())

    try:
        await session_service.create_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=session_id,
        )

        wedding_requirements = f"""
Create a personalized wedding plan for this customer.

CUSTOMER DETAILS
Name: {request.name}
Email: {request.email}

WEDDING DETAILS
City: {request.city}
Number of guests: {request.guests}
Total budget: {request.budget}
Wedding date: {request.date}

PREFERENCES
Food preference: {request.food_preference}
Decoration preference: {request.decoration_preference}
Photography preference: {request.photography_preference}

EVENTS
{", ".join(request.events)}

Please create practical recommendations. Keep all financial estimates in INR.
"""
        message = types.Content(
            role="user",
            parts=[types.Part(text=wedding_requirements)],
        )

        async for _event in runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=message,
        ):
            pass

        session = await session_service.get_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=session_id,
        )
        if session is None:
            raise RuntimeError("Could not retrieve ADK session")

        agent_results = {
            "venue": session.state.get("venue_result"),
            "catering": session.state.get("catering_result"),
            "decoration": session.state.get("decoration_result"),
            "photography": session.state.get("photography_result"),
            "budget": session.state.get("budget_result"),
            "schedule": session.state.get("schedule_result"),
            "final_report": session.state.get("final_report"),
        }

        missing = [key for key, value in agent_results.items() if not value]
        if missing:
            raise RuntimeError(
                "The AI workflow did not return all expected outputs: "
                + ", ".join(missing)
            )

        return {
            "success": True,
            "demo_mode": False,
            "message": "Wedding plan generated successfully using Gemini.",
            "customer": request.name,
            "session_id": session_id,
            "agent_results": agent_results,
        }

    except Exception as error:
        print("WEDWISE API ERROR:", repr(error))

        if is_gemini_capacity_error(error) or isinstance(error, RuntimeError):
            reason = str(error)
            print("WEDWISE: switching to DEMO MODE; no further Gemini calls will be made.")
            return {
                "success": True,
                "demo_mode": True,
                "mode_reason": reason,
                "message": "Wedding plan generated using WedWise demo data.",
                "customer": request.name,
                "session_id": session_id,
                "agent_results": build_demo_results(request, reason),
            }

        raise HTTPException(status_code=500, detail=str(error))
