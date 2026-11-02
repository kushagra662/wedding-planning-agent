
from google.adk.agents import SequentialAgent

from backend.agents.venue_agent import venue_agent
from backend.agents.catering_agent import catering_agent
from backend.agents.decoration_agent import decoration_agent
from backend.agents.photography_agent import photography_agent
from backend.agents.budget_agent import budget_agent
from backend.agents.schedule_agent import schedule_agent
from backend.agents.final_report_agent import final_report_agent


root_agent = SequentialAgent(
    name="wedwise_wedding_planner",
    description="Coordinates all wedding planning agents sequentially.",
    sub_agents=[
        venue_agent,
        catering_agent,
        decoration_agent,
        photography_agent,
        budget_agent,
        schedule_agent,
        final_report_agent,
    ],
)
