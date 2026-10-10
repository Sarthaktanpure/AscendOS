# AscendOS — Personal Career Operating System

> **Production-minded, evidence-backed career management web application for Sarthak Tanpure (Third-year B.E. Information Technology student at Pravara Rural Engineering College, Loni, Graduating 2028), targeting Software Development Engineer (SDE) internships and top product companies (Google, Microsoft, Amazon, Meta, Atlassian).**

---

## 1. Actual Folder Structure

```
f:\GUIDE
├── client/                               # Frontend Single Page App (React 18 + Vite)
│   ├── dist/                             # Optimized production build artifacts
│   ├── public/
│   │   ├── sw.js                         # Service Worker for Web Push notifications
│   │   └── vite.svg
│   ├── src/
│   │   ├── api/                          # Axios instance with credentials & token interceptors
│   │   │   └── client.js
│   │   ├── components/
│   │   │   ├── common/                   # Reusable Design System components
│   │   │   │   ├── Badge.jsx             # Status and difficulty tags
│   │   │   │   ├── Button.jsx            # Variants, loading states, accessible focus
│   │   │   │   ├── Card.jsx              # Deep charcoal surface cards
│   │   │   │   ├── EmptyState.jsx        # Contextual empty screens with actions
│   │   │   │   ├── Modal.jsx             # Accessible dialogs with ESC listener
│   │   │   │   └── Skeleton.jsx          # Shimmer loaders
│   │   │   ├── focus/
│   │   │   │   └── FocusTimerModal.jsx   # Live countdown ring, distraction logger, confetti
│   │   │   └── layout/
│   │   │       ├── AppShell.jsx          # Main shell wiring Sidebar, Header & Modals
│   │   │       ├── CommandPalette.jsx    # Global Ctrl+K / Cmd+K search & shortcuts
│   │   │       ├── Header.jsx            # Quick actions, notifications bell, theme switch
│   │   │       └── Sidebar.jsx           # Collapsible navigation with CGPA micro-card
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           # Authentication state & session manager
│   │   │   ├── NotificationContext.jsx   # In-app notifications & Web Push registration
│   │   │   └── ThemeContext.jsx          # Dark mode default with light mode switch
│   │   ├── pages/
│   │   │   ├── Accountability.jsx        # Evening shutdown routine & weekly consistency
│   │   │   ├── Analytics.jsx             # Study hour charts, application funnel, CSV export
│   │   │   ├── CoreCSLab.jsx             # 7 CS subjects, syllabus checklists & quizzes
│   │   │   ├── Dashboard.jsx             # "What should I do next?", MITs & heatmaps
│   │   │   ├── DSATracker.jsx            # 16 patterns, spaced repetition & mistake logs
│   │   │   ├── InternshipRadar.jsx       # Verified public feeds & Kanban pipeline
│   │   │   ├── Login.jsx                 # Pre-configured 1-click test login
│   │   │   ├── ProfileSettings.jsx       # Editable academic profile, weekly budgets & VAPID
│   │   │   ├── ProjectLab.jsx            # HospitalOS, AgriConnect, MedVision AI, MedGuard AI
│   │   │   ├── Resources.jsx             # Curated learning documentation & portals
│   │   │   ├── RoadmapMentor.jsx         # 8-phase timeline & persistent mentor chat
│   │   │   └── TaskManager.jsx           # Inbox, Today, MIT toggles & priorities
│   │   ├── App.jsx                       # Routing setup & ProtectedRoute guards
│   │   ├── index.css                     # Tailwind directives, custom scrollbars, Inter font
│   │   └── main.jsx                      # React 18 DOM root entrypoint
│   ├── tests/
│   │   └── components.test.jsx           # Vitest component test suite
│   ├── index.html                        # HTML5 template with Inter typography
│   ├── package.json                      # Frontend scripts & dependencies
│   ├── postcss.config.js                 # PostCSS setup
│   ├── tailwind.config.js                # Custom charcoal color palette & dark theme
│   └── vite.config.js                    # Vite dev server proxy to localhost:5000 & vitest config
│
├── server/                               # Backend REST API (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                     # MongoDB connection with retry & graceful shutdown
│   │   ├── controllers/                  # Feature API controllers
│   │   │   ├── analyticsController.js    # 30-day metrics & CSV download generator
│   │   │   ├── applicationController.js  # Recruitment Kanban pipeline & funnel
│   │   │   ├── authController.js         # JWT auth, profile editing, availability
│   │   │   ├── dashboardController.js    # "What to do next" aggregator & heatmap data
│   │   │   ├── dsaController.js          # Problem catalog, solve attempts & revision queue
│   │   │   ├── jobController.js          # Public feeds sync & candidate eligibility
│   │   │   ├── mentorController.js       # Evidence rubric & rule-based chat dialogue
│   │   │   ├── notificationController.js # In-app notifications & Web Push dispatch
│   │   │   ├── projectController.js      # Quality audits, test evidence & ADRs
│   │   │   ├── resourceController.js     # Curated learning materials library
│   │   │   ├── schedulerController.js    # Adaptive 2h compact, low-energy & rebuild
│   │   │   ├── taskController.js         # Task CRUD, MIT toggles & bulk updates
│   │   │   └── topicsController.js       # Core CS subtopics, confidence & quizzes
│   │   ├── middleware/
│   │   │   ├── auth.js                   # JWT verification via HTTP-only cookie or Bearer token
│   │   │   ├── errorHandler.js           # Centralized exception handler
│   │   │   └── rateLimiter.js            # Brute-force & general request throttling
│   │   ├── models/                       # Mongoose schemas with compound indexes & scoping
│   │   │   ├── Application.js            # Job pipeline tracking
│   │   │   ├── CSQuiz.js                 # Practice interview quizzes & submissions
│   │   │   ├── DailyReview.js            # Accountability shutdown logs
│   │   │   ├── DSAAttempt.js             # Solve attempt duration & mistake taxonomy
│   │   │   ├── DSAProblem.js             # 16-topic catalog with spaced intervals
│   │   │   ├── JobListing.js             # Cached public job opportunities
│   │   │   ├── LearningTopic.js          # 7 CS subjects, syllabi & flashcards
│   │   │   ├── MentorConversation.js     # Persistent chat history
│   │   │   ├── Notification.js           # In-app alerts with idempotency keys
│   │   │   ├── Project.js                # 9-point audit checklists & test evidence
│   │   │   ├── PushSubscription.js       # Browser Web Push endpoints & VAPID keys
│   │   │   ├── Resource.js               # Learning links & completion status
│   │   │   ├── RevisionItem.js           # Spaced repetition scheduling
│   │   │   ├── StudySession.js           # Focus blocks, actual duration & distractions
│   │   │   ├── Task.js                   # MIT tasks with priorities & deadlines
│   │   │   ├── User.js                   # Profile, 9.0 CGPA, Java DSA, credentials
│   │   │   ├── UserPreference.js         # Mon-Thu 6h, Fri-Sun 10h budgets & quiet hours
│   │   │   └── WeeklyReview.js           # Weekly consistency retrospectives
│   │   ├── routes/                       # Express router modules
│   │   ├── scripts/
│   │   │   └── seed.js                   # Automated seed script for Sarthak & curriculum
│   │   ├── services/
│   │   │   ├── cronService.js            # node-cron background schedulers
│   │   │   ├── jobRadarService.js        # Greenhouse API fetcher & eligibility scorer
│   │   │   ├── mentorEngine.js           # Rule-based mentor analysis & advice engine
│   │   │   ├── pushNotificationService.js# Web Push VAPID dispatcher
│   │   │   └── schedulerEngine.js        # Heuristic study session allocator
│   │   └── index.js                      # Express app entrypoint with security middlewares
│   ├── tests/
│   │   └── api.test.js                   # Supertest Vitest integration test suite
│   ├── .env                              # Active environment configuration
│   ├── .env.example                      # Template with placeholder credentials
│   └── package.json                      # Backend dependencies & test scripts
└── README.md                             # Comprehensive technical documentation
```

