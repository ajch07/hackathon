Anubhav Choudhary, [01-03-2026 09:05]
I have a fully built web application called CogniTrack. Here is my complete existing project README:

---

# CogniTrack - Cognitive Load & Energy Manager

## Problem Statement

Students often study at the wrong times -- when their brain is already tired, leading to poor retention and burnout. There is no easy way for students to know when their brain performs best or how their cognitive abilities change throughout the day.

CogniTrack solves this by giving students a quick, science-backed way to measure their cognitive state, track it over time, and get personalized recommendations on when to study what.

---

## What Does This Project Do?

CogniTrack is a full-stack web application with three core modules:

### 1. Cognitive Testing Engine
Three quick (1-2 minute) interactive tests that measure different aspects of brain performance:

- Reaction Time Test -- A circle changes color randomly. The user clicks as fast as possible when it turns green. Measures reflexes and alertness. Scoring: 200ms = 100 points, 600ms = 0 points.
- Pattern Memory Test -- A sequence of colored blocks lights up. The user must repeat the exact sequence. Difficulty increases each round (3 to 7 blocks). Measures working memory.
- Attention Tracking Test -- Multiple balls move around the screen. One is highlighted briefly, then all look the same. The user must track and identify the target after 5 seconds. Measures sustained focus.

Each test produces a normalized score (0-100) that gets stored in the database.

### 2. Cognitive Dashboard & Tree Visualization
After taking tests, users see a neural network-style tree that visualizes their cognitive state.

### 3. Smart Study Scheduler
Analyzes the user's cognitive patterns to recommend optimal study times.

---

## Tech Stack

- Frontend: React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion + Recharts + Zustand
- Backend: Python 3.12 + FastAPI + SQLAlchemy
- Database: PostgreSQL (Neon Cloud)
- Auth: JWT (python-jose) + bcrypt

---

## Database Schema

- users: id, email, password, name, sleep_data
- test_results: id, user_id, test_type, raw_score, normalized_score, duration, metadata (JSON), timestamp
- cognitive_snapshots: id, user_id, overall_score, focus_score, memory_score, reaction_score, time_of_day, timestamp
- study_schedules: id, user_id, recommended_time, subject, cognitive_requirement, estimated_energy_level, confidence, reason, completed

---

## Existing API Endpoints

POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
POST /api/tests/submit
GET /api/tests/results
GET /api/tests/stats
GET /api/dashboard/tree
GET /api/dashboard/summary
GET /api/dashboard/trends
GET /api/scheduler/recommendations
GET /api/scheduler/energy-pattern
POST /api/scheduler/sleep

---

## Existing Score Algorithm

overall = (reaction * 0.3) + (memory * 0.4) + (focus * 0.3)
Recalculated from last 15 test results after every submission.

---

## Project Structure

frontend/src/
  components/
    common/        # Button, Card, GradientBackground
    auth/          # LoginForm, RegisterForm
    tests/         # ReactionTimeTest, PatternTest, AttentionTest
    dashboard/     # CognitiveTree, ScoreCard, TrendChart
    scheduler/     # EnergyTimeline, RecommendationCard
  pages/           # LandingPage, LoginPage, DashboardPage, TestPage, SchedulerPage
  services/api.ts
  store/authStore.ts
  types/index.ts
  utils/mockData.ts

backend/app/
  core/            # config.py, database.py, security.py
  models/
  schemas/
  routers/
  main.py

---

DO NOT rebuild anything that already exists. Only ADD new features on top of the existing codebase. Do not modify existing test components, do not change existing API endpoints, do not break existing database tables. All new columns must be nullable so existing data is safe.

Keep glassmorphism dark theme consistent throughout. All new TypeScript interfaces go in existing types/index.ts. All new API calls go in existing services/api.ts.

---

# PHASE 2 — BUILD THESE 6 FEATURES IN ORDER

---

## FEATURE 1: Webcam Fatigue Detection Module

Anubhav Choudhary, [01-03-2026 09:05]
CREATE: frontend/src/components/webcam/WebcamModule.tsx

Load MediaPipe Face Mesh via CDN (add to index.html, no npm install):
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>

Calculate these 4 metrics using pure math only — no AI model needed:

EAR (Eye Aspect Ratio):
  Left eye landmarks: 33, 160, 158, 133, 153, 144
  Right eye landmarks: 362, 385, 387, 263, 373, 380
  Formula: EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
  EAR < 0.25 = blink. Count per minute = blinkRate.
  Normal blink rate = 15-20/min. Below 8 or above 30 = fatigue signal.

PERCLOS:
  Rolling 60-second window.
  Track percentage of time EAR is below 0.25.
  PERCLOS > 30% = significant fatigue.

Head Stability:
  Track nose tip (landmark index 1) vertical Y position.
  Baseline = average Y in first 30 seconds of session.
  headDrift = Math.abs(currentY - baseline).
  headStability = Math.max(0, 100 - (headDrift * 10)).

