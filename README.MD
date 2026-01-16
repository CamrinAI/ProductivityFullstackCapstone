## Project Pitch: Sonic Speedometer + Car Battle + Merchant Comparison

### Step 1: Business Problem Scenario
- **Productivity pain**: Teams lack a fast way to see which internal/external APIs are slow, and buyers lack a clear comparison of similar products (cars or e-commerce items) in one place.
- **Target users**: DevOps/SREs monitoring microservices; car shoppers comparing cars; merchandisers aggregating products. They are frustrated by slow services, context switching, and scattered data.
- **Value**: A single FastAPI backend that (a) monitors service latency and tags it with Sonic characters for instant status, (b) runs head-to-head spec/pricing battles for Corvette vs. Mustang, and (c) compares products from Google Merchant Center. This streamlines troubleshooting and buying decisions.
- **External APIs**: Checkly API or async HTTP ping for latency; CarQuery API for specs; MarketCheck API for pricing (e.g., Lancaster, TX); Google Merchant Center Products API for product catalog ingestion.
- **Primary goals**: Deliver CRUD-capable, relational resources with clear latency insights and comparison results. Example user stories:
  - “As an SRE, I want to see which monitored service is Sonic (<50ms), Knuckles (100–200ms), or Eggman (>500ms) so I can triage quickly.”
  - “As a car shopper, I want to input two models/years (Corvette vs. Mustang) and get a winner based on horsepower, 0–60, torque, and price.”
  - “As a merchandiser, I want to ingest Merchant Center products and compare items across merchants with sortable criteria.”

### Step 2: Problem-Solving Process
1) **Plan data + rubric alignment**: Define relational models (Monitor, MonitorResult, Product, Comparison, CarSpec, PriceQuote, User if auth). Ensure CRUD on at least one custom resource; include two+ related resources; store generated responses in SQL via SQLAlchemy.
2) **Backend skeleton**: FastAPI app, routers, Pydantic schemas, SQLAlchemy/Postgres setup, Alembic migrations, CORS, error handling, logging.
3) **Latency monitoring**: Async httpx pings or Checkly webhook ingest; map latency to Sonic/Knuckles/Eggman tiers; persist MonitorResults; expose `/status`, `/monitors` CRUD, `/results/latest`, `/results/history`.
4) **Car battle engine**: Integrate CarQuery for trims/specs; MarketCheck for ZIP-based pricing; endpoint `/cars/compare` returning raw specs, scoring rationale, and winner; supporting `/cars/trims` and `/cars/pricing`.
5) **Merchant product compare**: Use Google Merchant Center Products API to ingest; normalize into `products` and `comparisons`; endpoints `/products/search`, `/products/{id}`, `/products/compare` with scoring criteria; optional Sonic badges based on freshness/availability.
6) **Async tasks + scheduling**: APScheduler/Celery/RQ for recurring monitors; caching and rate limiting; backoff on failures; structured logs.
7) **Testing + docs**: pytest with httpx/requests mocks; error-path coverage; ReDoc/Swagger auto docs; concise README.

### Conceptual Outline
- **Data models** (SQLAlchemy):
  - Monitor(id, name, target_url, region, interval_s, enabled)
  - MonitorResult(id, monitor_id, latency_ms, status_tier, checked_at)
  - CarSpec(id, make, model, year, horsepower, zero_to_sixty_s, torque_lbft, source)
  - PriceQuote(id, make, model, year, price_usd, mileage, zip, source)
  - Product(id, merchant_id, title, brand, price, currency, condition, availability, link, last_synced_at)
  - Comparison(id, product_ids, criteria, scorecard, created_at)
  - User(optional): for auth/ownership
- **FastAPI routes** (illustrative):
  - `/health`, `/status`
  - `/monitors` (CRUD), `/monitors/{id}/run`, `/results/latest`, `/results/history`
  - `/cars/trims`, `/cars/pricing`, `/cars/compare`
  - `/products/search`, `/products/{id}`, `/products/compare`
- **Latency mapping**: <50ms → Sonic; 100–200ms → Knuckles; >500ms → Eggman; store raw latency + tier.
- **Tools**: FastAPI, httpx/asyncio, SQLAlchemy + Postgres, Alembic, APScheduler/Celery/RQ, pytest, requests/httpx mocks, optional React/Next frontend later.

### Step 3: Timeline and Scope
- **Day 1 — Planning**: Finalize models, env vars for API keys (Checkly, CarQuery, MarketCheck, Google Merchant), choose scheduler, set rubric check.
- **Day 2 — Backend scaffolding**: FastAPI project, DB models, migrations, base routers, health/status endpoints.
- **Day 3 — Latency module**: Async ping + tier mapping, Monitor CRUD, latest/history endpoints, error handling, logging.
- **Day 4 — Car battle**: Integrate CarQuery + MarketCheck, build compare logic and pricing endpoints, add tests.
- **Day 5 — Merchant compare**: Merchant Center ingest + search/compare endpoints, pagination, caching, tests.
- **Day 6 — Hardening**: Auth (if needed), rate limiting, retries/backoff, structured logs, CORS, input validation, error responses.
- **Day 7 — Testing & docs**: Expand pytest coverage, mock externals, write README usage examples, verify rubric alignment.

### Risks and Mitigations
- **API limits/keys**: Use env vars; add caching and backoff; fall back to stubbed data in tests.
- **Latency measurement noise**: Use multiple samples and percentiles; tag region; store raw latency.
- **Data completeness from Merchant/MarketCheck**: Normalize optional fields; surface missing-data flags.
- **Timeline pressure**: Time-box externals; ship core latency + car compare first, then merchant compare.