---

## 2. Implemented Features & Architecture Highlights

### 1. User Profile & Academic Personalization
- Pre-configured with **Sarthak Tanpure**, B.E. Information Technology, Pravara Rural Engineering College, Loni, Expected Graduation **2028**, Reported CGPA **9.0/10**, Primary Language **Java**, Target: SDE Internships at Top Product Companies (Google, Microsoft, Amazon, Meta).
- **100% Editable**: Users can modify academic stage, CGPA, graduation year, technical interests, and constraints at any time in the Profile Settings.

### 2. Main Dashboard Command Center
- **Immediate Answer to "What should I do next?"**: Intelligent directive card dynamically prioritizing active sessions, today's MITs, or overdue spaced revisions.
- **Top 3 Priorities (MITs)**: Most Important Tasks pinned for maximum daily focus.
- **Live Countdown Focus Timer**: Start, pause, resume, complete, skip, with distraction counter and confetti celebration upon completion.
- **Planned vs Actual Study Hours**: Real-time progress bar tracking against daily availability budget.
- **Streak & 7-Day Consistency Heatmap**: Visual activity blocks showing daily study duration.
- **DSA Preparation Counter**: Total solved, needs revision, and overdue breakdown.
- **Daily Mentor Directive**: Prioritized recommendation with explicit rationale.

