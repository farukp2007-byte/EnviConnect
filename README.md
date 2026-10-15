# 🌱 ENVI CONNECT
### AI-Enabled, GIS-Based Environmental Incident Reporting & Multi-Agency Response Platform

> **Citizens Report. Authorities Respond. Earth Restores.**  
> Serving the Tirupati Municipal Corporation, APPCB Industrial Zones, and Seshachalam Biosphere Reserve.

---

## 🏛️ Monestra Design System & Brand Identity
- **Page Background:** Near-black green `#04120F`
- **Cards, Panels & Sidebar:** Brunswick Green `#0C4137`
- **Primary Highlights & Active States:** Emerald `#06D6A0`
- **Primary Typography & Surfaces:** Polar `#E6FBF6`
- **Secondary & Muted Accents:** `#A2C5BD` and `#659389`
- **Signature Gradient:** Vertical Emerald `#06D6A0` → Brunswick Green `#0C4137`
- **Header Aesthetics:** Dark teal blurred glowing mesh gradient behind logo
- **Typography:** Elegant serif (*Playfair Display / Cormorant Garamond*) for the wordmark and main headings; clean sans-serif (*Inter*) for interface controls
- **Shapes:** Large rounded corners (`20px–28px` / `rounded-2xl` to `rounded-3xl`), generous padding, accessible contrast

---

## ⚡ Key Architectural Innovations & USPs

1. **AI NLP Incident Auto-Classification & Severity Tagging**
   - Scikit-learn TF-IDF vectorizer + Logistic Regression classifier trained on comprehensive bootstrap environmental complaint corpus.
   - Live real-time suggestion pill activates as citizens type descriptions, auto-recommending category and severity (Low, Medium, High, Critical) with confidence ratings.

2. **Geospatial Duplicate Detection & Merge Engine (<100m)**
   - When a citizen files a complaint within 100 meters of an active open incident of the same category (calculated via Haversine distance), the system **merges the new photographic evidence into the existing ticket**, increments the `reporters_count`, and alerts the citizen: *"X others reported this too!"*.
   - Prevents duplicate bureaucratic tickets while giving enforcement agencies consolidated multi-angle evidence.

3. **Multi-Agency Automated Routing Engine**
   - Configurable rule engine dynamically evaluates the violation category and geospatial ward to assign the complaint to the exact responsible body:
     - **Municipal Corporation of Tirupati (MCT):** Municipal solid waste, roadside dumping, street sanitation, urban noise.
     - **AP Pollution Control Board (APPCB):** Industrial air emissions, chemical river runoff, toxic effluents.
     - **Tirupati Forest Division:** Hill slope deforestation, protected red sanders tree felling, forest encroachments.
     - **Tirupati Urban Development Authority (TUDA):** Lake tank bed encroachments, unauthorized billboards.

4. **Transparent Before & After Verification with Interactive Slider**
   - The incident detail view features an interactive dual-image comparison slider (and side-by-side mode) contrasting the citizen's original photo against the authority's official resolution proof.

5. **Citizen Verification & Re-Escalation Loop**
   - Cases cannot be unilaterally closed by authorities. When marked *"Resolved"*, citizen reporters receive an accountability prompt: *"Was this actually fixed?"*
     - **Yes:** Confirmed fixed with citizen 5★ rating → Officially closed with proof.
     - **No:** Reopened and escalated to **CRITICAL priority** (escalation counter incremented, senior supervisors notified).

6. **Real-Time GIS Heatmap & Risk Score Algorithm**
   - Interactive OpenStreetMap (Leaflet) view with color-coded risk circles for Tirupati's 5 zones:
     $$\text{Risk Score} = (1.5 \times \text{Open}) + (3.5 \times \text{Critical}) + (2.0 \times \text{High}) + (3.0 \times \text{Escalated})$$
   - Categorized into Red (Critical Hotspot), Orange (High Concern), Yellow (Moderate), and Green (Low / Monitored).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19 (Vite), Tailwind CSS v3, React-Leaflet (OpenStreetMap), Recharts, Lucide React |