Gaze Stability:
  Gaze center = average of left eye center + right eye center landmarks.
  Calculate standard deviation of gaze center X,Y over last 30 seconds.
  gazeStability = Math.max(0, 100 - (stdDev * 5)).

Emit this object every 10 seconds:
{
  blinkRate: number,
  perclos: number,
  headStability: number,
  gazeStability: number,
  webcamFatigueScore: number  // perclos*0.4 + headStability*0.3 + gazeStability*0.2 + blinkNormal*0.1
}
where blinkNormal = blinkRate between 12-20 gives 100, outside range scales down to 0.

WebcamModule UI:
  - Small 120x90px circular-bordered preview, bottom-right corner, minimizable
  - 4 thin indicator bars below preview: Blink / PERCLOS / Head / Gaze
  - Green "● Camera Active" badge always visible when running
  - "Calibrating..." overlay for first 30 seconds
  - One-click toggle button to enable/disable
  - CRITICAL PRIVACY RULE: zero video or image data ever stored anywhere. Only the computed numbers above are stored. Add a visible privacy note in the UI.

Export from WebcamModule:
  - useWebcam() hook that returns { isActive, toggle, latestMetrics, fatigueLevel }
  - fatigueLevel derived from webcamFatigueScore:
    80-100 = "alert"
    60-79  = "mild_fatigue"  
    40-59  = "moderate_fatigue"
    0-39   = "high_fatigue"

---

## FEATURE 2: Database Migrations

Add these to the backend WITHOUT breaking existing tables.
All new columns must have nullable=True and server_default where needed.

ADD new table webcam_snapshots:

class WebcamSnapshot(Base):
    tablename = "webcam_snapshots"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    blink_rate = Column(Float, nullable=True)
    perclos = Column(Float, nullable=True)
    head_stability = Column(Float, nullable=True)
    gaze_stability = Column(Float, nullable=True)
    webcam_fatigue_score = Column(Float, nullable=True)
    test_result_id = Column(Integer, ForeignKey("test_results.id"), nullable=True)

ADD new columns to existing cognitive_snapshots table:
    webcam_fatigue_score = Column(Float, nullable=True)
    combined_cognitive_score = Column(Float, nullable=True)
    fatigue_level = Column(String, nullable=True)

combined_cognitive_score formula:
    If webcam data available: overall_score * 0.75 + webcam_fatigue_score * 0.25
    If no webcam data: same as overall_score

fatigue_level thresholds:
    combined >= 80 = "alert"
    combined >= 60 = "mild_fatigue"
    combined >= 40 = "moderate_fatigue"
    combined < 40  = "high_fatigue"

ADD new table learning_dna:

class LearningDNA(Base):
    tablename = "learning_dna"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    last_calculated = Column(DateTime, default=datetime.utcnow)
    peak_hours = Column(JSON, nullable=True)           # e.g. ["09:00-10:00", "16:00-17:00"]
    fatigue_zone = Column(JSON, nullable=True)          # e.g.

Anubhav Choudhary, [01-03-2026 09:05]
["22:00-23:00"]
    avg_peak_score = Column(Float, nullable=True)
    typical_session_limit_mins = Column(Integer, nullable=True)
    best_day_of_week = Column(String, nullable=True)
    worst_day_of_week = Column(String, nullable=True)
    primary_fatigue_signal = Column(String, nullable=True)  # "perclos"|"blink_rate"|"head_stability"|"gaze_stability"
    chronotype = Column(String, nullable=True)          # "morning"|"afternoon"|"evening"|"night"
    personal_baseline = Column(JSON, nullable=True)     # {hour: avgScore} for all 24 hours
    smart_insight = Column(Text, nullable=True)
    data_points_count = Column(Integer, default=0)

Create a migration script: backend/migrations/phase2_migration.py
Use SQLAlchemy to run ALTER TABLE statements safely with try/except so re-running does not crash.
Also call Base.metadata.create_all() for new tables.

---

## FEATURE 3: New Backend API Endpoints

Add these new routers. Do NOT touch existing routers.

CREATE: backend/app/routers/webcam.py

POST /api/webcam/snapshot
  Auth: required (JWT)
  Body: { blink_rate, perclos, head_stability, gaze_stability, webcam_fatigue_score, test_result_id? }
  Action: Save to webcam_snapshots. Find latest cognitive_snapshot for user and update its webcam_fatigue_score and combined_cognitive_score and fatigue_level.
  Return: { success: true, combined_cognitive_score, fatigue_level }

CREATE: backend/app/routers/dna.py

GET /api/dna/profile
  Auth: required
  If user has fewer than 20 cognitive_snapshots:
    Return: { ready: false, data_points: X, needed: 20, message: "Take more tests to unlock your Learning DNA" }
  If 20 or more snapshots exist:
    Return full LearningDNA row for user. If row doesn't exist yet, trigger calculation first.