### 3. Career Roadmap & Rule-Based Mentor
- **8-Phase Progression Timeline**: Semester 5 through 2028 graduation covering Java DSA fundamentals, Core CS, Full-stack systems, Automated testing, High-impact projects, Resume readiness, Internship application sprints, and Mock interviews.
- **Evidence-Based Readiness Rubric**: 5-dimension objective index (0-100) derived from actual database records (DSA solved, CS confidence, project quality audits, test evidence, and application volume).
- **Persistent Mentor Dialogue**: Real conversational interface utilizing a local rule-based heuristic engine analyzing real metrics, giving strict, constructive feedback without hollow praise or external paid API requirements.

### 4. Flexible Study Scheduler
- **Configurable Availability Budget**: Mon-Thu 6h/day, Fri-Sun 10h/day.
- **Adaptive Quick Actions**:
  - `⚡ "I have only 2 hours today"`: Instantly protects Top 2 MITs and defers lower-priority items to backlog without deleting work.
  - `🌙 "Today is a low-energy day"`: Converts heavy coding blocks into gentle revision and reading blocks.
  - `🔄 "Emergency Rebuild"`: Analyzes past unstarted sessions and reschedules from the current moment without duplicates.
- **Zero Silent Drops**: Missed sessions require explicit user skip rationale or rescheduling.

### 5. DSA & Coding Practice Tracker (Java)
- **16 Core Patterns**: Arrays & Strings, Two Pointers, Sliding Window, Binary Search, Linked Lists, Trees/BST, Graphs (BFS/DFS, Topological Sort), Dynamic Programming, etc.
- **Spaced Repetition Due Queue**: Automatically schedules revision intervals (1 → 3 → 7 → 14 → 30 days) based on solve performance.
- **Solve Attempt Modal**: Records solve duration, hints used, confidence (1-5), and classifies mistakes (*Concept Gap, Implementation Bug, Complexity Issue (TLE), or Misread Question*).
- **Topic Mastery Breakdown**: Real-time solved vs total progress bars per pattern.

### 6. Core Computer Science Preparation Lab
- **7 Core Subjects**: OOP, DBMS, OS, Computer Networks, SQL, Software Engineering & Testing, and System Design.
- **Syllabus Checklists**: Interactive subtopic checkboxes.
- **Interview Flashcards**: High-yield takeaways on B+ Tree indexing, ACID transactions, process vs thread context switching, TCP handshakes, and window functions.
- **Practice Quizzes**: Multiple-choice assessments with instant scoring, percentages, and detailed answer explanations.

### 7. Project Engineering Lab
- **4 Real Imported Projects**:
  1. **HospitalOS**: Clinical workflow management with role-based access, appointment scheduling, and indexed medical records.
  2. **AgriConnect**: Direct farmer-to-buyer marketplace with price discovery and order pipelines.
  3. **MedVision AI**: Diagnostic imaging inference portal with PyTorch and FastAPI services.
  4. **MedGuard AI**: Immutable healthcare audit trail with cryptographic document hashing.
- **9-Point Quality Audit Checklist**: Auth, input validation, error handling, API docs, DB indexes, logging, accessibility, automated tests, and deployment reliability.
- **Evidence Logging**: Record verified automated test coverage percentages (with test runner name) and performance benchmarks.
- **Architecture Decision Records (ADRs)**: Document technical tradeoffs and rationale for interview defense.

