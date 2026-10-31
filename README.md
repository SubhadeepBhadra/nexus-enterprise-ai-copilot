# Nexus Enterprise AI Copilot

[![Enterprise Ready](https://img.shields.io/badge/Enterprise-Ready-blue.svg)](#)
[![Security Clearance](https://img.shields.io/badge/RBAC-Level%205%20Executive-purple.svg)](#)
[![HITL Governance](https://img.shields.io/badge/Human--in--the--Loop-Active-emerald.svg)](#)
[![Zero Dependency](https://img.shields.io/badge/Dependencies-Zero%20External-green.svg)](#)

A production-grade, permission-aware Enterprise AI Copilot built with **Retrieval-Augmented Generation (RAG)**, **Autonomous Multi-Agent Orchestration**, **Role-Based Access Control (RBAC)**, **Strict ACL-Enforced Retrieval**, **Human-In-The-Loop (HITL) Safety Gates**, and **Business Intelligence Analytics**.

Designed with an ultra-clean, modern light-mode interface inspired by Linear, Notion, and Databricks.

---

## 🏛️ System Architecture

```
                                      ┌─────────────────────────────────────┐
                                      │         User Request & Query        │
                                      └──────────────────┬──────────────────┘
                                                         │
                                      ┌──────────────────▼──────────────────┐
                                      │      Enterprise Orchestrator        │
                                      │  (Intent Classification & Planning) │
                                      └───────┬──────────┬──────────┬───────┘
                                              │          │          │
                     ┌────────────────────────┘          │          └────────────────────────┐
                     │                                   │                                   │
       ┌─────────────▼─────────────┐       ┌─────────────▼─────────────┐       ┌─────────────▼─────────────┐
       │ Knowledge Retrieval Agent │       │  Workflow Automation Agent│       │ Business Analytics Agent  │
       │   (Semantic RAG Search)   │       │ (Multi-System Execution)  │       │ (BI & KPI Telemetry)      │
       └─────────────┬─────────────┘       └─────────────┬─────────────┘       └─────────────┬─────────────┘
                     │                                   │                                   │
       ┌─────────────▼─────────────┐       ┌─────────────▼─────────────┐                     │
       │   Strict ACL RBAC Filter  │       │  Compliance Guardian Gate │                     │
       │  (Permission Enforcement) │       │   (HITL Approval Check)   │                     │
       └─────────────┬─────────────┘       └─────────────┬─────────────┘                     │
                     │                                   │                                   │
                     │                     ┌─────────────▼─────────────┐                     │
                     │                     │  Pending Human Approval   │                     │
                     │                     │  (Interactive Review Card)│                     │
                     │                     └─────────────┬─────────────┘                     │
                     │                                   │ (Approved)                        │
                     └───────────────────┬───────────────┴───────────────────────────────────┘
                                         │
                               ┌─────────▼──────────┐
                               │ Immutable Audit Log│
                               │  (Ledger & Traces) │
                               └────────────────────┘
```

---

## ✨ Core Features & Technical Highlights

### 1. Enterprise Knowledge Search (RAG) & Global Command Palette
* **Semantic Vector & BM25 Hybrid Retrieval**: Tokenizes, normalizes, and chunks 28 multi-page enterprise documents into 64 semantic sections with headers, tags, and department metadata.
* **Global Enterprise Command Palette (Ctrl+K)**: Real-time search modal with category tabs (`All`, `Knowledge Docs`, `Agent Workflows`, `Navigation`). Instantly searches across documents, runbooks, and pages.
* **Citation Anchoring**: Returns factual summaries with clickable interactive citations `[Doc #1: DOC-ENG-001]` linked to a slide-out deep-dive document viewer.
* **Dynamic Ingestion Pipeline**: Ingest new operational policies or markdown documents live from the UI with custom clearance tags and instant indexing.

### 2. Multi-Session Chat History & Thread Management
* **Conversations Sidebar**: Integrated 2-column workspace featuring a dedicated Chat History panel.
* **`+ New Chat` Workspace**: Start brand-new conversation threads with one click.
* **Session Persistence & Deletion**: Switch between past conversation threads, inspect historical thoughts/citations, delete individual threads, or clear all history on demand.

### 2. Strict Role-Based Access Control (RBAC)
* **Multi-Tier Security Clearances**:
  * **Level 5 - Executive / CIO**: Full visibility across all enterprise systems and confidential M&A deal rooms.
  * **Level 4 - HR-Restricted**: Access to executive compensation bands, 9-box talent reviews, and PIPs.
  * **Level 4 - Finance-Restricted**: Access to audited EBITDA, ARR, monthly burn rate, and procurement ledgers.
  * **Level 3 - Internal Technical**: Access to Kubernetes architecture, database schemas, and microservice topologies.
  * **Level 2 - General Internal**: Brand guidelines, company values, travel policies, product roadmaps.
  * **Level 1 - External Auditor**: Public disclosures and high-level compliance summaries only.
* **Pre-Retrieval Policy Enforcement**: Documents with clearance above the user's role are masked *before* feeding context to the model, preventing prompt leakage.

### 3. Autonomous AI Agents & ReAct Reasoning Loops
* **Specialist Agent Swarm**:
  * **Orchestrator Agent**: Breaks queries into structured DAG plans.
  * **Knowledge Agent**: Formulates queries, inspects metadata, cross-references sources.
  * **Automation Agent**: Executes real-world workflows (EKS scaling, schema migrations, customer refunds).
  * **BI & Data Analyst Agent**: Translates questions into SQL aggregations and renders interactive SVG charts.
  * **Compliance Guardian Agent**: Detects PII and enforces risk policies.
* **Step-by-Step Thought Stream**: Accordion in chat displays `Thought` ➔ `Action` ➔ `Tool Call` ➔ `Observation` ➔ `Outcome`.

### 4. Human-In-The-Loop (HITL) Governance
* **Sensitive Action Safeguards**: Operations with high financial or system blast radius (e.g. cluster scaling > $10,000/mo, production DB alterations, wire refunds > $2,000) are automatically intercepted.
* **Interactive Approval Cards**: Renders in-chat and in the dedicated **Governance Center** with JSON parameter diffs, risk assessment, and cost impact.
* **Approval / Rejection Resumption**: Clicking "Authorize" immediately resumes agent execution with audit tracking and confirmation tokens.

### 5. Business Intelligence & Executive KPI Hub
* **Real-Time Telemetry**: Tracks Total Queries (1,420+), Retrieval Precision (99.4%), ACL Blocks (38 prevented), and Saved Employee Hours (1,240 hrs).
* **Pure SVG Interactive Charts**: Zero external CDN dependencies.
  * Weekly query volume and latency trends.
  * Department adoption distribution (Engineering, Finance, HR, Sales, Legal).
  * Budget vs Actual Spend waterfall comparison.
* **One-Click Strategic Briefs**: Generates an instant synthesis of Q3 FY2026 ARR, gross margins, EBITDA, and runway.

### 6. Immutable Security & Audit Ledger
* **Comprehensive Event Tracking**: Logs every query, user role, retrieved vs blocked document IDs, latency (ms), risk classification, and approval state.
* **Export Options**: One-click export to CSV and JSON for compliance auditing.

---

## 🚀 Quickstart & Setup Guide

The application has **zero third-party npm dependencies** and can be run in two ways:

### Option 1: Direct Browser Launch (Instant)
Simply double-click or open `index.html` in any web browser (Chrome, Edge, Firefox, Safari). The complete vector search engine, agent orchestration loop, role switcher, and chart engine run 100% in-browser!

### Option 2: Run via Local HTTP Server
Using the bundled lightweight Node.js server:

```powershell
# From the project directory:
.\start.bat
# or in PowerShell:
.\start.ps1
# or in CMD:
start.bat
```

Or run directly with Node:
```bash
node server.js
```
The server will start at `http://localhost:3000`.

---

## 🧪 Demonstration & Evaluation Walkthrough

Follow these 4 test scenarios to evaluate the platform:

| Test Scenario | Action | What to Observe |
| :--- | :--- | :--- |
| **1. Strict ACL Enforcement** | Select **Alex Rivera (Staff Engineer)** and ask: `"Show me the executive compensation bands and bonus matrix for FY2026"` | System blocks retrieval of `DOC-HR-102` (`HR-Restricted`), shows a security clearance alert, and records an `ACL_POLICY_ENFORCEMENT` event in the Audit Ledger. |
| **2. Role Clearance Escalation** | Switch persona to **Subhadeep Bhadra (CIO)** or **Marcus Vance (VP People)** and repeat the same question | The document is successfully retrieved with verified citations `[Doc #1: DOC-HR-102]`, showing confidential salary tiers. |
| **3. Human-In-The-Loop Approval** | Ask: `"Scale EKS production compute cluster from 12 to 36 nodes"` | Execution halts at Step 3/4. An interactive amber Approval Card is rendered. Click **"Authorize Execution"** to resume agent execution and receive confirmation token `#AUTH-...`. |
| **4. Business Intelligence & Charts** | Ask: `"What was our Q3 ARR, gross margin, monthly burn rate, and runway?"` | The BI Agent aggregates data from `DOC-FIN-201`, renders an audited financial metrics table, and embeds an interactive spend vs budget chart. |

---

## 📁 Project Structure

```
enterprise-ai-copilot/
├── index.html           # Main Single Page Application UI & layouts
├── css/
│   └── styles.css       # Enterprise light-mode design system & animations
├── js/
│   ├── data.js          # Enterprise documents (28 docs), RBAC profiles & workflows
│   ├── rag.js           # Semantic RAG Engine with TF-IDF, vector scoring & ACL filter
│   ├── agents.js        # Multi-Agent Orchestrator, ReAct loop & HITL gate
│   ├── analytics.js     # Audit logging ledger & SVG chart rendering engine
│   └── app.js           # Application controller & event bindings
├── server.js            # Standalone zero-dependency Node.js HTTP server
├── test-copilot.js      # Automated test suite verifying all criteria
├── start.bat            # Windows one-click launcher
├── start.ps1            # PowerShell launcher
└── README.md            # Technical documentation & guide
```

---

## 🔒 Security & Compliance Principles
* **Least Privilege**: Retrieval evaluates user credentials at search time; unauthorized document content never enters the LLM prompt.
* **Separation of Duties**: Sensitive actions cannot be auto-executed by low-tier roles.
* **Auditability**: Every agent thought step, document access, and manual override is permanently recorded in the immutable audit trail.