GET /api/dna/daily-pattern
  Auth: required
  Pull all cognitive_snapshots for user.
  Group by hour of day (0-23).
  Return: [{ hour: 9, avg_score: 84.2, session_count: 12 }, ...]
  This endpoint works even with fewer than 20 sessions.

POST /api/dna/calculate
  Auth: required
  Manually trigger DNA recalculation for current user.
  Also auto-trigger this from existing tests router after every 5th test submission.

DNA Calculation Logic (implement as a service function backend/app/services/dna_service.py):

  1. Pull all cognitive_snapshots for user, ordered by timestamp.
  2. Group snapshots by hour of day. Calculate avg combined_cognitive_score per hour.
  3. peak_hours = top 2 hours with highest avg score, formatted as "HH:00-HH:00"
  4. fatigue_zone = bottom 2 hours with lowest avg score
  5. avg_peak_score = average of top 25% of all scores
  6. chronotype:
       If peak hours in 5-11 AM = "morning"
       If peak hours in 11 AM-3 PM = "afternoon"  
       If peak hours in 3-8 PM = "evening"
       If peak hours after 8 PM = "night"
  7. best_day_of_week = day name with highest avg score across all snapshots
  8. worst_day_of_week = day name with lowest avg score
  9. typical_session_limit_mins = look at test_results timestamps. Find average time gap between first and last test in single-day sessions. Use median.
  10. primary_fatigue_signal = among webcam_snapshots, find which metric (perclos, blink_rate, head_stability, gaze_stability) shows earliest decline before combined score drops below 60.
  11. personal_baseline = {0: avgScore, 1: avgScore, ..., 23: avgScore} for all hours
  12. smart_insight = generate one of these template strings based on data:
        If morning chronotype: "You are a morning learner. Schedule Math and Coding before noon for maximum retention."
        If evening chronotype: "Your brain peaks in the evening. Use mornings for light revision and save hard topics for after 4 PM."
        If night chronotype: "You perform best at night. Ensure you get enough sleep to sustain this pattern long-term."
        If afternoon chronotype: "Your cognitive peak is midday. Structure your hardest subjects between 11 AM and 3 PM."
  13. data_points_count = total number of snapshots used

Register both new routers in backend/app/main.py.

---

## FEATURE 4: Learning DNA Page

Anubhav Choudhary, [01-03-2026 09:05]
CREATE: frontend/src/pages/DNAPage.tsx
ADD route /dna in your router setup.

If not ready (less than 20 sessions):
  Show a centered card with:
  - Title: "🧬 Your Learning DNA"
  - Subtitle: "Complete more test sessions to unlock your personalized cognitive profile"
  - Animated progress bar: X out of 20 sessions
  - List of what insights will unlock: Peak Hours, Fatigue Zone, Chronotype, Session Limit, Weekly Pattern, Smart Insight
  - Button: "Take a Test Now" → navigates to /test

If DNA is ready, show these 4 sections with glassmorphism dark theme matching existing UI:

SECTION 1 — DNA Hero Card:
Large card, full width, gradient border.
Display all DNA fields in a clean grid layout:
  🧠 Chronotype       | [value]
  ⏰ Peak Hours       | [value]  
  😴 Fatigue Zone     | [value]
  🏆 Avg Peak Score   | [value]/100
  ⏱️ Session Limit    | [value] mins
  📅 Best Day         | [value]
  📉 Worst Day        | [value]
  💡 Insight          | [full insight text — highlighted differently]
Add a "📋 Copy Summary" button that copies a text version of this card to clipboard.

SECTION 2 — 24-Hour Energy Timeline:
Use Recharts BarChart (already installed).
X-axis: hours 0-23 labeled as "12 AM", "1 AM" ... "11 PM"
Y-axis: avg cognitive score 0-100
Bar color: 
  score >= 80 = #10b981 (green, matches existing excellent color)
  score >= 60 = #38bdf8 (sky blue, matches existing good color)
  score >= 40 = #fb7185 (rose, matches existing average color)
  score < 40  = #ef4444 (red, matches existing needs-work color)
Highlight peak_hours bars with a star icon above them.
Add a ReferenceArea for fatigue_zone hours in red with 20% opacity.

SECTION 3 — Webcam vs Test Score Correlation Chart:
Recharts LineChart with two lines:
  Line 1: test overall_score over time — color #38bdf8
  Line 2: webcam combined_cognitive_score over time — color #10b981
X-axis: dates
Y-axis: 0-100
If no webcam data yet: show a placeholder card saying "Enable webcam during tests to see fatigue correlation"
Show Pearson correlation coefficient as a badge: "Correlation: 0.84"
Tooltip on hover showing both values for that date.