### 8. Live Internship Radar & Application Pipeline
- **Verified Public Feeds**: Ingests student opportunities from official public Greenhouse job board endpoints and verified early-career product company listings.
- **Candidate Eligibility Scorer**: Automatically flags roles as *"Likely match"*, *"Needs review"*, or *"Does not match stated requirements"* against Sarthak's 2028 graduation year and skills.
- **Recruitment Kanban Pipeline**: Stages for *Saved, Planned, Applied, Assessment, Interview, Offer, Rejected*.
- **Application Modals**: Record referral contacts, deadlines, and follow-up notes.

### 9. Daily & Weekly Accountability System
- **Evening Shutdown Routine**: Conclude each day by recording actual study hours, logging reasons for any missed work (*unrealistic plan, fatigue, exams, interruptions*), and generating tomorrow's directive.
- **Weekly Consistency Audit**: Compares planned vs actual output to eliminate carryover stress.

### 10. Analytics & CSV Report Export
- **Recharts Visualizations**: 7-day study hour charts and candidate application funnel.
- **One-Click CSV Download**: Generates downloadable `ascendos_progress_report.csv` containing complete study session and task history.

### 11. Notifications & Web Push Architecture
- **In-App Notification Center**: Unread count badges and mark-all-read capabilities.
- **Browser Web Push**: Real background service worker (`sw.js`) registered using VAPID keys.
- **node-cron Background Jobs**:
  - Morning Briefing at 08:00 AM.
  - Spaced Revision Queue check every 6 hours.
  - Evening Shutdown prompt at 21:30 (9:30 PM).

---

## 3. Installation & Startup Commands (Windows PowerShell)

### Prerequisites
- Node.js `v20.x` or higher
- MongoDB instance (local or MongoDB Atlas)

### Step 1: Open Windows PowerShell and navigate to the project
```powershell
cd f:\GUIDE
```

### Step 2: Configure Environment Variables
Verify or adjust `server/.env` (see template below).

### Step 3: Run Database Seed Script
Populates Sarthak's profile, the 4 real projects, the canonical Java DSA curriculum, and CS modules:
```powershell
cd f:\GUIDE\server
node src/scripts/seed.js
```
*(Default test account: `sarthak.tanpure@pravara.edu` | Password: `password123`)*

### Step 4: Run the Backend Server
```powershell
# In terminal 1:
cd f:\GUIDE\server
npm run dev
```
*Backend runs on `http://localhost:5000` with health check at `http://localhost:5000/api/health`.*

### Step 5: Run the Frontend Client
```powershell
# In terminal 2:
cd f:\GUIDE\client
npm run dev
```
*Frontend runs on `http://localhost:5173` with automated proxy to backend.*

---

## 4. Environment Variables Template (`server/.env.example`)

```env
# AscendOS Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Connection String (Dedicated 'ascendos' database namespace)
MONGODB_URI=mongodb://127.0.0.1:27017/ascendos
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ascendos?retryWrites=true&w=majority

# JWT Authentication Secrets
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key

# Web Push VAPID Key Pair (Generate via npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:sarthak.tanpure@pravara.edu
```

---

## 5. MongoDB Setup & Verification Instructions

AscendOS uses an isolated database namespace `ascendos` to ensure zero conflict with unrelated collections sharing the same cluster:
1. **Local MongoDB**: The system connects directly to `mongodb://127.0.0.1:27017/ascendos`.
2. **MongoDB Atlas**: Replace the URI in `server/.env` with your Atlas SRV string pointing to `/ascendos`. Ensure your current public IP is whitelisted under **Network Access** in the Atlas Cloud Console (`0.0.0.0/0` or current IP).
3. **Verification**: Run `node src/scripts/seed.js` or query `http://localhost:5000/api/health` to confirm `database: "connected"`.

---

## 6. How to Configure Browser Web Push Notifications

1. In the AscendOS web UI, navigate to **Profile & Settings** (`/settings`).
2. Under **Live Web Push & Background Notifications**, click **"Enable Browser Push"**.
3. Accept the browser permission prompt. The client registers `/sw.js` and securely posts the push subscription keys to `/api/notifications/subscribe`.
4. Click **"Send Test Push"** to verify delivery.

