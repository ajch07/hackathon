"""
Chat Service - Builds cognitive context and calls OpenAI for personalized study advice.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from openai import OpenAI

from app.core.config import get_settings
from app.models.user import User
from app.models.cognitive_snapshot import CognitiveSnapshot
from app.models.learning_dna import LearningDNA
from app.models.schedule import EnergyPattern
from app.models.webcam_snapshot import WebcamSnapshot
from app.models.chat_message import ChatMessage


SYSTEM_PROMPT_TEMPLATE = """You are CogniTrack Study Assistant — a smart, friendly AI tutor that gives personalized study advice based on real cognitive data.

STUDENT PROFILE:
- Name: {name}
- Field of Study: {field_of_study}
- Subjects: {subjects}

COGNITIVE DATA (from real tests & webcam tracking):
- Total test sessions: {total_sessions}
- Recent scores (last 5): Focus {focus_scores}, Memory {memory_scores}, Reaction {reaction_scores}
- Overall trend: {trend_direction}
{dna_section}
{fatigue_section}
{energy_section}

GUIDELINES:
- Give specific, actionable advice using the data above.
- Reference their actual scores, peak hours, and fatigue patterns.
- Suggest specific times for specific subjects based on energy patterns.
- If they ask for a study plan, create a detailed daily/weekly schedule.
- Keep responses concise but helpful. Use bullet points for plans.
- Be encouraging but honest about areas that need improvement.
- Never make up data — only use what's provided above.
- If you don't have enough data, say so and encourage more tests."""


def build_cognitive_context(db: Session, user: User) -> str:
    """Build the full system prompt with all user cognitive data."""

    # Basic info
    field = user.field_of_study or "Not specified"
    subjects = ", ".join(user.subjects) if user.subjects else "Not specified"

    # Recent snapshots
    snapshots = (
        db.query(CognitiveSnapshot)
        .filter(CognitiveSnapshot.user_id == user.id)
        .order_by(CognitiveSnapshot.timestamp.desc())
        .limit(5)
        .all()
    )

    total_sessions = (
        db.query(func.count(CognitiveSnapshot.id))
        .filter(CognitiveSnapshot.user_id == user.id)
        .scalar() or 0
    )

    focus_scores = [str(round(s.focus_score)) for s in snapshots] if snapshots else ["N/A"]
    memory_scores = [str(round(s.memory_score)) for s in snapshots] if snapshots else ["N/A"]
    reaction_scores = [str(round(s.reaction_score)) for s in snapshots] if snapshots else ["N/A"]

    # Trend
    if len(snapshots) >= 2:
        recent_avg = sum(s.overall_score for s in snapshots[:2]) / 2
        older_avg = sum(s.overall_score for s in snapshots[-2:]) / 2
        if recent_avg > older_avg + 5:
            trend_direction = "Improving (scores going up)"
        elif recent_avg < older_avg - 5:
            trend_direction = "Declining (scores going down — may need rest)"
        else:
            trend_direction = "Stable"
    else:
        trend_direction = "Not enough data yet"

    # DNA section
    dna = db.query(LearningDNA).filter(LearningDNA.user_id == user.id).first()
    if dna:
        dna_section = f"""
LEARNING DNA PROFILE:
- Chronotype: {dna.chronotype} learner
- Peak hours: {', '.join(dna.peak_hours or [])}
- Fatigue zone: {', '.join(dna.fatigue_zone or [])}
- Avg peak score: {dna.avg_peak_score}/100
- Best day: {dna.best_day_of_week} | Worst day: {dna.worst_day_of_week}
- Typical session limit: {dna.typical_session_limit_mins} minutes
- Insight: {dna.smart_insight}"""
    else:
        dna_section = "\nLEARNING DNA: Not yet calculated (need more test sessions)"

    # Fatigue section
    latest_webcam = (
        db.query(WebcamSnapshot)
        .filter(WebcamSnapshot.user_id == user.id)
        .order_by(WebcamSnapshot.timestamp.desc())
        .first()
    )
    if latest_webcam:
        fatigue_section = f"""
LATEST FATIGUE DATA (webcam):
- Fatigue score: {latest_webcam.webcam_fatigue_score}/100
- Blink rate: {latest_webcam.blink_rate}/min
- PERCLOS: {latest_webcam.perclos}%
- Head stability: {latest_webcam.head_stability}/100
- Gaze stability: {latest_webcam.gaze_stability}/100"""
    else:
        fatigue_section = "\nFATIGUE DATA: No webcam data collected yet"

    # Energy patterns
    patterns = (
        db.query(EnergyPattern)
        .filter(EnergyPattern.user_id == user.id)
        .order_by(EnergyPattern.average_cognitive_score.desc())
        .limit(5)
        .all()
    )
    if patterns:
        top_hours = [f"{p.hour_of_day}:00 (score: {round(p.average_cognitive_score)})" for p in patterns]
        energy_section = f"\nTOP ENERGY HOURS: {', '.join(top_hours)}"
    else:
        energy_section = "\nENERGY PATTERNS: Not enough data yet"

    return SYSTEM_PROMPT_TEMPLATE.format(
        name=user.name,
        field_of_study=field,
        subjects=subjects,
        total_sessions=total_sessions,
        focus_scores=", ".join(focus_scores),
        memory_scores=", ".join(memory_scores),
        reaction_scores=", ".join(reaction_scores),
        trend_direction=trend_direction,
        dna_section=dna_section,
        fatigue_section=fatigue_section,
        energy_section=energy_section,
    )


def get_chat_history(db: Session, user_id: str, limit: int = 20) -> list:
    """Get recent chat messages for context."""
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.timestamp.desc())
        .limit(limit)
        .all()
    )
    # Reverse to get chronological order
    messages.reverse()
    return [{"role": m.role, "content": m.content} for m in messages]


def chat_with_ai(db: Session, user: User, user_message: str) -> str:
    """Send message to OpenAI with full cognitive context."""

    settings = get_settings()
    api_key = settings.openai_api_key
    if not api_key:
        return "OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file."

    client = OpenAI(api_key=api_key)

    # Build system prompt with cognitive data
    system_prompt = build_cognitive_context(db, user)

    # Get conversation history
    history = get_chat_history(db, user.id, limit=10)

    # Build messages array
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=1000,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Sorry, I encountered an error: {str(e)}"