SECTION 4 — Weekly Heatmap:
7 rows (Mon-Sun) x 24 columns (hours).
Each cell colored by avg score for that day+hour combination.
Color scale: #ef4444 (0) → #fb7185 (40) → #38bdf8 (70) → #10b981 (100).
Empty cells (no data) = dark gray #1f2937.
Cell size: 14x14px with 2px gap.
Row labels on left, hour labels on top every 3 hours.
Title: "Weekly Performance Heatmap"

---

## FEATURE 5: Session Quality Card

After each test completes (in TestPage.tsx or wherever results currently show), ADD a Session Quality Card before existing result display.

CREATE: frontend/src/components/tests/SessionQualityCard.tsx

Props:
  testScore: number
  testType: string
  webcamFatigueScore?: number
  fatigueLevel?: string

Display:
┌─────────────────────────────────┐
│  ✅ Session Complete             │
│                                 │
│  🧠 Test Score:      [X]/100    │
│  👁️ Fatigue Level:  [level]     │  ← only if webcam was active
│  📈 vs Your Avg:    +[X] pts    │  ← compare to personal_baseline for this hour
│  ⏰ Best For:       [task type] │  ← based on score level
│                                 │
│  [Take Another Test] [Dashboard]│
└─────────────────────────────────┘

Task type mapping:
  score >= 80 = "High Focus Tasks (Math, Coding)"
  score >= 60 = "Memory Tasks (Languages, History)"
  score >= 40 = "Creative Tasks (Writing, Design)"
  score < 40  = "Light Review Only"

Store session quality in the metadata JSON column of test_results (already exists).
Update POST /api/tests/submit to accept and save: metadata.fatigue_level, metadata.webcam_score.

---

## FEATURE 6: Smart Fatigue Banner

CREATE: frontend/src/components/common/FatigueBanner.tsx

Show this banner at the TOP of DashboardPage and SchedulerPage when:
  webcam is active AND fatigueLevel is "moderate_fatigue" or "high_fatigue"

Banner design:
  Orange/red gradient background strip, full width, dismissible.

Anubhav Choudhary, [01-03-2026 09:05]
"⚠️ High fatigue detected — consider a 10-minute break before your next study session."
  Dismiss button (X) on right. Auto-dismiss after 60 seconds.
  Do not show again for 30 minutes after dismissed (use localStorage timestamp).

Also upgrade existing /api/scheduler/recommendations logic:
  If user has a learning_dna profile:
    For each recommendation, check if recommended_time falls in peak_hours.
    If yes: set confidence = 0.95, add to reason: "Based on your Learning DNA — you score {avg_peak_score}% higher at this time"
    If no: set confidence = 0.70, add to reason: "Outside your peak hours — consider rescheduling if possible"
    Set dna_based = true in response.
  If no DNA profile: keep existing behavior, confidence stays as-is, dna_based = false.

---

## STRICT RULES — FOLLOW EXACTLY

1. Do NOT modify ReactionTimeTest, PatternTest, or AttentionTest components.
2. Do NOT change any existing API endpoint behavior — only add new ones.
3. Do NOT drop or alter existing columns — only add new nullable columns.
4. Run migration with try/except so it is safe to re-run.
5. Webcam is always opt-in. Never auto-start camera.
6. Zero video or image data stored anywhere — only computed numbers.
7. Match existing glassmorphism dark UI exactly.
8. All new TypeScript types go in existing frontend/src/types/index.ts.
9. All new API calls go in existing frontend/src/services/api.ts.
10. Add webcam CDN scripts to index.html only — not via npm.

---

## DELIVERABLES — GIVE ME ALL OF THESE

1. backend/migrations/phase2_migration.py — complete migration script
2. backend/app/models/ — new model classes (WebcamSnapshot, LearningDNA)
3. backend/app/schemas/ — new Pydantic schemas for all new endpoints
4. backend/app/services/dna_service.py — complete DNA calculation logic
5. backend/app/routers/webcam.py — complete router
6. backend/app/routers/dna.py — complete router  
7. Updated backend/app/main.py — register new routers
8. Updated backend/app/routers/tests.py — add auto DNA trigger every 5th test
9. frontend/src/components/webcam/WebcamModule.tsx — complete component with hook
10. frontend/src/pages/DNAPage.tsx — complete page with all 4 sections
11. frontend/src/components/tests/SessionQualityCard.tsx — complete component
12. frontend/src/components/common/FatigueBanner.tsx — complete component
13. Updated frontend/src/types/index.ts — all new TypeScript interfaces appended
14. Updated frontend/src/services/api.ts — all new API calls appended
15. Updated frontend/src/App.tsx or router file — add /dna route
16. Updated index.html — MediaPipe CDN scripts added

Give me all files completely. No placeholders, no "// implement this" comments. Every function must be fully written and working.