# CogniTrack - Cognitive Load & Energy Manager

![CogniTrack](https://img.shields.io/badge/CogniTrack-v2.0.0-violet)
![React](https://img.shields.io/badge/React-18.3-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-orange)

## Problem Statement

Students often study at the wrong times -- when their brain is already tired, leading to poor retention and burnout. There is no easy way for students to know **when** their brain performs best or **how** their cognitive abilities change throughout the day.

**CogniTrack** solves this by giving students a quick, science-backed way to measure their cognitive state, track it over time, detect fatigue in real-time via webcam, and get personalized AI-powered recommendations on when to study what.

---

## Key Features

### Phase 1: Core Cognitive Testing
- **Reaction Time Test** - Measures reflexes and alertness
- **Pattern Memory Test** - Tests working memory capacity  
- **Attention Tracking Test** - Evaluates sustained focus
- **Cognitive Dashboard** - Neural network-style tree visualization
- **Smart Study Scheduler** - Recommends optimal study times

### Phase 2: Advanced Features
- **Webcam Fatigue Detection** - Real-time drowsiness monitoring using MediaPipe
- **Learning DNA Profile** - Discovers your chronotype and peak performance hours
- **AI Study Tutor** - GPT-4o-mini powered personalized study assistant
- **Session Quality Cards** - Combined test + fatigue feedback
- **Webcam vs Score Correlation** - Analyze fatigue impact on performance

---

## What Does This Project Do?

CogniTrack is a full-stack web application with six core modules:

### 1. Cognitive Testing Engine
Three quick (1-2 minute) interactive tests that measure different aspects of brain performance:

- **Reaction Time Test** -- A circle changes color randomly. The user clicks as fast as possible when it turns green. Measures reflexes and alertness. Scoring: 200ms = 100 points, 600ms = 0 points.
- **Pattern Memory Test** -- A sequence of colored blocks lights up. The user must repeat the exact sequence. Difficulty increases each round (3 to 7 blocks). Measures working memory.
- **Attention Tracking Test** -- Multiple balls move around the screen. One is highlighted briefly, then all look the same. The user must track and identify the target after 5 seconds. Measures sustained focus.

Each test produces a **normalized score (0-100)** that gets stored in the database.

### 2. Real-Time Webcam Fatigue Detection
Uses MediaPipe Face Mesh to detect drowsiness and fatigue in real-time:

- **Eye Aspect Ratio (EAR)** - Monitors eye openness using 6 landmark points per eye
- **PERCLOS Calculation** - Percentage of eyelid closure over time (drowsy if >40%)
- **Head Stability Tracking** - Detects head nodding/drooping via nose landmark variance
- **Gaze Stability** - Monitors eye movement patterns for attention loss
- **Combined Cognitive Score** - Merges test score (75%) with fatigue score (25%)

### 3. Cognitive Dashboard & Tree Visualization
After taking tests, users see a **neural network-style tree** that visualizes their cognitive state:

```
              [Overall: 77]
             /      |       \
     [Focus: 80] [Memory: 80] [Reaction: 70]
      / | \        / | \        / | \
     (recent test scores as leaf nodes)
```

- The root node shows the weighted overall score
- Three branches represent Focus, Memory, and Reaction skills
- Leaf nodes show individual recent test scores
- Connections are color-coded by performance level

### 4. Learning DNA Profile
Discovers your unique cognitive fingerprint after 3+ test sessions:

- **Chronotype Detection** - Identifies if you're a morning, afternoon, evening, or night person
- **Peak Performance Hours** - Your optimal times for high-focus work
- **Fatigue Zones** - Hours when your cognitive energy typically dips
- **Session Duration Limits** - Recommended study session length
- **Best/Worst Days** - Weekly performance patterns
- **Smart Insights** - AI-generated personalized recommendations

### 5. Smart Study Scheduler
Analyzes the user's cognitive patterns to recommend optimal study times:

- **Energy Timeline** -- Shows hourly cognitive energy levels based on test history
- **Task Matching** -- Assigns task types to appropriate energy windows
- **Personalized Recommendations** -- Uses DNA profile for scheduling

### 6. AI Study Tutor (GPT-4o-mini)
Personalized chatbot that leverages your cognitive data:

- **Context-Aware Responses** - Uses your DNA profile, test history, and fatigue data
- **Subject-Specific Guidance** - Tailored to your field of study
- **Study Planning** - Creates personalized weekly study schedules
- **Performance Tips** - Advice based on your actual cognitive patterns

---

## How It Works (End-to-End Flow)

```
User registers/logs in
        |
        v
Takes a cognitive test (e.g., Reaction Time)
        |
        v
Frontend sends score to --> POST /api/tests/submit
        |
        v
Backend normalizes the score and saves TestResult to PostgreSQL (Neon)
        |
        v
Backend recalculates CognitiveSnapshot (weighted average of last 15 tests)
        |
        v
User visits Dashboard --> GET /api/dashboard/tree, /summary, /trends
        |
        v
Dashboard displays real scores, tree visualization, and trend chart
        |
        v
Scheduler uses CognitiveSnapshot history to generate study recommendations
```

**Demo Mode**: Users can explore the app with preloaded sample data without creating an account.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18.3 + Vite + TypeScript | UI framework with fast dev server |
| Styling | Tailwind CSS 4.0 + Glassmorphism | Dark theme with glass-effect cards |
| Animation | Framer Motion | Page transitions, hover effects |
| Charts | Recharts | Performance trends, energy patterns |
| Icons | Lucide React | Professional SVG icon library |
| State | Zustand | Lightweight client-side state management |
| Webcam | MediaPipe Face Mesh (CDN) | Real-time facial landmark detection |
| Backend | Python 3.12 + FastAPI | REST API with auto-generated docs |
| ORM | SQLAlchemy 2.0 | Database models and queries |
| Database | PostgreSQL (Neon Cloud) | Serverless Postgres for data persistence |
| Auth | JWT (python-jose) + bcrypt | Stateless authentication |
| AI | OpenAI GPT-4o-mini | Personalized AI tutor chat |
| Validation | Pydantic v2 | Server-side schema validation |

---

## High-Level Design (HLD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  │  Landing   │ │ Dashboard  │ │   Tests    │ │ Scheduler  │ │  AI Tutor  │ │
│  │   Page     │ │   Page     │ │   Page     │ │   Page     │ │   Chat     │ │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘ │
│  ┌────────────┐ ┌────────────┐ ┌─────────────────────────────────────────┐  │
│  │  DNA Page  │ │ Demo Mode  │ │     Webcam Module (MediaPipe)           │  │
│  └────────────┘ └────────────┘ └─────────────────────────────────────────┘  │
│                           Zustand State Management                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                              Vite Proxy (/api)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER (FastAPI)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  /auth   │ │  /tests  │ │/dashboard│ │ /webcam  │ │   /dna   │          │
│  │ register │ │  submit  │ │   tree   │ │ snapshot │ │ profile  │          │
│  │  login   │ │ results  │ │  trends  │ │          │ │ pattern  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────────────────────┐        │
│  │/scheduler│ │  /chat   │ │         CORS Middleware              │        │
│  │recommend │ │ message  │ │         JWT Authentication           │        │
│  │ energy   │ │ history  │ └──────────────────────────────────────┘        │
│  └──────────┘ └──────────┘                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ DNA Service │  │Energy Svc   │  │Chat Service │  │Auth Service │        │
│  │ - calculate │  │ - patterns  │  │ - OpenAI    │  │ - JWT       │        │
│  │ - chronotype│  │ - hours     │  │ - context   │  │ - bcrypt    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                              SQLAlchemy ORM
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER (PostgreSQL - Neon)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────────┐ ┌──────────────┐ ┌─────────────────┐          │
│  │  users  │ │test_results │ │  cognitive_  │ │webcam_snapshots │          │
│  │         │ │             │ │  snapshots   │ │                 │          │
│  └─────────┘ └─────────────┘ └──────────────┘ └─────────────────┘          │
│  ┌─────────┐ ┌─────────────┐ ┌──────────────┐ ┌─────────────────┐          │
│  │learning │ │  energy_    │ │   study_     │ │  chat_messages  │          │
│  │  _dna   │ │  patterns   │ │  schedules   │ │                 │          │
│  └─────────┘ └─────────────┘ └──────────────┘ └─────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐              ┌─────────────────────┐               │
│  │   OpenAI API        │              │   MediaPipe CDN     │               │
│  │   (GPT-4o-mini)     │              │   (Face Mesh)       │               │
│  └─────────────────────┘              └─────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Low-Level Design (LLD)

### Database Schema

```sql
-- Users Table
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    hashed_password VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    field_of_study VARCHAR,           -- For AI Tutor context
    subjects JSON,                     -- Array of subjects
    onboarding_done VARCHAR            -- Chat onboarding status
);

-- Test Results Table
CREATE TABLE test_results (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
    test_type VARCHAR NOT NULL,        -- REACTION_TIME | PATTERN_RECOGNITION | ATTENTION_SPAN
    raw_score FLOAT NOT NULL,
    normalized_score FLOAT NOT NULL,   -- 0-100 scale
    duration INTEGER,
    test_metadata JSON,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Cognitive Snapshots Table (aggregated after each test)
CREATE TABLE cognitive_snapshots (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
    overall_score FLOAT NOT NULL,
    focus_score FLOAT NOT NULL,
    memory_score FLOAT NOT NULL,
    reaction_score FLOAT NOT NULL,
    time_of_day VARCHAR NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    webcam_fatigue_score FLOAT,        -- From webcam analysis
    combined_cognitive_score FLOAT,    -- test * 0.75 + webcam * 0.25
    fatigue_level VARCHAR              -- alert | mild_fatigue | moderate_fatigue | high_fatigue
);

-- Webcam Snapshots Table
CREATE TABLE webcam_snapshots (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT NOW(),
    blink_rate FLOAT,
    perclos FLOAT,                     -- Percentage of eyelid closure
    head_stability FLOAT,
    gaze_stability FLOAT,
    webcam_fatigue_score FLOAT,
    test_result_id VARCHAR
);

-- Learning DNA Table
CREATE TABLE learning_dna (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
    chronotype VARCHAR,                -- morning | afternoon | evening | night
    peak_hours JSON,                   -- Array of optimal hours
    fatigue_zone JSON,                 -- Array of low-energy hours
    avg_peak_score FLOAT,
    typical_session_limit_mins INTEGER,
    best_day_of_week VARCHAR,
    worst_day_of_week VARCHAR,
    data_points_count INTEGER,
    smart_insight TEXT,                -- AI-generated insight
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Energy Patterns Table
CREATE TABLE energy_patterns (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
    hour INTEGER NOT NULL,             -- 0-23
    day_of_week INTEGER NOT NULL,      -- 0-6 (Monday-Sunday)
    avg_score FLOAT NOT NULL,
    session_count INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Study Schedules Table
CREATE TABLE study_schedules (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
    recommended_time VARCHAR NOT NULL,
    duration_mins INTEGER NOT NULL,
    priority VARCHAR,                  -- high | medium | low
    reason TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE chat_messages (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR NOT NULL,             -- 'user' | 'assistant'
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

### Webcam Fatigue Detection Algorithm

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEBCAM FATIGUE PIPELINE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Video Frame ──► MediaPipe Face Mesh ──► 468 Facial Landmarks  │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Eye Aspect Ratio (EAR)                                   │   │
│   │                                                          │   │
│   │   EAR = (|p2-p6| + |p3-p5|) / (2 × |p1-p4|)            │   │
│   │                                                          │   │
│   │   p1-p6 = 6 landmarks around each eye                   │   │
│   │   Normal: 0.25-0.30 | Drowsy: < 0.20                    │   │
│   │                                                          │   │
│   │   ear_score = clamp((EAR - 0.15) / 0.15 × 100, 0, 100) │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ PERCLOS (Percentage of Eyelid Closure)                  │   │
│   │                                                          │   │
│   │   Track % of time eyes are 80% closed over 60 seconds   │   │
│   │   Alert: < 15% | Drowsy: > 40%                          │   │
│   │                                                          │   │
│   │   perclos_score = 100 - (PERCLOS × 2)                   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Head Stability                                           │   │
│   │                                                          │   │
│   │   Track nose landmark position variance over time        │   │
│   │   Low variance = stable = alert                         │   │
│   │   High variance = nodding/drooping = fatigued           │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Final Fatigue Score Calculation                          │   │
│   │                                                          │   │
│   │   fatigue_score = (ear_score × 0.35) +                  │   │
│   │                   (perclos_score × 0.35) +               │   │
│   │                   (head_stability × 0.15) +              │   │
│   │                   (gaze_stability × 0.15)                │   │
│   │                                                          │   │
│   │   combined_cognitive = (test_score × 0.75) +            │   │
│   │                        (fatigue_score × 0.25)            │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### AI Tutor Context Injection

```
┌─────────────────────────────────────────────────────────────────┐
│                 AI TUTOR CONTEXT BUILDING                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   User Message ──► Build Context ──► OpenAI GPT-4o-mini         │
│                         │                                        │
│                         ▼                                        │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ System Prompt (~500 tokens of cognitive context)         │   │
│   │                                                          │   │
│   │ - User's field of study and subjects                    │   │
│   │ - DNA Profile (chronotype, peak hours, fatigue zones)   │   │
│   │ - Recent test scores (last 5 sessions)                  │   │
│   │ - Energy patterns by hour                               │   │
│   │ - Current fatigue signals from webcam                   │   │
│   │ - Smart insights and recommendations                    │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Response ──► Save to chat_messages ──► Return to user         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## System Architecture

```
+------------------------------------------------------------+
|                    CLIENT (Browser)                         |
|  +------------------------------------------------------+  |
|  |              React + Vite Application                 |  |
|  |  [Auth] [Tests] [Dashboard] [DNA] [Scheduler] [Chat] |  |
|  |  [Webcam Module - MediaPipe Face Mesh]               |  |
|  +------------------------------------------------------+  |
+------------------------------------------------------------+
                         | HTTP/REST (Vite proxy /api -> :8001)
                         v
+------------------------------------------------------------+
|                   FastAPI Backend (:8001)                   |
|  [Auth] [Tests] [Dashboard] [Webcam] [DNA] [Scheduler] [Chat]
|                         |                                   |
|         [DNA Service] [Energy Service] [Chat Service]       |
|                         |                                   |
|              [SQLAlchemy ORM Layer]                         |
+------------------------------------------------------------+
                         |
          +--------------+---------------+
          |                              |
          v                              v
+-------------------+          +-------------------+
| PostgreSQL (Neon) |          |    OpenAI API     |
| - users           |          |   (GPT-4o-mini)   |
| - test_results    |          +-------------------+
| - cognitive_snap  |
| - webcam_snap     |
| - learning_dna    |
| - energy_patterns |
| - study_schedules |
| - chat_messages   |
+-------------------+
```

---

## Database Schema

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `users` | id, email, password, name, field_of_study, subjects | User accounts + AI context |
| `test_results` | id, user_id, test_type, raw_score, normalized_score | Individual test attempts |
| `cognitive_snapshots` | overall_score, focus/memory/reaction, webcam_fatigue_score | Aggregated cognitive state |
| `webcam_snapshots` | blink_rate, perclos, head_stability, fatigue_score | Webcam fatigue readings |
| `learning_dna` | chronotype, peak_hours, fatigue_zone, smart_insight | Learning DNA profile |
| `energy_patterns` | hour, day_of_week, avg_score, session_count | Hourly energy levels |
| `study_schedules` | recommended_time, duration_mins, priority, reason | Study recommendations |
| `chat_messages` | role, content, timestamp | AI tutor conversation history |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT token |
| GET | `/api/auth/me` | Get current user profile |

### Cognitive Tests
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tests/submit` | Submit test result + update snapshot |
| GET | `/api/tests/results` | Get user's test history |
| GET | `/api/tests/stats` | Get average score and test count |
| GET | `/api/tests/types` | Get available test types |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/tree` | Get cognitive tree data |
| GET | `/api/dashboard/summary` | Get latest cognitive snapshot |
| GET | `/api/dashboard/trends` | Get score + webcam trends over time |

### Webcam
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webcam/snapshot` | Save webcam fatigue data |

### Learning DNA
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dna/profile` | Get learning DNA profile |
| GET | `/api/dna/daily-pattern` | Get hourly energy patterns |
| POST | `/api/dna/calculate` | Trigger DNA calculation |

### Scheduler
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scheduler/recommendations` | Get study recommendations |
| GET | `/api/scheduler/energy-pattern` | Get hourly energy pattern |
| POST | `/api/scheduler/mark-complete/{id}` | Mark schedule as completed |

### AI Tutor Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/message` | Send message and get AI response |
| GET | `/api/chat/history` | Get conversation history |
| POST | `/api/chat/onboarding` | Save field of study + subjects |
| GET | `/api/chat/profile` | Get study profile for onboarding check |

---

## Core Algorithms

### Score Normalization
```
Reaction Time:  score = max(0, min(100, 100 - ((avgMs - 200) / 4)))
Pattern Memory: score = (correct / total) * 100
Attention:      score = accuracy_percentage
```

### Overall Composite Score
```
overall = (reaction * 0.3) + (memory * 0.4) + (focus * 0.3)
```
Recalculated from the last 15 test results after every submission.

### Study Recommendation Matching
```
Peak energy hours   --> HIGH_FOCUS tasks (Math, Coding)
High energy hours   --> MEMORY_INTENSIVE tasks (Languages)
Medium energy hours --> CREATIVE tasks (Writing)
Low energy hours    --> ROUTINE tasks (Review)
```

---

## Project Structure

```
hackathon/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Button, Card, GradientBackground
│   │   │   ├── auth/            # LoginForm, RegisterForm
│   │   │   ├── tests/           # ReactionTimeTest, PatternTest, AttentionTest
│   │   │   ├── dashboard/       # CognitiveTree (SVG), ScoreCard, TrendChart
│   │   │   └── scheduler/       # EnergyTimeline, RecommendationCard
│   │   ├── pages/               # LandingPage, LoginPage, DashboardPage, TestPage, SchedulerPage
│   │   ├── services/api.ts      # Axios API client with JWT interceptor
│   │   ├── store/authStore.ts   # Zustand auth state (user, token, demo mode)
│   │   ├── types/index.ts       # TypeScript interfaces
│   │   └── utils/mockData.ts    # Demo mode sample data
│   ├── package.json
│   └── vite.config.ts           # Dev server + API proxy config
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py        # Settings (DB URL, JWT config)
│   │   │   ├── database.py      # SQLAlchemy engine + session
│   │   │   └── security.py      # Password hashing, JWT creation/verification
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── routers/             # FastAPI route handlers
│   │   └── main.py              # App entry point, CORS, router registration
│   ├── requirements.txt
│   └── .env                     # DATABASE_URL, JWT_SECRET
│
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL database (Neon recommended)
- OpenAI API key (for AI Tutor feature)

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment file
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, and OPENAI_API_KEY

# Run database migrations
python -c "from app.core.database import engine, Base; Base.metadata.create_all(bind=engine)"
python migrations/phase2_migration.py
python migrations/chat_migration.py

# Start server
uvicorn app.main:app --reload --port 8001
```
Backend runs at `http://localhost:8001` | API docs at `http://localhost:8001/docs`

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```
Frontend runs at `http://localhost:5173`

### Demo Mode
Click **"Try Demo Mode"** on the landing page to explore with preloaded data -- no account required.

---

## Deployment

### Environment Variables

#### Backend (.env)
```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require

# JWT Authentication (generate strong secret for production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080

# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key

# Environment
ENVIRONMENT=production

# CORS Origins (your frontend URL)
CORS_ORIGINS=https://your-app.vercel.app
```

#### Frontend (.env)
```env
VITE_API_URL=https://your-backend.railway.app
```

### Deploy Backend (Railway/Render)

1. Push code to GitHub
2. Connect Railway/Render to your repo
3. Set environment variables (see above)
4. Deploy command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Deploy Frontend (Vercel)

1. Connect Vercel to your GitHub repo
2. Set `VITE_API_URL` environment variable
3. Build command: `npm run build`
4. Output directory: `dist`

### Local vs Production Switch

The app automatically detects environment via the `ENVIRONMENT` variable:
- **development**: API docs enabled, relaxed CORS
- **production**: API docs disabled, strict CORS origins

---

## Security Features

- **JWT Authentication** - Stateless token-based auth with configurable expiry
- **Password Hashing** - bcrypt with automatic salting
- **CORS Protection** - Configurable allowed origins (strict in production)
- **Environment Isolation** - All secrets via environment variables
- **API Docs Protection** - Swagger/ReDoc disabled in production mode
- **SQL Injection Prevention** - SQLAlchemy ORM with parameterized queries
- **Input Validation** - Pydantic schemas validate all API inputs

---

## Design Decisions

- **Glassmorphism UI** -- Dark theme with `backdrop-filter: blur(12px)` glass-effect cards for a modern, professional look
- **SVG Cognitive Tree** -- Custom neural network visualization using SVG with animated connections, not a chart library
- **Performance-first animations** -- Native CSS transitions (0.15s) for hover effects instead of heavier JS animation libraries
- **Weighted scoring** -- Memory weighted highest (40%) since it's the primary study-related cognitive function
- **Neon serverless Postgres** -- Zero-config cloud database, eliminates local PostgreSQL setup
- **Demo mode isolation** -- Zustand store tracks demo state separately from real auth, so demo data never leaks into real user sessions

---

MIT License