| **Backend** | Python 3.11, FastAPI, Uvicorn, SQLAlchemy ORM, Pydantic v2 |
| **Database** | SQLite via SQLAlchemy (`envi_connect.db`), structured for PostgreSQL/MongoDB migration |
| **AI / Machine Learning** | Scikit-learn (TF-IDF + Logistic Regression), NumPy, Haversine Geospatial Metric |
| **Media / EXIF** | Local `/uploads` and `/seed_assets` with PIL (Pillow) EXIF GPS metadata extractor |
| **Authentication** | JWT (JSON Web Tokens), Role-Based Access Control (RBAC), SHA-256 salted password hashing |
| **DevOps** | Docker, Docker Compose, Nginx Reverse Proxy, `.env.example` |

---

## 👥 Demo User Personas (1-Click Switcher Available in UI)

The prototype includes a sticky top **1-Click Persona Bar** allowing instant role switching without logging out:

| Role | Name | Email | Password | Responsibilities |
|---|---|---|---|---|
| **Citizen** | Rajesh Sharma | `citizen@envi.gov` | `citizen123` | Files complaints with GPS/photo, tracks progress, validates resolution |
| **Authority (MCT)** | Dr. K. Srinivas Rao | `mct.officer@tirupati.gov` | `mct123` | Investigates municipal waste and noise queue, uploads after-proof photos |
| **Authority (APPCB)** | P. V. Ramana | `appcb.officer@appcb.gov` | `appcb123` | Inspects industrial smoke, river chemical discharges, orders shutdowns |
| **Authority (Forest)** | S. Venkat Reddy | `forest.officer@apforest.gov` | `forest123` | Protects Seshachalam forest fringe, books offenses under AP Forest Act |
| **NGO Analyst** | Ananya Deshmukh | `ngo@greenaction.org` | `ngo123` | Read-only access to GIS heatmaps, regional analytics, resolution velocity |
| **Administrator** | System Administrator | `admin@envi.gov` | `admin123` | Configures automated routing rules, municipal zones, and authority departments |

---

## 🚀 Quick Run Steps

### Option A: Local Development (Windows / macOS / Linux)

#### 1. Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run seed script (automatically seeds 30 reports, 5 zones, 4 authorities, demo images)
python seed_data.py

# Start FastAPI server (runs on port 8000)
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
Swagger API documentation will be available at: **http://127.0.0.1:8000/docs**

#### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (runs on port 5173)
npm run dev -- --host 127.0.0.1 --port 5173
```
Open your browser at: **http://127.0.0.1:5173/**

---

### Option B: Docker Compose
```bash
# From the project root (envi-connect/)
docker-compose up --build
```
- Frontend: **http://localhost:5173**
- Backend & Swagger: **http://localhost:8000/docs**

---

## 🎬 2-Minute Demo Script

Follow this step-by-step walkthrough to demonstrate all platform features end-to-end:

### Step 1: Landing Page & Live Statistics (0:00 – 0:20)
1. Open `http://127.0.0.1:5173/`.
2. Observe the dark green **Monestra theme** (`#04120F`, Brunswick green panels, emerald accents, and serif typography).
3. Review the live KPI cards: **30 Active Incidents**, **80% Resolved with Proof**, **28.5h Avg Resolution**, **16 Duplicate Tickets Merged**.
4. Scroll to view the **Verified Before & After Resolutions** showcase.

### Step 2: Citizen Reporting & Live AI Auto-Tagging (0:20 – 0:40)
1. In the navigation bar, click **"Report Incident"** (or use the primary CTA).
2. Type in the description box:  
   *"Thick toxic black smoke and chemical soot coming out of chimney near residential school"*
3. Notice the **AI Auto-Suggestion Pill** appear:  
   `✨ AI Suggestion: Air Pollution • Severity: Critical (94% match) • [Apply AI Tags]`
4. Click **[Apply AI Tags]** to see category and severity auto-populate.
5. In the location section, note the draggable pin on the **Tirupati OpenStreetMap**. Click **"Use My Live GPS"**.