---

## 7. How Live Job Data is Fetched and Cached

1. The backend service (`src/services/jobRadarService.js`) maintains a list of official company Greenhouse job board tokens (Cloudflare, Stripe, GitLab, Figma) and verified student hiring links.
2. It queries official public endpoints (e.g., `https://boards-api.greenhouse.io/v1/boards/{token}/jobs`) with timeout safeguards and fallbacks.
3. Relevant roles (*SWE Intern, Backend Intern, University Grad*) are normalized and cached in the `JobListing` collection with `externalId` deduplication.
4. When requested, the backend dynamically calculates an eligibility assessment against Sarthak's 2028 graduation year and skills.
5. In case of network timeouts or offline environments, cached verified opportunities are returned immediately with zero service disruption.

---

## 8. Test Commands & Actual Execution Results

### Backend Integration Tests (`server`)
```powershell
cd f:\GUIDE\server
npm test
```
**Actual Test Run Output:**
```
 RUN  v2.1.9 F:/GUIDE/server

stdout | tests/api.test.js
[Cron] Initializing background task schedulers...
[Cron] Background schedulers registered successfully.
[AscendOS] MongoDB Connected: 127.0.0.1 (Database: ascendos)

 ✓ tests/api.test.js (9 tests) 729ms
   ✓ GET /api/health should return 200 and online status
   ✓ POST /api/auth/login should authenticate Sarthak Tanpure and return JWT
   ✓ GET /api/tasks without auth should return 401 Unauthorized
   ✓ GET /api/dashboard/summary with valid token should return aggregated metrics
   ✓ POST /api/tasks should create a task and allow MIT toggle
   ✓ GET /api/dsa/problems should return canonical DSA problems with topic mastery
   ✓ GET /api/projects should return 4 preconfigured projects with quality audit data
   ✓ GET /api/jobs should return verified opportunities with candidate eligibility
   ✓ POST /api/mentor/chat should provide evidence-based rule mentorship response

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Duration  2.26s
```

### Frontend Component Tests (`client`)
```powershell
cd f:\GUIDE\client
npm test
```
**Actual Test Run Output:**
```
 RUN  v2.1.9 F:/GUIDE/client

 ✓ tests/components.test.jsx (3 tests) 47ms
   ✓ Card renders title, subtitle, and children content
   ✓ Button renders text and responds to click handler
   ✓ Badge renders correct variant text

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Duration  2.89s
```

### Production Build Validation
```powershell
cd f:\GUIDE\client
npm run build
```
**Actual Build Output:**
```
✓ 2445 modules transformed.
dist/index.html                   1.04 kB │ gzip:   0.58 kB
dist/assets/index-Gch18dlp.css   42.54 kB │ gzip:   7.39 kB
dist/assets/index-DrY4i8SH.js   751.25 kB │ gzip: 214.25 kB
✓ built in 7.88s
```

---

## 9. Production Deployment Guide

### Backend Deployment (e.g. Render / Railway / Ubuntu VPS)
1. Set Environment Variables in production dashboard: `MONGODB_URI`, `JWT_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `CLIENT_URL`.
2. Build & Start command: `npm install && npm start`.
3. Set `NODE_ENV=production` to enable secure HTTP-only cookie attributes.

### Frontend Deployment (e.g. Vercel / Cloudflare Pages / Netlify)
1. Build command: `npm run build`.
2. Output directory: `dist`.
3. Set environment variable: `VITE_API_URL=https://your-backend-domain.com/api`.
4. Configure SPA rewrite rules (`/* -> /index.html`) to support client-side React Router navigation.

---

## 10. Prioritized Future Improvements

1. **GitHub GraphQL Integration**: Automatically sync commit frequency and pull request activity for HospitalOS and MedGuard AI into the Project Lab.
2. **LeetCode Contest Rating Sync**: Option to import contest history via public LeetCode GraphQL endpoints without scraping.
3. **Pluggable AI Mentor Extension**: Add support for optional Gemini / OpenAI API keys to enhance the rule-based mentor with custom mock interview voice simulations.
4. **Offline PWA Caching**: Full offline caching of DSA solution notes using IndexedDB.
#   A s c e n d O S  
 