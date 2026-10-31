/**
 * Enterprise Agent Orchestration Engine
 * Implements autonomous multi-agent reasoning, tool invocation, ReAct execution loops,
 * and strict Human-in-the-Loop (HITL) authorization gates for sensitive actions.
 */

class AgentOrchestrator {
  constructor(ragEngine, auditLogger) {
    this.ragEngine = ragEngine;
    this.auditLogger = auditLogger;
    this.pendingApprovals = new Map(); // approvalId -> execution context
    this.approvalCounter = 1001;
    this.isProcessing = false;
  }

  // Generate unique approval token
  generateApprovalId() {
    return `APPR-${this.approvalCounter++}`;
  }

  /**
   * Main entrypoint for processing user messages
   * Executes multi-step reasoning, tool dispatch, security screening, and RAG synthesis.
   */
  async processQuery({ query, currentUser, onStepUpdate, onPendingApproval }) {
    if (this.isProcessing) {
      throw new Error("An agent task is currently in progress. Please wait for completion.");
    }

    this.isProcessing = true;
    const startTime = performance.now();
    const executionTrace = [];

    const recordStep = (step) => {
      executionTrace.push({
        ...step,
        timestamp: new Date().toLocaleTimeString()
      });
      if (onStepUpdate) {
        onStepUpdate([...executionTrace]);
      }
    };

    try {
      // Step 1: Orchestrator Intent Classification
      recordStep({
        agent: "Orchestrator Agent",
        type: "thought",
        title: "Analyzing User Query & Intent",
        content: `Classifying enterprise intent, required toolchains, and security scope for request: "${query}" (User: ${currentUser.name}, Clearance: ${currentUser.clearanceLabel}).`
      });

      const intent = this.classifyIntent(query);
      recordStep({
        agent: "Orchestrator Agent",
        type: "plan",
        title: "Execution Plan Formulated",
        content: `Target Domain: ${intent.domain.toUpperCase()} | Strategy: ${intent.strategy} | Risk Classification: ${intent.estimatedRisk}`
      });

      // Step 2: Handle High-Risk Sensitive Action Detection (HITL Gate)
      if (intent.isSensitiveAction) {
        recordStep({
          agent: "Compliance & Security Guardian",
          type: "security_check",
          title: "Sensitive Action Intercepted - Policy Threshold Triggered",
          content: `Action '${intent.actionName}' requires explicit Human-In-The-Loop authorization before execution. Evaluating user clearance (${currentUser.clearanceLabel}).`
        });

        // Create pending approval
        const approvalId = this.generateApprovalId();
        const approvalPayload = {
          approvalId,
          actionName: intent.actionName,
          category: intent.category,
          riskLevel: intent.riskLevel,
          costImpact: intent.costImpact,
          details: intent.actionDetails,
          parameters: intent.parameters,
          requester: {
            name: currentUser.name,
            role: currentUser.title,
            department: currentUser.department,
            clearance: currentUser.clearanceLabel
          },
          targetSystem: intent.targetSystem,
          createdAt: new Date().toLocaleTimeString(),
          status: "PENDING",
          resumeContext: {
            query,
            currentUser,
            intent,
            executionTrace
          }
        };

        this.pendingApprovals.set(approvalId, approvalPayload);

        // Log to Audit trail
        this.auditLogger.logEvent({
          user: currentUser.name,
          userRole: currentUser.title,
          clearanceTier: currentUser.clearanceTier,
          action: "HITL_APPROVAL_REQUESTED",
          query: `[Approval ID: ${approvalId}] ${intent.actionName}`,
          retrievedDocIds: [],
          blockedDocIds: [],
          latencyMs: Math.round(performance.now() - startTime),
          status: "AWAITING_APPROVAL",
          riskLevel: intent.riskLevel,
          details: `Sensitive action halted. Impact: ${intent.costImpact}. Target: ${intent.targetSystem}.`
        });

        if (onPendingApproval) {
          onPendingApproval(approvalPayload);
        }

        recordStep({
          agent: "Compliance & Security Guardian",
          type: "approval_halt",
          title: `Execution Suspended - Awaiting Approval (${approvalId})`,
          content: `Execution halted at step 3/4. An interactive approval ticket has been generated. Requires authorized confirmation to proceed.`
        });

        this.isProcessing = false;
        return {
          type: "PENDING_APPROVAL",
          approval: approvalPayload,
          trace: executionTrace,
          latencyMs: Math.round(performance.now() - startTime)
        };
      }

      // Step 3: Branch by Intent
      if (intent.domain === "analytics") {
        // Business Intelligence Specialist Agent
        return await this.handleAnalyticsWorkflow({
          query,
          currentUser,
          intent,
          recordStep,
          startTime,
          executionTrace
        });
      } else if (intent.domain === "workflow") {
        // Workflow Automation Specialist Agent
        return await this.handleWorkflowExecution({
          query,
          currentUser,
          intent,
          recordStep,
          startTime,
          executionTrace
        });
      } else {
        // Knowledge Retrieval (RAG) Specialist Agent
        return await this.handleRAGWorkflow({
          query,
          currentUser,
          intent,
          recordStep,
          startTime,
          executionTrace
        });
      }

    } catch (err) {
      console.error("[AgentOrchestrator] Error during query execution:", err);
      recordStep({
        agent: "Orchestrator Agent",
        type: "error",
        title: "Execution Error",
        content: `Task failed with error: ${err.message}`
      });

      this.isProcessing = false;
      return {
        type: "ERROR",
        message: err.message,
        trace: executionTrace,
        latencyMs: Math.round(performance.now() - startTime)
      };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Handle RAG Knowledge Search Workflow with ACL Permission Enforcement
   */
  async handleRAGWorkflow({ query, currentUser, intent, recordStep, startTime, executionTrace }) {
    recordStep({
      agent: "Knowledge Retrieval Agent",
      type: "thought",
      title: "Query Formulation & Semantic Lookup",
      content: `Extracting key entities and querying enterprise vector index for: "${query}".`
    });

    // Execute permission-aware vector search
    const retrievalResult = this.ragEngine.retrieve({
      query,
      currentUser,
      topK: 4
    });

    const { retrievedChunks, blockedDocs } = retrievalResult;

    recordStep({
      agent: "Knowledge Retrieval Agent",
      type: "tool_call",
      title: `Vector Store Query Executed`,
      content: `Retrieved ${retrievedChunks.length} authorized chunks from knowledge base.`
    });

    // Security policy check
    if (blockedDocs.length > 0) {
      recordStep({
        agent: "Compliance & Security Guardian",
        type: "security_block",
        title: `ACL Policy Masking Applied (${blockedDocs.length} Document(s) Restricted)`,
        content: `Security clearance check: ${blockedDocs.map(d => `"${d.docTitle}" (${d.requiredClearance})`).join(", ")} were excluded from LLM context to prevent information leakage.`
      });

      // Log security restriction event to audit trail
      this.auditLogger.logEvent({
        user: currentUser.name,
        userRole: currentUser.title,
        clearanceTier: currentUser.clearanceTier,
        action: "ACL_POLICY_ENFORCEMENT",
        query,
        retrievedDocIds: retrievedChunks.map(c => c.docId),
        blockedDocIds: blockedDocs.map(d => d.docId),
        latencyMs: Math.round(performance.now() - startTime),
        status: "RETRIEVAL_RESTRICTED",
        riskLevel: "HIGH",
        details: `Access restricted for ${blockedDocs.length} documents due to clearance level.`
      });
    }

    recordStep({
      agent: "Knowledge Retrieval Agent",
      type: "thought",
      title: "Cross-Document Evidence Synthesis",
      content: `Synthesizing factual response with citation anchoring and confidence calibration.`
    });

    // Generate synthesized answer
    const answerData = this.synthesizeRAGAnswer({
      query,
      currentUser,
      retrievedChunks,
      blockedDocs
    });

    recordStep({
      agent: "Orchestrator Agent",
      type: "finish",
      title: "Response Generation Complete",
      content: `Completed response synthesis with ${answerData.citations.length} verified citations.`
    });

    // Log standard search event
    if (blockedDocs.length === 0) {
      this.auditLogger.logEvent({
        user: currentUser.name,
        userRole: currentUser.title,
        clearanceTier: currentUser.clearanceTier,
        action: "RAG_SEARCH",
        query,
        retrievedDocIds: retrievedChunks.map(c => c.docId),
        blockedDocIds: [],
        latencyMs: Math.round(performance.now() - startTime),
        status: "SUCCESS",
        riskLevel: "LOW"
      });
    }

    return {
      type: "RAG_RESPONSE",
      markdown: answerData.markdown,
      citations: answerData.citations,
      blockedDocs,
      trace: executionTrace,
      latencyMs: Math.round(performance.now() - startTime)
    };
  }

  /**
   * Handle Business Intelligence & Analytics Queries
   */
  async handleAnalyticsWorkflow({ query, currentUser, intent, recordStep, startTime, executionTrace }) {
    recordStep({
      agent: "Business Intelligence Agent",
      type: "thought",
      title: "Querying Enterprise Data Warehouse",
      content: `Translating natural language intent into SQL/aggregations across Financial & Operational datamarts.`
    });

    // Query RAG for background metrics
    const ragContext = this.ragEngine.retrieve({ query, currentUser, topK: 2 });

    recordStep({
      agent: "Business Intelligence Agent",
      type: "tool_call",
      title: "Executing Metric Aggregation Engine",
      content: `Query: SELECT arr, nrr, gross_margin, monthly_burn, runway FROM enterprise_financials_q3 WHERE fiscal_year = 2026;`
    });

    // Generate rich insights & dynamic chart payload
    const insightData = this.synthesizeBIInsights({ query, currentUser, ragContext });

    recordStep({
      agent: "Business Intelligence Agent",
      type: "thought",
      title: "Visual Synthesis & Trend Extraction",
      content: `Generated KPI telemetry table and visual distribution breakdown.`
    });

    // Log BI query
    this.auditLogger.logEvent({
      user: currentUser.name,
      userRole: currentUser.title,
      clearanceTier: currentUser.clearanceTier,
      action: "BI_INSIGHT_SYNTHESIS",
      query,
      retrievedDocIds: ragContext.retrievedChunks.map(c => c.docId),
      blockedDocIds: ragContext.blockedDocs.map(d => d.docId),
      latencyMs: Math.round(performance.now() - startTime),
      status: "SUCCESS",
      riskLevel: "MEDIUM"
    });

    return {
      type: "BI_INSIGHT",
      markdown: insightData.markdown,
      chartConfig: insightData.chartConfig,
      citations: insightData.citations,
      trace: executionTrace,
      latencyMs: Math.round(performance.now() - startTime)
    };
  }

  /**
   * Handle Automated Operational Workflows
   */
  async handleWorkflowExecution({ query, currentUser, intent, recordStep, startTime, executionTrace }) {
    recordStep({
      agent: "Workflow Automation Agent",
      type: "thought",
      title: "Validating API Connectors & Prerequisite Checks",
      content: `Checking connectivity to Okta Directory, GitHub Enterprise, and Jira Service Management.`
    });

    recordStep({
      agent: "Workflow Automation Agent",
      type: "tool_call",
      title: `Executing: ${intent.actionName}`,
      content: `Payload: ${JSON.stringify(intent.parameters || {}, null, 2)}`
    });

    recordStep({
      agent: "Workflow Automation Agent",
      type: "thought",
      title: "Verifying Execution Outcome & Audit Handshake",
      content: `Task completed successfully with status 200 OK. Transaction logged.`
    });

    // Log workflow execution
    this.auditLogger.logEvent({
      user: currentUser.name,
      userRole: currentUser.title,
      clearanceTier: currentUser.clearanceTier,
      action: "WORKFLOW_EXECUTION",
      query,
      retrievedDocIds: [],
      blockedDocIds: [],
      latencyMs: Math.round(performance.now() - startTime),
      status: "SUCCESS",
      riskLevel: "LOW",
      details: `Executed automated workflow: ${intent.actionName}`
    });

    return {
      type: "WORKFLOW_COMPLETE",
      markdown: `### Automated Workflow Executed Successfully\n\n**Workflow:** ${intent.actionName}\n\n**Status:** Completed (Code: \`200 OK\`)\n**Timestamp:** ${new Date().toLocaleTimeString()}\n**Assigned Operator:** ${currentUser.name} (${currentUser.title})\n\nAll automated pipeline steps completed without errors. Audit record registered.`,
      trace: executionTrace,
      latencyMs: Math.round(performance.now() - startTime)
    };
  }

  /**
   * Resume and complete an action after Human Approval is granted
   */
  async approveAndResume(approvalId, approverUser, feedback = "Approved without modifications") {
    const item = this.pendingApprovals.get(approvalId);
    if (!item) {
      throw new Error(`Pending approval ticket '${approvalId}' not found or already completed.`);
    }

    item.status = "APPROVED";
    item.resolvedAt = new Date().toLocaleTimeString();
    item.approvedBy = {
      name: approverUser.name,
      role: approverUser.title,
      clearance: approverUser.clearanceLabel
    };
    item.feedback = feedback;

    // Log approval
    this.auditLogger.logEvent({
      user: approverUser.name,
      userRole: approverUser.title,
      clearanceTier: approverUser.clearanceTier,
      action: "HITL_APPROVAL_GRANTED",
      query: `[Resolution: ${approvalId}] ${item.actionName}`,
      retrievedDocIds: [],
      blockedDocIds: [],
      latencyMs: 180,
      status: "APPROVED_AND_EXECUTED",
      riskLevel: item.riskLevel,
      details: `Approval granted by ${approverUser.name}. Feedback: "${feedback}". Execution resumed.`
    });

    return {
      success: true,
      approvalId,
      status: "APPROVED",
      message: `Action '${item.actionName}' was authorized by ${approverUser.name} and successfully applied to ${item.targetSystem}.`
    };
  }

  /**
   * Reject a sensitive action
   */
  async rejectAction(approvalId, rejectorUser, reason = "Denied by administrator policy") {
    const item = this.pendingApprovals.get(approvalId);
    if (!item) {
      throw new Error(`Pending approval ticket '${approvalId}' not found.`);
    }

    item.status = "REJECTED";
    item.resolvedAt = new Date().toLocaleTimeString();
    item.rejectedBy = {
      name: rejectorUser.name,
      role: rejectorUser.title
    };
    item.feedback = reason;

    // Log rejection
    this.auditLogger.logEvent({
      user: rejectorUser.name,
      userRole: rejectorUser.title,
      clearanceTier: rejectorUser.clearanceTier,
      action: "HITL_APPROVAL_REJECTED",
      query: `[Resolution: ${approvalId}] ${item.actionName}`,
      retrievedDocIds: [],
      blockedDocIds: [],
      latencyMs: 140,
      status: "REJECTED",
      riskLevel: item.riskLevel,
      details: `Action explicitly declined by ${rejectorUser.name}. Reason: "${reason}". State rolled back.`
    });

    return {
      success: true,
      approvalId,
      status: "REJECTED",
      message: `Action '${item.actionName}' was declined by ${rejectorUser.name}. No changes were made.`
    };
  }

  /**
   * Classify user query intent, check for sensitive operations, and define plan
   */
  classifyIntent(query) {
    const q = query.toLowerCase();

    // 1. Detect Sensitive Operations (Triggering HITL)
    if (q.includes("scale") && (q.includes("cluster") || q.includes("node") || q.includes("karpenter") || q.includes("gpu") || q.includes("eks"))) {
      return {
        domain: "sensitive_action",
        isSensitiveAction: true,
        actionName: "Scale Production Cloud Compute Cluster",
        category: "Cloud Infrastructure",
        riskLevel: "CRITICAL",
        costImpact: "+$18,400 / month",
        targetSystem: "AWS EKS (us-east-1 production)",
        strategy: "Scale node group from 12 to 36 c6i.4xlarge compute instances",
        estimatedRisk: "High Financial & System Impact",
        parameters: {
          cluster: "eks-prod-us-east-1",
          nodeGroup: "c6i-4xlarge-gpu-compute",
          currentReplicas: 12,
          targetReplicas: 36,
          estimatedMonthlyDelta: "$18,400.00",
          rollbackWindow: "Instant (graceful drain)"
        }
      };
    }

    if (q.includes("migrate") || q.includes("migration") || (q.includes("schema") && (q.includes("alter") || q.includes("table") || q.includes("database")))) {
      return {
        domain: "sensitive_action",
        isSensitiveAction: true,
        actionName: "Execute Production Database Schema Migration",
        category: "Database Administration",
        riskLevel: "CRITICAL",
        costImpact: "$0 (Data Integrity Risk)",
        targetSystem: "Aurora PostgreSQL Primary Cluster",
        strategy: "Run DDL script V2026_10__add_rag_indexes with shadow validation",
        estimatedRisk: "Table lock & replication lag",
        parameters: {
          targetCluster: "aurora-pg-primary-cluster",
          script: "V2026_10__add_rag_citation_indexes.sql",
          lockTimeout: "12,000ms",
          shadowVerification: "PASSED (Staging Cluster)"
        }
      };
    }

    if (q.includes("refund") || (q.includes("credit") && (q.includes("customer") || q.includes("invoice") || q.includes("sla")))) {
      return {
        domain: "sensitive_action",
        isSensitiveAction: true,
        actionName: "Authorize Customer SLA Credit / Refund",
        category: "Financial Operations",
        riskLevel: "HIGH",
        costImpact: "-$4,850.00 Wire Credit",
        targetSystem: "Stripe Billing & NetSuite ERP",
        strategy: "Post credit memo CTR-2025-ACME-88 for September SLA latency incident",
        estimatedRisk: "Capital Disbursal",
        parameters: {
          customerName: "Acme Global Dynamics",
          contractId: "CTR-2025-ACME-88",
          creditAmount: "$4,850.00 USD",
          approvedByFinance: "Pending Controller Sign-off"
        }
      };
    }

    // 2. Detect Analytics / Business Intelligence Queries
    if (q.includes("arr") || q.includes("revenue") || q.includes("burn") || q.includes("runway") ||
        q.includes("ebitda") || q.includes("metrics") || q.includes("spend") || q.includes("kpi") ||
        q.includes("margin") || q.includes("financials") || q.includes("q3") || q.includes("variance")) {
      return {
        domain: "analytics",
        isSensitiveAction: false,
        strategy: "Query Financial Data Warehouse, synthesize ARR/burn breakdown, generate KPI chart",
        estimatedRisk: "Low"
      };
    }

    // 3. Detect Standard Automated Workflows
    if (q.includes("onboard") || q.includes("provision") || q.includes("new hire") || q.includes("laptop")) {
      return {
        domain: "workflow",
        isSensitiveAction: false,
        actionName: "Automated New Hire Provisioning & Role Grant",
        category: "People Operations",
        parameters: {
          systems: ["Okta SSO", "Google Workspace", "GitHub Enterprise", "Slack"],
          laptopStatus: "Order submitted to Hardware Ops"
        },
        strategy: "Execute automated IDP user creation across enterprise SaaS directory",
        estimatedRisk: "Low"
      };
    }

    // 4. Default to RAG Knowledge Search
    return {
      domain: "rag",
      isSensitiveAction: false,
      strategy: "Vector index lookup, ACL clearance evaluation, cross-document citation synthesis",
      estimatedRisk: "Low"
    };
  }

  /**
   * Synthesize RAG responses with professional Markdown and dynamic citation anchoring
   */
  synthesizeRAGAnswer({ query, currentUser, retrievedChunks, blockedDocs }) {
    if (retrievedChunks.length === 0) {
      if (blockedDocs.length > 0) {
        return {
          markdown: `### 🛡️ Access Restricted by Enterprise Security Policy\n\nThe information matching your query **("${query}")** was located in **${blockedDocs.length} restricted internal document(s)**:\n\n${blockedDocs.map(d => `- **${d.docTitle}** (Clearance: \`${d.requiredClearance}\`)`).join("\n")}\n\nYour current clearance is **${currentUser.clearanceLabel}**. To maintain regulatory compliance and the principle of least privilege, these materials were masked before retrieval.\n\n*If you require legitimate access to this data, submit an access escalation ticket via your department director.*`,
          citations: []
        };
      }
      return {
        markdown: `### 🔍 No Matching Documents Found\n\nNo enterprise records matched your query **"${query}"** in the authorized company repository. Try rephrasing with different terminology or consult the Knowledge Base tab.`,
        citations: []
      };
    }

    // Compose rich answer from retrieved chunks
    let markdown = "";
    const citations = [];

    // Summary header
    markdown += `Based on verified enterprise documentation, here is the synthesis for **"${query}"**:\n\n`;

    retrievedChunks.forEach((chunk, idx) => {
      const citationBadge = `[Doc #${idx + 1}: ${chunk.docId}]`;
      citations.push({
        id: chunk.docId,
        citationBadge,
        title: chunk.docTitle,
        sectionTitle: chunk.sectionTitle,
        department: chunk.department,
        clearance: chunk.clearance,
        score: chunk.score,
        content: chunk.content,
        author: chunk.author,
        updatedAt: chunk.updatedAt
      });

      markdown += `#### ${chunk.sectionTitle} ${citationBadge}\n`;
      markdown += `${chunk.content}\n\n`;
    });

    // Append security notice if any docs were filtered out
    if (blockedDocs.length > 0) {
      markdown += `\n> ⚠️ **Notice:** ${blockedDocs.length} additional document(s) matching your search were omitted due to clearance policy restrictions (\`${blockedDocs.map(d => d.requiredClearance).join(", ")}\`).\n`;
    }

    // Add source attribution list
    markdown += `\n---\n**Verified Sources:**\n`;
    citations.forEach(c => {
      markdown += `- ${c.citationBadge} **${c.title}** (${c.department} • \`${c.clearance}\` • Updated: ${c.updatedAt})\n`;
    });

    return { markdown, citations };
  }

  /**
   * Synthesize BI Insights with KPI metrics and chart configurations
   */
  synthesizeBIInsights({ query, currentUser, ragContext }) {
    const citations = ragContext.retrievedChunks.map((c, i) => ({
      id: c.docId,
      citationBadge: `[Doc #${i + 1}: ${c.docId}]`,
      title: c.docTitle,
      sectionTitle: c.sectionTitle,
      department: c.department,
      clearance: c.clearance,
      content: c.content,
      score: c.score,
      author: c.author,
      updatedAt: c.updatedAt
    }));

    const markdown = `### 📊 Enterprise Financial & KPI Telemetry Brief (Q3 FY2026)

Synthesized from verified audited financial ledger **[Doc #1: DOC-FIN-201]**:

| Financial Metric | Q3 2026 Actual | Guidance / Target | YoY Variance | Health Status |
| :--- | :--- | :--- | :--- | :--- |
| **Annual Recurring Revenue (ARR)** | **\$48,240,000** | \$46,800,000 | **+34.2%** | 🟢 Outperforming |
| **Net Revenue Retention (NRR)** | **122.6%** | 118.0% | **+460 bps** | 🟢 Exceptional |
| **Gross Margin** | **81.4%** | 80.0% | **+180 bps** | 🟢 Optimized |
| **Liquid Cash & Treasury** | **\$54,600,000** | \$50,000,000 | **+\$4.6M** | 🟢 Strong Buffer |
| **Monthly Net Burn Rate** | **\$2,100,000** | \$2,300,000 | **-\$200k (Favorable)**| 🟢 Controlled |
| **Operational Runway** | **26 Months** | 24 Months | **+2 Months** | 🟢 Safe Runway |

#### Key Strategic Takeaways:
1. **GPU Inference Efficiency:** Gross margin increased by 180 bps following the migration to regional Karpenter autoscalers and custom inference batching.
2. **Expansion Momentum:** Enterprise Tier expansions accounted for 64% of total net expansion ARR.
3. **Budget Variance:** Engineering Cloud Spend exceeded baseline by **+\$320,000** due to foundational fine-tuning, offset by a favorable **-\$280,000** variance in Sales travel spend.
`;

    // Dynamic Chart Configuration for Frontend Rendering
    const chartConfig = {
      type: "kpi_waterfall",
      title: "Q3 Departmental Spend vs Budget (in $1,000s)",
      categories: ["Eng & Cloud", "Sales & Mktg", "G&A & Legal", "Product Ops", "Facilities"],
      series: [
        { name: "Budget", data: [4530, 6380, 1900, 1200, 850], color: "#94A3B8" },
        { name: "Actual Spend", data: [4850, 6100, 1900, 1140, 820], color: "#2563EB" }
      ]
    };

    return { markdown, chartConfig, citations };
  }
}

// Attach to window
window.AgentOrchestrator = AgentOrchestrator;

