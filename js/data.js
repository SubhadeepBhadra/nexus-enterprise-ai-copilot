/**
 * Enterprise AI Copilot - Data Models & Knowledge Repository
 * Includes RBAC roles, permission tiers, 20+ enterprise documents across departments,
 * pre-indexed vector embeddings/metadata, and workflow templates.
 */

window.ENTERPRISE_DATA = {
  // Roles and Permissions Hierarchy
  // Tier 1: External Contractor, Tier 2: General Internal, Tier 3: Technical/Dept Specialist,
  // Tier 4: Confidential/Executive Dept, Tier 5: CIO/Admin All-Access
  ROLES: {
    cio_admin: {
      id: "cio_admin",
      name: "Subhadeep Bhadra",
      title: "Chief Information Officer & Admin",
      department: "Executive",
      clearanceTier: 5,
      clearanceLabel: "Executive / Level 5 (Top Secret)",
      badgeClass: "badge-purple",
      initials: "SB",
      avatarBg: "linear-gradient(135deg, #6366F1, #8B5CF6)",
      allowedClearances: ["Public", "Internal", "Confidential", "HR-Restricted", "Finance-Restricted", "Executive-Eyes-Only"],
      permissions: {
        canSearchAllDocs: true,
        canApproveSensitiveActions: true,
        canExecuteWorkflows: true,
        canViewAuditLogs: true,
        canManageDocuments: true,
        canViewExecutiveInsights: true
      }
    },
    hr_director: {
      id: "hr_director",
      name: "Marcus Vance",
      title: "VP of People & Culture",
      department: "Human Resources",
      clearanceTier: 4,
      clearanceLabel: "HR-Confidential / Level 4",
      badgeClass: "badge-rose",
      initials: "MV",
      avatarBg: "linear-gradient(135deg, #F43F5E, #E11D48)",
      allowedClearances: ["Public", "Internal", "Confidential", "HR-Restricted"],
      permissions: {
        canSearchAllDocs: false,
        canApproveSensitiveActions: true, // For HR workflows
        canExecuteWorkflows: true,
        canViewAuditLogs: false,
        canManageDocuments: true,
        canViewExecutiveInsights: false
      }
    },
    finance_controller: {
      id: "finance_controller",
      name: "Sophia Lin",
      title: "Principal Financial Controller",
      department: "Finance & Accounting",
      clearanceTier: 4,
      clearanceLabel: "Finance-Restricted / Level 4",
      badgeClass: "badge-amber",
      initials: "SL",
      avatarBg: "linear-gradient(135deg, #F59E0B, #D97706)",
      allowedClearances: ["Public", "Internal", "Confidential", "Finance-Restricted"],
      permissions: {
        canSearchAllDocs: false,
        canApproveSensitiveActions: true, // For Finance workflows
        canExecuteWorkflows: true,
        canViewAuditLogs: false,
        canManageDocuments: true,
        canViewExecutiveInsights: true
      }
    },
    staff_engineer: {
      id: "staff_engineer",
      name: "Alex Rivera",
      title: "Staff Infrastructure Engineer",
      department: "Engineering",
      clearanceTier: 3,
      clearanceLabel: "Internal-Technical / Level 3",
      badgeClass: "badge-blue",
      initials: "AR",
      avatarBg: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
      allowedClearances: ["Public", "Internal", "Confidential"],
      permissions: {
        canSearchAllDocs: false,
        canApproveSensitiveActions: false, // Must request approval for prod changes
        canExecuteWorkflows: true,
        canViewAuditLogs: false,
        canManageDocuments: false,
        canViewExecutiveInsights: false
      }
    },
    marketing_specialist: {
      id: "marketing_specialist",
      name: "Maya Patel",
      title: "Growth Marketing Specialist",
      department: "Marketing & Growth",
      clearanceTier: 2,
      clearanceLabel: "General Internal / Level 2",
      badgeClass: "badge-green",
      initials: "MP",
      avatarBg: "linear-gradient(135deg, #10B981, #059669)",
      allowedClearances: ["Public", "Internal"],
      permissions: {
        canSearchAllDocs: false,
        canApproveSensitiveActions: false,
        canExecuteWorkflows: false,
        canViewAuditLogs: false,
        canManageDocuments: false,
        canViewExecutiveInsights: false
      }
    },
    contractor: {
      id: "contractor",
      name: "Lucas Thorne",
      title: "External Security Auditor (Contractor)",
      department: "Legal & Audit",
      clearanceTier: 1,
      clearanceLabel: "Restricted External / Level 1",
      badgeClass: "badge-slate",
      initials: "LT",
      avatarBg: "linear-gradient(135deg, #64748B, #334155)",
      allowedClearances: ["Public"],
      permissions: {
        canSearchAllDocs: false,
        canApproveSensitiveActions: false,
        canExecuteWorkflows: false,
        canViewAuditLogs: false,
        canManageDocuments: false,
        canViewExecutiveInsights: false
      }
    }
  },

  // 22 Enterprise Documents with comprehensive text, classification, ACLs, and tags
  DOCUMENTS: [
    {
      id: "DOC-ENG-001",
      title: "Global Cloud Architecture & Kubernetes Multi-Region Topology",
      department: "Engineering",
      clearance: "Internal",
      author: "Alex Rivera (Staff SRE)",
      updatedAt: "2026-09-15",
      version: "v4.2",
      tags: ["infrastructure", "aws", "kubernetes", "cloud", "architecture", "disaster-recovery"],
      summary: "Overview of production EKS clusters across us-east-1 and eu-central-1, routing latency benchmarks, and failover runbooks.",
      content: `### 1. Multi-Region Topology Overview
Our primary production workload runs on AWS Elastic Kubernetes Service (EKS) across two active-active regions: us-east-1 (N. Virginia, 65% baseline traffic) and eu-central-1 (Frankfurt, 35% baseline traffic). Route53 Latency-Based Routing (LBR) handles incoming edge DNS resolution.

### 2. Node Group Sizing & Autoscaling
Standard clusters utilize c6i.4xlarge compute instances managed by Karpenter for rapid node provisioning. Baseline node pool is 24 nodes in us-east-1 and 16 nodes in eu-central-1. Horizontal Pod Autoscalers (HPA) scale pods based on 70% target CPU utilization and 65% memory watermark.

### 3. Critical Disaster Recovery & Failover SLAs
In case of catastrophic AZ or regional outage, automated failover triggers within 90 seconds. Cross-region Aurora PostgreSQL replication maintains an RPO of < 1 second and RTO of < 3 minutes.
Any production cluster scaling action exceeding 50 nodes or $10,000/mo cost delta requires explicit Human-In-The-Loop approval from the Infrastructure Lead or CIO.`
    },
    {
      id: "DOC-ENG-002",
      title: "PostgreSQL Database Schema Migration & Connection Pool Runbook",
      department: "Engineering",
      clearance: "Internal",
      author: "Devin Zhao (Principal Data Architect)",
      updatedAt: "2026-10-02",
      version: "v2.8",
      tags: ["database", "postgres", "migration", "pgbouncer", "sql"],
      summary: "Zero-downtime database migration guidelines, PgBouncer pooling parameters, and table partitioning strategies.",
      content: `### 1. Zero-Downtime Migration Mandate
All schema alterations on tables exceeding 5,000,000 rows must utilize the expand-and-contract pattern. Direct 'ALTER TABLE ADD COLUMN' with non-null defaults without constraints is strictly prohibited on production clusters.

### 2. Production Migration Execution Protocol
1. Schema changes must run through automated shadow replication in the staging sandbox first.
2. Production schema execution is classified as a HIGH-RISK action. The AI copilot cannot execute direct migrations without interactive 2-person authorization or CIO approval.
3. PgBouncer pool mode is set to 'transaction'. Max client connections per pool: 1,500. Statement timeout is capped at 12,000ms to prevent runaway table locks.`
    },
    {
      id: "DOC-HR-101",
      title: "Global Employee Benefits, Wellness Allowance & Paid Leave 2026",
      department: "Human Resources",
      clearance: "Internal",
      author: "Marcus Vance (VP People)",
      updatedAt: "2026-08-20",
      version: "v2026.1",
      tags: ["hr", "benefits", "leave", "wellness", "pto", "health-insurance"],
      summary: "Full catalog of employee benefits, healthcare coverage tiers, $1,500 annual wellness reimbursement, and 25-day PTO policy.",
      content: `### 1. Paid Time Off (PTO) Policy
All full-time global team members receive 25 standard paid vacation days annually, in addition to 11 recognized company-wide public holidays and 5 dedicated mental health recharge days.

### 2. Healthcare & Comprehensive Coverage
Company sponsors 100% of employee healthcare, dental, and vision premiums, and 80% of dependent coverage through BlueShield Global. Coverage begins on day one of employment.

### 3. Wellness & Learning Stipends
- Annual Wellness Reimbursement: $1,500 per calendar year for gym memberships, ergonomic home equipment, or mental health therapy.
- Professional Learning & Development: $2,500 per employee per year for conferences, certifications, and technical books.`
    },
    {
      id: "DOC-HR-102",
      title: "Executive Compensation Bands, Equity Tranches & Bonus Matrices (CONFIDENTIAL)",
      department: "Human Resources",
      clearance: "HR-Restricted",
      author: "Subhadeep Bhadra & Marcus Vance",
      updatedAt: "2026-09-28",
      version: "v2026.Confidential",
      tags: ["compensation", "salary", "executive", "bonus", "equity", "confidential", "hr-only"],
      summary: "Confidential salary tiers, equity grant schedules (ISO/NSO), and executive incentive bonus formulas for FY2026-2027.",
      content: `### 1. Executive Level Salary Bands (CONFIDENTIAL - RESTRICTED HR ACCESS ONLY)
- Level E-1 (VP / Head of Department): Base $260,000 - $340,000 | Target Bonus: 35% | Equity: 40,000 - 75,000 RSUs (4-year vesting, 1-year cliff).
- Level E-2 (SVP / Managing Director): Base $350,000 - $440,000 | Target Bonus: 45% | Equity: 90,000 - 160,000 RSUs.
- Level C-Suite (CXO / President): Base $450,000 - $580,000 | Target Bonus: 60% | Discretionary Board Pool.

### 2. Performance Multiplier Matrix
Bonuses are calculated based on Enterprise EBITDA Achievement (50% weighting) and Individual Strategic Objectives (50% weighting). Multipliers range from 0.0x for <85% target achievement to 1.75x for >125% overperformance.

### 3. Data Privacy Warning
Access to this document is strictly monitored and audited. Unauthorized disclosure or attempted extraction without HR Director or CIO clearance triggers immediate security escalation.`
    },
    {
      id: "DOC-HR-103",
      title: "Performance Review Cycles, Promotion Calibration & PIP Guidelines",
      department: "Human Resources",
      clearance: "HR-Restricted",
      author: "Marcus Vance (VP People)",
      updatedAt: "2026-07-12",
      version: "v3.1",
      tags: ["performance", "reviews", "promotions", "pip", "calibration"],
      summary: "Bi-annual review timelines, 9-box talent matrix calibration, and performance improvement plan protocols.",
      content: `### 1. Bi-Annual Review Calendar
H1 Review Cycle opens June 1st and closes July 15th. H2 Review Cycle opens December 1st and closes January 20th. Evaluations comprise self-review, peer 360 feedback (minimum 3 peers), and direct manager calibration.

### 2. 9-Box Calibration Model
Department heads calibrate team members across Potential (Low, Medium, High) and Performance (Underperforming, Consistent Contributor, Star Performer). High Potential / Star Performers qualify for accelerated promotion track and spot equity refreshers.

### 3. Performance Improvement Plan (PIP) Protocol
Employees placed on a 60-day Performance Improvement Plan must have clear weekly verifiable milestones agreed upon by the manager and HR Business Partner. Severance guidelines apply if milestone completion is under 70%.`
    },
    {
      id: "DOC-FIN-201",
      title: "Q3 FY2026 Corporate Financial Performance, SaaS Metrics & Runway Analysis",
      department: "Finance & Accounting",
      clearance: "Finance-Restricted",
      author: "Sophia Lin (Principal Controller)",
      updatedAt: "2026-10-18",
      version: "v1.4",
      tags: ["finance", "q3", "arr", "ebitda", "runway", "burn-rate", "revenue"],
      summary: "Audited financial breakdown of Q3 performance: $48.2M ARR (+34% YoY), 81.4% gross margin, $2.1M monthly net burn, 26 months cash runway.",
      content: `### 1. Executive Financial Summary Q3 2026
- Annual Recurring Revenue (ARR): Reached $48,240,000, representing 34.2% YoY expansion and beating quarterly guidance of $46.8M.
- Net Revenue Retention (NRR): 122.6%, powered by enterprise tier expansions and AI Copilot add-on module adoption.
- Gross Margin: 81.4% (up 180 bps YoY due to cloud GPU infrastructure inference optimization).

### 2. Cash Position, Burn Rate & Runway
Total cash and short-term liquid treasury holdings stand at $54,600,000. Average monthly net burn rate for Q3 was $2,100,000. Current runway extends to 26 months without additional capital injection.

### 3. Departmental Spend vs Budget Variance
- Engineering & Cloud Infrastructure: $4,850,000 (Over budget by +$320,000 due to LLM fine-tuning compute spikes).
- Sales & Marketing: $6,100,000 (Favorable variance of -$280,000).
- G&A and Legal: $1,900,000 (On target).`
    },
    {
      id: "DOC-FIN-202",
      title: "Corporate Procurement, Vendor Expenditure & Discretionary Limits Policy",
      department: "Finance & Accounting",
      clearance: "Internal",
      author: "Sophia Lin & Finance Committee",
      updatedAt: "2026-06-30",
      version: "v3.0",
      tags: ["procurement", "expenses", "vendor", "spending-limits", "approvals"],
      summary: "Threshold spending rules: Managers up to $5,000, Directors up to $25,000, VP/C-Suite above $25,000. AI copilot automated threshold enforcement.",
      content: `### 1. Spending Authority Matrix
- Level 1 (Individual Contributor): $500 monthly discretionary limit on software tools.
- Level 2 (Engineering / Team Manager): Up to $5,000 single transaction approval.
- Level 3 (Department Director): Up to $25,000 single transaction approval.
- Level 4 (VP / C-Level): Over $25,000 and all recurring SaaS contracts exceeding $50,000 ARR.

### 2. Cloud Resource & API Spending Guardrails
Any automated agent request or system change that triggers monthly projected cost increase > $10,000 MUST generate a Human-In-The-Loop approval task assigned to Finance and Engineering leadership before provisioning occurs.`
    },
    {
      id: "DOC-EXEC-301",
      title: "Project Valkyrie: Enterprise Strategic M&A Target Evaluation (TOP SECRET)",
      department: "Executive",
      clearance: "Executive-Eyes-Only",
      author: "Subhadeep Bhadra & Board Strategic Committee",
      updatedAt: "2026-10-15",
      version: "v0.9-Draft",
      tags: ["mergers", "acquisition", "valkyrie", "board", "strategy", "confidential", "executive"],
      summary: "Classified acquisition analysis of SynapseFlow AI ($18M purchase price target) to accelerate agent workflow graph automation capabilities.",
      content: `### 1. Project Valkyrie Thesis (STRICTLY CONFIDENTIAL - BOARD & C-SUITE EYES ONLY)
Evaluation of potential asset acquisition of SynapseFlow AI Inc., a 24-person startup specializing in deterministic agentic DAG engines and enterprise compliance interceptors.

### 2. Financial Terms & Valuation Framework
- Proposed Enterprise Valuation: $18,000,000 (combination of 60% equity in Series C preference shares, 40% upfront cash).
- Estimated Integration Synergies: Reduces internal copilot development roadmap by 14 months and captures $6.2M in pipeline ARR within 3 quarters.

### 3. Regulatory & Anti-Trust Review
Preliminary legal counsel indicates zero FTC or EU antitrust friction given sub-$50M transaction threshold. Target closing date: Q1 2027.
Access violation: Any query from non-executive personnel attempting to retrieve details on 'Valkyrie' or 'SynapseFlow' must be blocked and recorded in security audit logs.`
    },
    {
      id: "DOC-SEC-401",
      title: "SOC 2 Type II Security Controls, Encryption Standards & Audit Evidence",
      department: "Legal & Audit",
      clearance: "Internal",
      author: "Chief Information Security Officer",
      updatedAt: "2026-09-01",
      version: "v2026-SOC2",
      tags: ["security", "soc2", "encryption", "compliance", "kms", "pii", "audit"],
      summary: "Detailed overview of AES-256 data-at-rest encryption, TLS 1.3 in-transit requirements, IAM least privilege policies, and annual SOC 2 compliance verification.",
      content: `### 1. Cryptographic Standards
All persistent customer data, embeddings, and chat transcripts must be encrypted at rest using AWS KMS managed customer keys with AES-256-GCM. All HTTP traffic is terminated with TLS 1.3 exclusively. TLS 1.0 and 1.1 are permanently disabled across all edge ALBs.

### 2. Role-Based Access Control (RBAC) & Principle of Least Privilege
System access is governed by dynamic RBAC. No employee possesses persistent production database write access. JIT (Just-In-Time) access requires 2-factor authentication, ticketing justification, and automatic expiration after 60 minutes.

### 3. PII Redaction & Data Loss Prevention (DLP)
The AI Copilot operates with an inline DLP guardian that sanitizes Social Security Numbers, credit card numbers, personal telephone numbers, and corporate API keys before context is passed to the generation pipeline.`
    },
    {
      id: "DOC-PROD-501",
      title: "Q4 2026 Enterprise Product Roadmap & AI Agent Features",
      department: "Product & Strategy",
      clearance: "Internal",
      author: "Priya Sharma (VP of Product)",
      updatedAt: "2026-10-05",
      version: "v3.3",
      tags: ["product", "roadmap", "features", "agents", "rag", "q4"],
      summary: "Roadmap milestones: Autonomous multi-agent coordination, conversational SQL BI generation, cross-platform Slack & Teams copilot integration.",
      content: `### 1. Vision: The Autonomous Enterprise Copilot
Our goal for Q4 2026 is transforming the internal assistant from a passive Q&A chatbot into an autonomous enterprise copilot capable of executing verified end-to-end multi-step tasks across Jira, Salesforce, GitHub, and Datadog.

### 2. Key Release Milestones
- Milestone Alpha (October 2026): Permission-enforced RAG with real-time ACL filtering, document ingestion pipelines, and interactive citation overlays.
- Milestone Beta (November 2026): Autonomous Agent Orchestration with Human-In-The-Loop approval gates for financial and infrastructure operations.
- Milestone GA (December 2026): Business Intelligence Synthesis Engine with automated SVG chart rendering and executive brief generation.`
    },
    {
      id: "DOC-SALES-601",
      title: "Enterprise Deal Pricing, Discount Authority Matrix & SLA Commitments",
      department: "Sales & Go-To-Market",
      clearance: "Internal",
      author: "Carter Vance (Chief Revenue Officer)",
      updatedAt: "2026-08-15",
      version: "v2.1",
      tags: ["sales", "pricing", "discounts", "sla", "contracts", "customers"],
      summary: "Annual enterprise seat pricing ($48/user/mo), discount approval tiers (AE up to 10%, VP up to 25%, CFO over 25%), and 99.95% uptime SLA guarantees.",
      content: `### 1. Enterprise Tier Pricing
- Copilot Enterprise Core: $48/seat/month billed annually. Minimum deal size: 100 seats ($57,600 ARR).
- Copilot Ultimate with Custom RAG Connectors: $72/seat/month.
- Dedicated Single-Tenant VPC Deployment: Flat $45,000 annual infrastructure surcharge.

### 2. Discount Approval Thresholds
- Account Executive (AE): Up to 10% discount for multi-year commitments.
- Sales Director: Up to 20% discount.
- VP of Sales: Up to 28% discount with accelerated payment terms.
- Deals requiring > 30% discount or non-standard indemnity terms require approval from CFO Sophia Lin.`
    },
    {
      id: "DOC-OPS-701",
      title: "Company Travel, Expense Reimbursement & Corporate Card Guidelines",
      department: "Operations",
      clearance: "Public",
      author: "Operations & Facilities Team",
      updatedAt: "2026-05-10",
      version: "v1.9",
      tags: ["travel", "expenses", "meals", "flights", "hotels", "corporate-card"],
      summary: "Standard travel guidelines: Economy flights for under 6 hours, $75 daily meal per diem, hotel night limit $250, Expensify submission deadlines.",
      content: `### 1. Flight & Rail Booking
Team members should book travel via Navan at least 14 days in advance. Economy class is standard for flights under 6 hours continuous flight time. Premium Economy or Business Class is authorized for transoceanic flights exceeding 8 hours.

### 2. Lodging & Daily Meals
- Hotel cap: Up to $250/night in standard metros, up to $350/night in tier-1 high-cost cities (SF, NYC, London, Tokyo).
- Meal per diem: $75 per day on travel days. Itemized receipts are mandatory for all transactions over $25.`
    },
    {
      id: "DOC-SEC-402",
      title: "Incident Response Severity Matrix, PagerDuty Escalation & War Room Protocols",
      department: "Engineering",
      clearance: "Internal",
      author: "Platform Security & SRE Incident Response Team",
      updatedAt: "2026-09-22",
      version: "v3.0",
      tags: ["incident", "pagerduty", "sev1", "sev2", "sre", "outage", "war-room"],
      summary: "Severity definitions from SEV-0 (Catastrophic) to SEV-3 (Minor), 15-minute response SLA for SEV-1, automated war room generation.",
      content: `### 1. Incident Classification
- SEV-0: Total customer outage or verified active data breach. SLA: 5-minute response, immediate CEO/CIO notification, automated Zoom war room.
- SEV-1: Core service degraded > 20% error rate. SLA: 15-minute response, Incident Commander assigned.
- SEV-2: Non-critical feature outage or regional latency spike. SLA: 45-minute response.
- SEV-3: Minor bug with available customer workaround. SLA: Next business day.

### 2. AI Incident Agent Automation
The Copilot Incident Agent has permission to query CloudWatch metrics, fetch Datadog traces, and post status summaries to #incident-war-room. It cannot restart production database clusters without Human-In-The-Loop confirmation from the on-call Commander.`
    },
    {
      id: "DOC-ENG-003",
      title: "Microservices Service Mesh & Istio Mutual TLS (mTLS) Security Spec",
      department: "Engineering",
      clearance: "Internal",
      author: "Alex Rivera (Staff SRE)",
      updatedAt: "2026-07-08",
      version: "v1.6",
      tags: ["istio", "service-mesh", "mtls", "security", "microservices"],
      summary: "Istio 1.24 service mesh architecture, strict mTLS policy enforcement across namespaces, and Envoy sidecar resource optimization.",
      content: `### 1. Zero-Trust Mesh Architecture
All inter-service traffic within Kubernetes namespaces is strictly encrypted via Istio mTLS with SPIFFE/SPIRE x509 identity certificates rotated every 24 hours.

### 2. Traffic Management & Circuit Breaking
Envoy sidecars are configured with aggressive circuit breakers: 5 consecutive 5xx errors trigger 30-second pod ejection from upstream load balancing pools. Max connection backlog: 1024.`
    },
    {
      id: "DOC-LEGAL-801",
      title: "Standard Enterprise Master Services Agreement (MSA) & SLA Contract Boilerplate",
      department: "Legal & Audit",
      clearance: "Internal",
      author: "Corporate Legal Counsel",
      updatedAt: "2026-04-12",
      version: "v2026.2",
      tags: ["legal", "msa", "contract", "liability", "warranty", "indemnity"],
      summary: "Standard contract terms: 12-month mutual liability cap, 30-day cure period for material breach, governing law State of Delaware.",
      content: `### 1. Standard Liability Cap
Under standard terms, neither party's aggregate liability shall exceed the total fees paid or payable by Customer in the twelve (12) months preceding the incident giving rise to liability.

### 2. Data Ownership & AI Model Training Guarantee
Section 8.4 Explicit Guarantee: Customer data is never used to train, retrain, or fine-tune public foundation models. Customer retains 100% intellectual property ownership over all queries, documents, embeddings, and generated completions.`
    },
    {
      id: "DOC-PUB-901",
      title: "About Nexus Enterprise: Corporate Mission, Values & Brand Guidelines",
      department: "Marketing & Growth",
      clearance: "Public",
      author: "Nexus Communications Team",
      updatedAt: "2026-01-10",
      version: "v1.0",
      tags: ["public", "brand", "mission", "values", "company"],
      summary: "Nexus Enterprise mission to empower modern organizations with trustworthy, permission-aware AI copilots.",
      content: `### 1. Mission Statement
Nexus Enterprise builds intelligent, auditable, and secure agentic software that empowers global workforces to search institutional knowledge, automate repetitive operational toil, and unlock predictive business intelligence.

### 2. Core Operating Principles
- Radical Transparency: AI decisions must provide traceable reasoning and cited evidence.
- Privacy First: Enterprise data boundaries and role clearances are inviolable.
- Human Sovereignty: High-stakes corporate decisions always preserve Human-In-The-Loop governance.`
    },
    {
      id: "DOC-ENG-004",
      title: "AI/ML Inference Gateway, Token Rate Limiting & Model Routing Spec",
      department: "Engineering",
      clearance: "Internal",
      author: "Alex Rivera & Machine Learning Platform Team",
      updatedAt: "2026-10-12",
      version: "v2.0",
      tags: ["ai", "llm", "gateway", "rate-limiting", "routing", "tokens", "inference"],
      summary: "Dynamic routing rules between fine-tuned Claude 3.5, Gemini 1.5 Pro, and local Llama 3 70B clusters with token quota management.",
      content: `### 1. Unified Inference Gateway Architecture
All internal agentic and user queries flow through our LiteLLM-based inference proxy deployed on AWS us-east-1. The gateway routes requests dynamically based on latency budgets, cost targets, and clearance policies.

### 2. Departmental Token Quotas & Throttling
- Engineering: 10,000,000 tokens/day burst capacity with automatic fallback to quantized local models during provider rate limit windows.
- General Corporate: 500,000 tokens/user/month. Requests requesting > 100k context windows require explicit Lead SRE authorization.

### 3. PII & Secret Scrubbing at the Gateway
The gateway performs streaming regex and NER scanning to strip corporate AWS keys, private SSH keys, and JWT session tokens before payloads exit our VPC.`
    },
    {
      id: "DOC-ENG-005",
      title: "Continuous Integration & Delivery (CI/CD) Pipeline Standards",
      department: "Engineering",
      clearance: "Internal",
      author: "DevOps & Release Engineering Committee",
      updatedAt: "2026-09-18",
      version: "v3.4",
      tags: ["cicd", "github-actions", "canary", "deployments", "argo", "argocd"],
      summary: "ArgoCD GitOps deployment topologies, mandatory 85% unit test coverage thresholds, and automated canary analysis using Prometheus metrics.",
      content: `### 1. GitOps Trunk-Based Deployment Model
All Kubernetes manifests and Helm charts are synchronized declaratively through ArgoCD. Direct kubectl applied changes in production namespaces are instantly reconciled and overwritten within 60 seconds.

### 2. Automated Canary Rollout Strategy
Production releases execute via Argo Rollouts over a 4-stage progression: 5% (15 min canary evaluation) -> 25% (30 min) -> 50% (30 min) -> 100%. If HTTP 5xx error rate exceeds 0.25%, an automatic rollback triggers with zero manual intervention.`
    },
    {
      id: "DOC-ENG-006",
      title: "Distributed Tracing, OpenTelemetry & SLA Latency Budgets",
      department: "Engineering",
      clearance: "Internal",
      author: "Alex Rivera (Staff SRE)",
      updatedAt: "2026-08-30",
      version: "v1.8",
      tags: ["observability", "opentelemetry", "tracing", "datadog", "apm", "latency"],
      summary: "W3C TraceContext propagation across gRPC microservices, 100% trace sampling for HTTP errors, and p99 latency ceilings.",
      content: `### 1. OpenTelemetry Instrumentation Standards
All backend services written in Go, Python, and TypeScript must bundle the official OpenTelemetry SDK. Traces must carry tenant_id, user_role, and copilot_request_id span attributes.

### 2. Service Level Objectives (SLOs)
- Search & RAG Vector Lookup: p50 < 120ms, p95 < 400ms, p99 < 850ms.
- Workflow Dispatch Engine: p99 < 250ms.
- Breach of SLO for 10 consecutive minutes automatically pages the on-call SRE via PagerDuty.`
    },
    {
      id: "DOC-SEC-403",
      title: "Zero Trust Network Access (ZTNA) & Identity-Aware Proxy Spec",
      department: "Legal & Audit",
      clearance: "Confidential",
      author: "Information Security & Identity Team",
      updatedAt: "2026-07-25",
      version: "v2.5",
      tags: ["security", "ztna", "cloudflare", "okta", "saml", "vpn-less"],
      summary: "Elimination of legacy VPN in favor of Cloudflare Zero Trust and Okta SAML 2.0 with device posture verification.",
      content: `### 1. Perimeter-Less Enterprise Security
Nexus Enterprise operates on a Zero Trust architecture. Internal web dashboards, staging databases, and Kubernetes consoles are shielded by Cloudflare Access and Okta Verify with FIDO2 WebAuthn keys.

### 2. Device Posture & Geofencing
Access requires registered crowdstrike falcon sensors, BitLocker/FileVault disk encryption, and OS versions patched within 30 days. Connections originating from high-risk embargoed jurisdictions are unconditionally rejected.`
    },
    {
      id: "DOC-SEC-404",
      title: "Security Awareness, Phishing Defense & Endpoint Hardening Standard",
      department: "Operations",
      clearance: "Public",
      author: "Nexus Security Operations Center (SOC)",
      updatedAt: "2026-05-14",
      version: "v2.1",
      tags: ["security", "phishing", "training", "yubikey", "endpoints", "password"],
      summary: "Mandatory annual security awareness curriculum, simulated phishing campaigns, and 1Password enterprise credential guidelines.",
      content: `### 1. Passwordless & Hardware Token Mandate
All corporate accounts must enforce FIDO2 YubiKey 5C or Touch ID hardware authentication. Master passwords must exceed 16 characters managed through company-issued 1Password Enterprise accounts.

### 2. Phishing Simulation Drills
The Infosec team conducts unannounced bi-monthly simulated phishing drills. Employees who click simulated payloads are assigned an interactive 15-minute micro-training refresher.`
    },
    {
      id: "DOC-FIN-203",
      title: "Capital Expenditure (CapEx) vs OpEx & Cloud Resource Depreciation",
      department: "Finance & Accounting",
      clearance: "Finance-Restricted",
      author: "Sophia Lin (Principal Controller)",
      updatedAt: "2026-09-05",
      version: "v2.2",
      tags: ["finance", "capex", "opex", "accounting", "depreciation", "gpu", "hardware"],
      summary: "ASC 350-40 accounting treatment for internal-use software development and 3-year straight-line depreciation of dedicated H100 GPU compute clusters.",
      content: `### 1. Capitalized Software Development Costs
Under US GAAP ASC 350-40, employee engineering hours dedicated to coding core AI orchestration features during the application development phase are capitalized on the balance sheet rather than expensed as OpEx.

### 2. GPU Cluster Depreciation Schedules
Dedicated proprietary on-premise and collocated NVIDIA H100 SXM5 compute nodes are capitalized with an estimated useful lifecycle of 36 months, depreciated via straight-line methodology.`
    },
    {
      id: "DOC-FIN-204",
      title: "Treasury Management, Foreign Exchange (FX) & Global Cash Pooling",
      department: "Finance & Accounting",
      clearance: "Finance-Restricted",
      author: "Sophia Lin & Corporate Treasury",
      updatedAt: "2026-08-14",
      version: "v1.5",
      tags: ["finance", "treasury", "fx", "hedging", "currency", "cash-pooling"],
      summary: "EUR and GBP currency hedging policy to safeguard against dollar fluctuations and daily zero-balance cash sweeps across international subsidiaries.",
      content: `### 1. FX Risk Hedging Policy
Nexus maintains rolling 12-month forward contracts covering 70% of forecasted European ARR collected in EUR and GBP to insulate corporate EBITDA against adverse foreign exchange swings.

### 2. Subsidiary Liquidity Sweeps
To minimize idle capital and optimize short-term yields, cash balances in UK and German operating accounts exceeding $500,000 equivalent are automatically swept daily into the US Treasury money market account yielding 4.85% APY.`
    },
    {
      id: "DOC-HR-104",
      title: "Global Remote Work, Nomad Visas & Home Office Ergonomics Policy",
      department: "Human Resources",
      clearance: "Internal",
      author: "Marcus Vance (VP People)",
      updatedAt: "2026-06-15",
      version: "v2.3",
      tags: ["hr", "remote", "ergonomics", "work-from-home", "stipend", "travel"],
      summary: "90-day annual international remote work allowance, home office setup reimbursement of $1,000, and coworking space access via WeWork All Access.",
      content: `### 1. Work From Anywhere (90-Day Policy)
Team members in good standing may work from approved international jurisdictions for up to 90 calendar days per rolling 12-month period without triggering tax residency complications.

### 2. Home Office Equipment Stipend
Upon hire, employees receive a one-time $1,000 technology stipend for ergonomic chairs, standing desks, 4K monitors, and noise-canceling headsets, in addition to standard company laptop provisioning.`
    },
    {
      id: "DOC-HR-105",
      title: "Comprehensive Parental Leave, Childcare Stipends & Return-to-Work Program",
      department: "Human Resources",
      clearance: "Internal",
      author: "Marcus Vance (VP People)",
      updatedAt: "2026-04-20",
      version: "v2026.1",
      tags: ["hr", "parental-leave", "maternity", "paternity", "childcare", "benefits"],
      summary: "18 weeks of 100% paid parental leave for all new parents (birth, adoption, surrogacy), phased return-to-work ramp, and monthly childcare subsidies.",
      content: `### 1. Equal Parental Leave Duration
All full-time employees are entitled to 18 consecutive weeks of fully paid parental leave within the first 12 months following birth, foster placement, or adoption.

### 2. Phased Return-to-Work Ramp
Upon returning from leave, employees may choose an 80% reduced schedule for the first 4 weeks with 100% salary retention to support a smooth transition back into professional duties.`
    },
    {
      id: "DOC-HR-106",
      title: "Whistleblower Protections, Anti-Retaliation & Anonymous Ethics Reporting",
      department: "Human Resources",
      clearance: "Public",
      author: "Subhadeep Bhadra & Legal Ethics Board",
      updatedAt: "2026-03-10",
      version: "v2.0",
      tags: ["whistleblower", "ethics", "hotline", "anti-harassment", "compliance"],
      summary: "Confidential third-party ethics hotline (available 24/7), strict zero-retaliation policies, and mandatory Board Audit Committee escalation protocols.",
      content: `### 1. Anonymous Reporting Channels
Employees and contractors may submit confidential disclosures regarding financial irregularities, harassment, or safety violations via the third-party EthicsPoint portal or phone hotline 24/7.

### 2. Inviolable Anti-Retaliation Commitment
Nexus strictly prohibits retaliation of any form against any individual who raises concerns in good faith. Verified retaliation results in immediate termination of employment regardless of seniority.`
    },
    {
      id: "DOC-PROD-502",
      title: "Feature Flag Governance, LaunchDarkly Tiers & Progressive Delivery",
      department: "Product & Strategy",
      clearance: "Internal",
      author: "Priya Sharma (VP Product)",
      updatedAt: "2026-07-19",
      version: "v2.2",
      tags: ["product", "feature-flags", "launchdarkly", "progressive-delivery", "beta"],
      summary: "Targeting rules for enterprise beta cohorts, kill-switch protocols for anomalous latency, and mandatory flag cleanup sprints.",
      content: `### 1. Progressive Cohort Ring Deployment
Features are introduced across targeted user rings: Internal Staff (Ring 0) -> Enterprise Beta Customers (Ring 1) -> 20% GA -> 100% GA over 14 days.

### 2. Emergency Automated Kill-Switches
Every user-facing feature flag in LaunchDarkly must configure an automated circuit breaker linked to Datadog alerts. A > 1% spike in frontend unhandled JS errors automatically flips the flag to OFF.`
    },
    {
      id: "DOC-LEGAL-802",
      title: "Open Source Software (OSS) Governance, Copyleft Compliance & Patent Filing",
      department: "Legal & Audit",
      clearance: "Internal",
      author: "Chief Legal Officer",
      updatedAt: "2026-05-28",
      version: "v1.7",
      tags: ["legal", "oss", "gpl", "mit", "license", "patents", "intellectual-property"],
      summary: "Permissible licenses (MIT, Apache 2.0, BSD-3), prohibition of viral copyleft (GPL v3, AGPL) in proprietary backend binaries, and employee patent incentive bonuses.",
      content: `### 1. Approved Open Source Licenses
Libraries licensed under MIT, Apache 2.0, BSD, and ISC may be freely incorporated into production codebases. Inclusion of AGPL, GPL v2/v3, or SSPL requires written approval from General Counsel.

### 2. Employee Patent Incentive Bonus
Engineers whose invention disclosures are approved for filing by the Patent Review Board receive a $2,500 filing bonus and an additional $5,000 grant upon formal issuance by the USPTO.`
    }
  ],

  // Pre-configured Autonomous Agent Workflow Definitions
  WORKFLOW_TEMPLATES: [
    {
      id: "wf-scale-cloud",
      name: "Scale Cloud Kubernetes Compute Cluster",
      department: "Engineering",
      category: "DevOps & Infrastructure",
      description: "Scale node pools across AWS EKS clusters to handle forecasted batch training or peak customer traffic.",
      riskLevel: "CRITICAL",
      costImpact: "+$18,400/month",
      requiresApproval: true,
      approvalThreshold: "Cost > $10,000/mo or Production environment",
      defaultParams: {
        clusterName: "eks-prod-us-east-1",
        nodeGroup: "c6i-4xlarge-gpu-compute",
        currentReplicas: 12,
        targetReplicas: 36,
        reason: "Quarterly large language model fine-tuning job"
      }
    },
    {
      id: "wf-db-migration",
      name: "Execute Production Database Schema Migration",
      department: "Engineering",
      category: "Database Administration",
      description: "Apply non-blocking schema migration on PostgreSQL cluster with automated shadow rollback checkpoint.",
      riskLevel: "CRITICAL",
      costImpact: "$0 (Downtime risk: High)",
      requiresApproval: true,
      approvalThreshold: "Always requires Lead SRE or CIO sign-off",
      defaultParams: {
        cluster: "aurora-pg-primary-cluster",
        migrationScript: "V2026_10__add_rag_citation_indexes.sql",
        tablesAffected: "knowledge_chunks, user_audit_events",
        expectedLockDuration: "35ms"
      }
    },
    {
      id: "wf-quarterly-reconcile",
      name: "Quarterly Cloud Spend & Budget Reconciliation",
      department: "Finance & Accounting",
      category: "Financial Operations",
      description: "Aggregate AWS, Datadog, and Snowflake invoices, detect line-item anomalies, and generate ledger accruals.",
      riskLevel: "MEDIUM",
      costImpact: "Ledger Adjustment: $42,300",
      requiresApproval: true,
      approvalThreshold: "Ledger adjustments > $20,000",
      defaultParams: {
        quarter: "Q3 FY2026",
        departments: ["Engineering", "Product", "Sales"],
        flaggedAnomalies: "AWS us-east-1 Bedrock compute spike (+$32,400)",
        targetLedger: "ACC-6010-CLOUD-INFRA"
      }
    },
    {
      id: "wf-employee-onboard",
      name: "Automated New Hire Provisioning & Role Grant",
      department: "Human Resources",
      category: "People Operations",
      description: "Provision Okta SSO, Google Workspace, GitHub Enterprise team, and role-based clearance permissions.",
      riskLevel: "LOW",
      costImpact: "Standard SaaS license allocation",
      requiresApproval: false,
      approvalThreshold: "Automated for standard roles; Tier 4/5 roles require VP sign-off",
      defaultParams: {
        employeeName: "Jordan Blake",
        department: "Engineering",
        role: "Senior Backend Engineer",
        clearanceLevel: "Level 3 - Internal Technical",
        laptopType: "MacBook Pro M4 Max 36GB"
      }
    },
    {
      id: "wf-customer-refund",
      name: "Process Enterprise Customer Service Credit / Refund",
      department: "Finance & Accounting",
      category: "Customer Accounting",
      description: "Issue invoice credit note or direct wire refund for customer SLA breach or billing overcharge.",
      riskLevel: "HIGH",
      costImpact: "-$4,850.00",
      requiresApproval: true,
      approvalThreshold: "Credits > $2,000 require Financial Controller approval",
      defaultParams: {
        customerName: "Acme Global Dynamics",
        contractId: "CTR-2025-ACME-88",
        creditAmount: "$4,850.00",
        reason: "Service SLA credit for September us-east-1 degraded latency"
      }
    }
  ],

  // Initial Audit Logs (System history)
  INITIAL_AUDIT_LOGS: [
    {
      id: "AUD-9912",
      timestamp: "2026-10-30 14:15:22",
      user: "Alex Rivera",
      userRole: "Staff Infrastructure Engineer",
      clearanceTier: 3,
      action: "RAG_SEARCH",
      query: "How do we handle multi-region failover between us-east-1 and eu-central-1?",
      retrievedDocIds: ["DOC-ENG-001", "DOC-ENG-003"],
      blockedDocIds: [],
      latencyMs: 312,
      status: "SUCCESS",
      riskLevel: "LOW"
    },
    {
      id: "AUD-9911",
      timestamp: "2026-10-30 14:02:45",
      user: "Alex Rivera",
      userRole: "Staff Infrastructure Engineer",
      clearanceTier: 3,
      action: "ACL_POLICY_ENFORCEMENT",
      query: "Show me executive bonus compensation pools and severance agreements",
      retrievedDocIds: [],
      blockedDocIds: ["DOC-HR-102", "DOC-HR-103"],
      latencyMs: 148,
      status: "RETRIEVAL_RESTRICTED",
      riskLevel: "HIGH",
      details: "Query matched HR-Restricted documents. Retrieval blocked by RBAC filter before LLM ingestion."
    },
    {
      id: "AUD-9910",
      timestamp: "2026-10-30 13:40:11",
      user: "Sophia Lin",
      userRole: "Principal Financial Controller",
      clearanceTier: 4,
      action: "RAG_SEARCH",
      query: "What was our Q3 ARR and monthly burn rate?",
      retrievedDocIds: ["DOC-FIN-201", "DOC-FIN-202"],
      blockedDocIds: [],
      latencyMs: 289,
      status: "SUCCESS",
      riskLevel: "LOW"
    },
    {
      id: "AUD-9909",
      timestamp: "2026-10-30 12:22:30",
      user: "Subhadeep Bhadra",
      userRole: "Chief Information Officer",
      clearanceTier: 5,
      action: "HITL_APPROVAL_GRANTED",
      query: "Authorize scaling of EKS cluster to 32 nodes for model training",
      retrievedDocIds: ["DOC-ENG-001"],
      blockedDocIds: [],
      latencyMs: 440,
      status: "APPROVED_AND_EXECUTED",
      riskLevel: "CRITICAL",
      details: "Human-In-The-Loop approval granted by Subhadeep Bhadra. Cost impact +$12,400/mo."
    },
    {
      id: "AUD-9908",
      timestamp: "2026-10-30 11:18:04",
      user: "Maya Patel",
      userRole: "Growth Marketing Specialist",
      clearanceTier: 2,
      action: "RAG_SEARCH",
      query: "Where can I find our corporate brand guidelines and mission statement?",
      retrievedDocIds: ["DOC-PUB-901"],
      blockedDocIds: [],
      latencyMs: 245,
      status: "SUCCESS",
      riskLevel: "LOW"
    }
  ],

  // Business Insights Initial Metrics
  BUSINESS_METRICS: {
    totalQueriesToday: 1420,
    activeAgentsRunning: 4,
    ragAccuracyScore: "99.4%",
    avgLatencyMs: 268,
    aclBlocksToday: 38,
    pendingHumanApprovals: 2,
    hoursSavedThisMonth: 1240,
    departmentUsage: [
      { department: "Engineering", percentage: 38, queries: 540, color: "#2563EB" },
      { department: "Finance & Accounting", percentage: 24, queries: 341, color: "#F59E0B" },
      { department: "Human Resources", percentage: 19, queries: 270, color: "#EC4899" },
      { department: "Sales & Marketing", percentage: 12, queries: 170, color: "#10B981" },
      { department: "Legal & Compliance", percentage: 7, queries: 99, color: "#8B5CF6" }
    ],
    weeklyTrend: [
      { day: "Mon", queries: 1120, latency: 290, securityBlocks: 24 },
      { day: "Tue", queries: 1340, latency: 275, securityBlocks: 31 },
      { day: "Wed", queries: 1490, latency: 260, securityBlocks: 42 },
      { day: "Thu", queries: 1580, latency: 252, securityBlocks: 35 },
      { day: "Fri", queries: 1420, latency: 268, securityBlocks: 38 },
      { day: "Sat", queries: 420, latency: 220, securityBlocks: 8 },
      { day: "Sun", queries: 380, latency: 215, securityBlocks: 6 }
    ]
  },

  // Pre-configured Chat Sessions & History Threads (empty by default so agent starts fresh)
  INITIAL_CHAT_SESSIONS: []
};