### Quick Setup Notes
- Python 3.11+, FastAPI, Postgres; install: `pip install fastapi uvicorn[standard] httpx sqlalchemy alembic psycopg2-binary apscheduler pytest`
- Run dev server: `uvicorn app.main:app --reload`
- Configure env: `CHECKLY_API_KEY`, `CARQUERY_BASE`, `MARKETCHECK_API_KEY`, `GOOGLE_MERCHANT_CREDENTIALS_JSON`, `DATABASE_URL`.

### Next Actions
- Confirm FastAPI over Flask and Postgres over SQLite.
- I can scaffold the FastAPI project with these models and stub endpoints next.Before you begin development on your full-stack productivity app, you’ll need to plan and communicate your vision clearly, just like you would on a real software team. This pitch simulates the planning phase of a professional product lifecycle, helping you strengthen your ability to define project goals, structure your workflow, and deliver a scoped, achievable product.

This assignment helps you develop key software engineering skills including:

Scoping and requirement gathering
Communicating technical and business goals
Designing problem-solving processes and workflows
Planning iterative development across a multi-stage build
A strong pitch ensures your idea is realistic, feasible, and aligned with the project rubric and business impact. Reminder on requirements for your project to keep in mind while developing your pitch:

Be built entirely from scratch by you.
Solve a user productivity issue, such as generating reports,viewing data, managing projects and assigned tasks, etc.
Include at least 2 relational resources in the backend (e.g., users, projects, dashboards, requests, responses, logs, tasks, notes).
Allow for basic CRUD on at least one custom resource.
Store generated responses in a SQL database using SQLAlchemy.
Include error handling for failed requests.
Instructions
You will submit a short project pitch that includes the following three components:

Step 1: Business Problem Scenario
Step 2: Problem Solving Process
Step 3: Timeline and Scope
Step 1: Business Problem Scenario
Write a clear explanation of:

The user problem your app solves in the domain of productivity (e.g., time management, task tracking, organization).
Who your target users are and what daily frustrations they face.
Why your solution adds value (e.g., streamlines workflows, reduces friction, saves time).
If applicable, mention how an external API or AI service will extend the app’s usefulness.
Define your project’s primary goal(s) and a few examples of user stories your app should support.
Example Prompts
What productivity pain point are you solving?
How will users interact with your app?
What will make your app unique or helpful?

Define your project plan and technical strategy. Your answer should include:

A step-by-step process (3–7 steps) for how you’ll build your app.
Pro-Tip: Use the Software Development Lifecycle Tasks.
A conceptual outline, such as:
A high-level flowchart, pseudocode, or list of app features
Your planned data models and how they relate
Planned React component breakdown
The tools and technologies you'll use (e.g., Flask, SQLAlchemy, React Router, useState/useEffect).
Mention where your process aligns with the project rubric: full CRUD, 2+ related resources, clean UI, documentation, optional API integration, etc.
(MAke an additional readme for this)


Create a realistic timeline for completing your app. Break the project into phases and estimate your time for each:

Planning and research
Backend setup and modeling
Frontend structure and styling
Debugging and testing
README, presentation, reflection
Timeline and Scope Considerations
Time-box your work across the total project timeframe
Identify when you may need to research APIs, tools, or libraries
Include time for debugging and iteration (e.g., after peer critique)
Call out any open questions or risks (e.g., “Need to learn Flask pagination”, “API integration may require key handling”)(Add this to the readme for step 2).








Submission and Grading Criteria
Review the rubric below to guide you in your submission and for details on the required criteria.
When you are ready, upload your pitch as a document (such as a Google Doc). Include any assets embedded in the document to submit it below. Make sure your final document is:
Clearly organized under the three required sections
1–2 pages in length
Optionally include diagrams, flowcharts, or wireframes as images or links
Project 2 Pitch: Full-Stack Application
Project 2 Pitch: Full-Stack Application
Criteria	Ratings	Points
Business Problem

Excelled
Problem clearly defined with real-world relevance and thoughtful user stories. Solution adds clear value.
25 pts

Met Expectations
Problem and user clearly defined with reasonable goals.
20 pts

Attempted
Problem is vague, lacks depth, or user not clearly described.
10 pts

No Attempt
No business problem submitted.
0 pts
/25 pts
Problem-Solving Process

Excelled
Process includes detailed steps, tools, model/feature planning, and rubric alignment.
25 pts

Met Expectations
Process outlined with reasonable steps and technology plan.
20 pts

Attempted
Process plan is unclear, incomplete, or lacking structure.
10 pts

No Attempt
No process submitted.
0 pts
/25 pts
Timeline and Scope

Excelled
Detailed and realistic breakdown with timeboxing, risks, and iteration points.
25 pts

Met Expectations
Includes a clear plan with some breakdowns and considerations.
20 pts

Attempted
Vague or overly simplistic timeline without detail.
10 pts

No Attempt
No timeline submitted.
0 pts
/25 pts
Professionalism & Presentation Quality

Excelled
Document is polished, well-formatted, free of spelling/grammar issues, and easy to follow. Visual hierarchy is used effectively (e.g., headings, bullets, bold).
25 pts

Met Expectations
Minor errors or inconsistencies, but clear and readable overall.
20 pts

Attempted
Submission lacks clarity due to frequent grammar, spelling, or formatting issues.
10 pts

No Attempt
Poorly formatted or unreadable; significant errors.
0 pts
/25 pts
Drag a file here, or click to select a file to upload
