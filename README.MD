
Project Pitch: Sonic Speedometer & Market Battle Engine
Step 1: Business Problem Scenario
The Problem

In modern software development and retail, data is often fragmented. DevOps teams struggle to visualize service health without digging through dense logs, while consumers and merchandisers face "tab fatigue" the need to switch between dozens of browser tabs to compare technical specs or pricing for cars and retail products.

Target Users

DevOps/SREs: Monitoring internal microservices who need "at-a-glance" status updates.

Car Shoppers: Individuals looking for high-performance vehicles (e.g., Corvette vs. Mustang) who need objective data wins.

Merchandisers: Professionals aggregating product data to ensure competitive pricing.

The Value Proposition

This application provides a centralized FastAPI backend that transforms raw data into actionable insights. By using "Sonic the Hedgehog" character tiers for latency, it reduces cognitive load for engineers. The "Battle Engine" automates the comparison of complex specs, saving users hours of manual research.

User Stories

SRE Status Check: "As an SRE, I want to see which monitored service is Sonic (<50ms), Knuckles (100–200ms), or Eggman (>500ms) so I can triage latency spikes instantly."

The Head-to-Head: "As a car shopper, I want to compare a 2024 Corvette vs. a 2024 Mustang and see a clear 'Winner' based on horsepower and 0–60 times."

Market Comparison: "As a merchandiser, I want to ingest Google Merchant Center data to see how my product pricing compares to competitors in real-time."

Step 2: Problem-Solving Process
Development Workflow

Architecture Design: Define SQLAlchemy models with relational integrity (e.g., Monitor has many MonitorResults).

API Integration: Establish secure connections to CarQuery, MarketCheck, and Google Merchant Center using environment variables.

Service Layer: Build the "Sonic Tier" logic and the "Battle Logic" for scoring products/cars.

Backend Implementation: Develop FastAPI routes with robust error handling and Pydantic validation.

Asynchronous Tasks: Implement APScheduler for recurring latency pings.

Frontend (Future): React dashboard to visualize the "Battle" results and Sonic badges.

Technical Stack

Backend: FastAPI (Python 3.11+)

Database: PostgreSQL with SQLAlchemy ORM

Migration: Alembic

Testing: Pytest with httpx mocking

External APIs: Checkly, CarQuery, MarketCheck, Google Merchant Center

Step 3: Timeline and Scope
Phase	Duration	Key Deliverables
Phase 1: Planning	Day 1	Schema design, API Key procurement, Env setup.
Phase 2: Scaffolding	Day 2	FastAPI boilerplate, DB migrations, Health checks.
Phase 3: Latency Module	Day 3	Async ping logic, Sonic tier mapping, CRUD for Monitors.
Phase 4: Battle Engine	Day 4-5	CarQuery/MarketCheck integration, Comparison logic.
Phase 5: Merchant Ingest	Day 6	Google Merchant Center integration, Search/Sort features.
Phase 6: Hardening	Day 7	Error handling, Logging, Pytest coverage, Final Documentation.
Risks & Mitigations

API Rate Limits: I will implement local caching and backoff strategies to prevent being blocked by external providers.

Data Consistency: Since different APIs return different fields, I will use a Normalization Layer to map all data to a consistent Pydantic schema.

Supplemental README (Technical Strategy)
Rubric Alignment

2+ Relational Resources: The app uses Monitor -> MonitorResult and Product -> Comparison.

Full CRUD: Users can Create, Read, Update, and Delete monitoring targets.

SQL Persistence: All comparison results and latency tiers are stored in PostgreSQL via SQLAlchemy.

Error Handling: Global exception handlers manage 404s, 500s, and external API timeouts.

Data Models

Monitor: Stores the target URL and region.

MonitorResult: Stores the latency_ms and the calculated sonic_tier.

Product/CarSpec: Stores the raw attributes used for "Battles."

Comparison: Stores the scorecard and the "Winner" of a head-to-head match.
