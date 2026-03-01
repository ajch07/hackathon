"""
DNA Calculation Service
Analyzes cognitive snapshots and webcam data to generate a user's Learning DNA profile.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from collections import defaultdict
import statistics

from app.models.cognitive_snapshot import CognitiveSnapshot
from app.models.webcam_snapshot import WebcamSnapshot
from app.models.learning_dna import LearningDNA
from app.models.test_result import TestResult


DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def calculate_dna(db: Session, user_id: str) -> LearningDNA:
    """Full DNA calculation from all cognitive snapshots for a user."""

    snapshots = (
        db.query(CognitiveSnapshot)
        .filter(CognitiveSnapshot.user_id == user_id)
        .order_by(CognitiveSnapshot.timestamp.asc())
        .all()
    )

    if not snapshots:
        return None

    # Use combined_cognitive_score if available, else overall_score
    def get_score(s):
        if s.combined_cognitive_score is not None:
            return s.combined_cognitive_score
        return s.overall_score

    # --- 1. Group by hour ---
    hour_scores = defaultdict(list)
    for s in snapshots:
        hour = s.timestamp.hour
        hour_scores[hour].append(get_score(s))

    hour_avg = {}
    for h, scores in hour_scores.items():
        hour_avg[h] = sum(scores) / len(scores)

    # --- 2. personal_baseline (all 24 hours) ---
    personal_baseline = {}
    for h in range(24):
        personal_baseline[str(h)] = round(hour_avg.get(h, 0), 1)

    # --- 3. peak_hours (top 2) ---
    sorted_hours = sorted(hour_avg.items(), key=lambda x: x[1], reverse=True)
    peak_hours_raw = [h for h, _ in sorted_hours[:2]]
    peak_hours = [f"{h:02d}:00-{(h+1) % 24:02d}:00" for h in peak_hours_raw]

    # --- 4. fatigue_zone (bottom 2) ---
    fatigue_hours_raw = [h for h, _ in sorted_hours[-2:]] if len(sorted_hours) >= 2 else []
    fatigue_zone = [f"{h:02d}:00-{(h+1) % 24:02d}:00" for h in fatigue_hours_raw]

    # --- 5. avg_peak_score (top 25%) ---
    all_scores = sorted([get_score(s) for s in snapshots], reverse=True)
    top_25_count = max(1, len(all_scores) // 4)
    avg_peak_score = round(sum(all_scores[:top_25_count]) / top_25_count, 1)

    # --- 6. chronotype ---
    if peak_hours_raw:
        avg_peak_hour = sum(peak_hours_raw) / len(peak_hours_raw)
        if 5 <= avg_peak_hour < 11:
            chronotype = "morning"
        elif 11 <= avg_peak_hour < 15:
            chronotype = "afternoon"
        elif 15 <= avg_peak_hour < 20:
            chronotype = "evening"
        else:
            chronotype = "night"
    else:
        chronotype = "morning"

    # --- 7 & 8. best/worst day of week ---
    day_scores = defaultdict(list)
    for s in snapshots:
        day_idx = s.timestamp.weekday()  # 0=Monday
        day_scores[day_idx].append(get_score(s))

    day_avg = {}
    for d, scores in day_scores.items():
        day_avg[d] = sum(scores) / len(scores)

    if day_avg:
        best_day_idx = max(day_avg, key=day_avg.get)
        worst_day_idx = min(day_avg, key=day_avg.get)
        best_day_of_week = DAY_NAMES[best_day_idx]
        worst_day_of_week = DAY_NAMES[worst_day_idx]
    else:
        best_day_of_week = "Monday"
        worst_day_of_week = "Sunday"

    # --- 9. typical_session_limit_mins ---
    test_results = (
        db.query(TestResult)
        .filter(TestResult.user_id == user_id)
        .order_by(TestResult.timestamp.asc())
        .all()
    )

    session_durations = []
    if test_results:
        # Group tests by date
        date_groups = defaultdict(list)
        for tr in test_results:
            date_key = tr.timestamp.date()
            date_groups[date_key].append(tr.timestamp)

        for date_key, timestamps in date_groups.items():
            if len(timestamps) >= 2:
                timestamps.sort()
                diff_mins = (timestamps[-1] - timestamps[0]).total_seconds() / 60
                if diff_mins > 0:
                    session_durations.append(diff_mins)

    if session_durations:
        typical_session_limit_mins = int(statistics.median(session_durations))
    else:
        typical_session_limit_mins = 30  # default

    # --- 10. primary_fatigue_signal ---
    webcam_data = (
        db.query(WebcamSnapshot)
        .filter(WebcamSnapshot.user_id == user_id)
        .order_by(WebcamSnapshot.timestamp.asc())
        .all()
    )

    primary_fatigue_signal = "perclos"  # default
    if webcam_data and len(webcam_data) >= 5:
        # Find which metric degrades earliest when combined score drops below 60
        metrics = {
            "perclos": [],
            "blink_rate": [],
            "head_stability": [],
            "gaze_stability": [],
        }
        for ws in webcam_data:
            if ws.perclos is not None:
                metrics["perclos"].append(ws.perclos)
            if ws.blink_rate is not None:
                metrics["blink_rate"].append(ws.blink_rate)
            if ws.head_stability is not None:
                metrics["head_stability"].append(ws.head_stability)
            if ws.gaze_stability is not None:
                metrics["gaze_stability"].append(ws.gaze_stability)

        # For simplicity: whichever metric has the highest variance is the primary fatigue signal
        max_cv = 0
        for metric_name, values in metrics.items():
            if len(values) >= 3:
                mean_val = sum(values) / len(values)
                if mean_val > 0:
                    std_val = statistics.stdev(values)
                    cv = std_val / mean_val  # coefficient of variation
                    if cv > max_cv:
                        max_cv = cv
                        primary_fatigue_signal = metric_name

    # --- 11. smart_insight ---
    insight_map = {
        "morning": "You are a morning learner. Schedule Math and Coding before noon for maximum retention.",
        "afternoon": "Your cognitive peak is midday. Structure your hardest subjects between 11 AM and 3 PM.",
        "evening": "Your brain peaks in the evening. Use mornings for light revision and save hard topics for after 4 PM.",
        "night": "You perform best at night. Ensure you get enough sleep to sustain this pattern long-term.",
    }
    smart_insight = insight_map.get(chronotype, insight_map["morning"])

    # --- Save / Update ---
    existing = db.query(LearningDNA).filter(LearningDNA.user_id == user_id).first()

    if existing:
        existing.last_calculated = datetime.utcnow()
        existing.peak_hours = peak_hours
        existing.fatigue_zone = fatigue_zone
        existing.avg_peak_score = avg_peak_score
        existing.typical_session_limit_mins = typical_session_limit_mins
        existing.best_day_of_week = best_day_of_week
        existing.worst_day_of_week = worst_day_of_week
        existing.primary_fatigue_signal = primary_fatigue_signal
        existing.chronotype = chronotype
        existing.personal_baseline = personal_baseline
        existing.smart_insight = smart_insight
        existing.data_points_count = len(snapshots)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        dna = LearningDNA(
            user_id=user_id,
            last_calculated=datetime.utcnow(),
            peak_hours=peak_hours,
            fatigue_zone=fatigue_zone,
            avg_peak_score=avg_peak_score,
            typical_session_limit_mins=typical_session_limit_mins,
            best_day_of_week=best_day_of_week,
            worst_day_of_week=worst_day_of_week,
            primary_fatigue_signal=primary_fatigue_signal,
            chronotype=chronotype,
            personal_baseline=personal_baseline,
            smart_insight=smart_insight,
            data_points_count=len(snapshots),
        )
        db.add(dna)
        db.commit()
        db.refresh(dna)
        return dna