### Step 3: Location-Based Duplicate Detection & Auto-Merge (USP) (0:40 – 1:00)
1. In the Report form, click the quick preset button: **"Test 100m Duplicate Merge"**.
2. Notice the title, category (Illegal Dumping), and coordinates (`13.6296°N, 79.4212°E` at Gandhi Road Market) populate within 25 meters of existing ticket `ENV-2026-0001`.
3. Click **"Submit Complaint & Route to Authority"**.
4. **Result:** An instant modal pops up with:  
   *"Duplicate Violation Merged (USP): A report for this illegal dumping violation already exists ~25m away! Your evidence has been merged into ENV-2026-0001. 4 citizens have reported this so far."*
5. Click **"View Consolidated Incident"** to inspect the unified ticket.

### Step 4: Before & After Slider & Linked Evidence Gallery (1:00 – 1:20)
1. On the **Report Detail Page**, view the **Linked Citizen Evidences Gallery**: all 4 citizen photo uploads are neatly attached with individual timestamps and EXIF tags.
2. View the **Interactive Before & After Slider**: drag the center divider to compare the citizen's original dumping evidence against the MCT clearance proof!
3. Review the **Audit Timeline**: see automated routing, officer inspection, and clearance logs.

### Step 5: Authority Dashboard & Resolution Workflow (1:20 – 1:40)
1. On the top **1-Click Persona Bar**, click **"MCT Officer"**.
2. Click **"Authority Queue"** in the navigation bar.
3. Observe the queue filtered for Municipal Corporation cases, sorted by **"Highest Severity"** or **"Most Reported (Duplicates)"**.
4. On any open incident, click **"Update Status / Resolve"**:
   - Change status to **"Resolved"**.
   - Enter field remediation notes: *"Sanitation squad deployed, 4 tons cleared, bleached."*
   - Upload an 'after' photo and click **Confirm**.
5. Notice the incident update instantly across the queue.

### Step 6: Citizen Verification & Re-Escalation Loop (USP) (1:40 – 1:50)
1. Switch back to **"Citizen"** on the top bar and click **"My Reports"**.
2. Find the resolved ticket and observe the prominent accountability prompt:  
   *"Citizen Verification Required: Was this violation actually fixed?"*
3. Test both branches:
   - Click **"Yes, Actually Fixed"**: rate 5★ to officially close the case with citizen proof.
   - Or test clicking **"No, NOT Fixed"**: watch the system immediately **reopen the ticket and escalate to CRITICAL priority** (Level #2) with an alert badge and supervisor notification!

### Step 7: GIS Heatmap & Analytics Update (1:50 – 2:00)
1. Click **"GIS Heatmap"** in the navigation bar.
2. View Tirupati's 5 zones with color-coded risk overlays (Red, Orange, Yellow, Green) and custom severity markers with duplicate count badges.
3. Click **"Analytics"** to view Recharts graphs:
   - Open vs. Resolved by Category (Bar Chart)
   - Incident Severity Distribution (Donut Chart)
   - Authority Resolution Velocity (%)
   - 7-Day Trend and Trending Zones Risk Ranking table.

---

## 📡 REST API Reference

The backend provides auto-generated OpenAPI / Swagger docs at `http://localhost:8000/docs`:

- `POST /api/auth/register` — Register new citizen/officer account
- `POST /api/auth/login` — Authenticate and receive JWT bearer token
- `GET /api/auth/demo-users` — Pre-seeded role accounts for testing
- `POST /api/reports/ai-predict` — NLP classification of description text
- `POST /api/reports` — Multipart upload with EXIF GPS extraction & <100m duplicate merge
- `GET /api/reports` — List incidents with category, severity, status, and zone filters
- `GET /api/reports/{id}` — Full incident detail with all linked citizen evidences & timeline
- `PATCH /api/reports/{id}/status` — Authority status transition with after-photo upload
- `POST /api/reports/{id}/feedback` — Citizen resolution verification & re-escalation loop
- `GET /api/zones/trending` — Live computed risk scores and hotspot levels for GIS map
- `GET /api/analytics/kpis` — Key resolution performance metrics
- `GET /api/analytics/charts` — Recharts-formatted data structures
- `GET /api/notifications` — User notification center with unread counters
- `GET /api/admin/routing-rules` — Automated category and zone routing configuration

---

## 🛡️ License & Acknowledgments
Built with public environmental transparency principles for the Tirupati urban and forest biosphere region.
