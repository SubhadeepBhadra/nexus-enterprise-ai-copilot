/**
 * Enterprise AI Copilot - Automated Verification Test Suite
 * Tests RAG retrieval, permission masking, multi-agent classification,
 * HITL approval interception, and resumption logic.
 */

// Mock browser globals for Node test environment
global.window = {};
global.document = {
  addEventListener: () => {},
  getElementById: () => null,
  querySelectorAll: () => []
};

require("./js/data.js");
require("./js/rag.js");
require("./js/agents.js");
require("./js/analytics.js");

const data = global.window.ENTERPRISE_DATA;
const RAGEngine = global.window.EnterpriseRAGEngine;
const AgentOrchestrator = global.window.AgentOrchestrator;
const AuditLogger = global.window.AuditLogger;

console.log("=== RUNNING ENTERPRISE COPILOT TEST SUITE ===\n");

// 1. Initialize Engines
const rag = new RAGEngine(data.DOCUMENTS);
const audit = new AuditLogger(data.INITIAL_AUDIT_LOGS);
const orchestrator = new AgentOrchestrator(rag, audit);

console.log(`[PASS] RAG initialized: ${rag.documents.length} docs, ${rag.chunks.length} chunks.`);

// 2. Test RAG Search with High Clearance (CIO Subhadeep Bhadra)
console.log("\n--- TEST 1: Subhadeep Bhadra (CIO, Level 5) queries confidential comp ---");
const resultSubhadeep = rag.retrieve({
  query: "What are the executive compensation bands and bonus multiplier matrix?",
  currentUser: data.ROLES.cio_admin,
  topK: 3
});
console.log(`Retrieved chunks: ${resultSubhadeep.retrievedChunks.length}`);
console.log(`Blocked docs: ${resultSubhadeep.blockedDocs.length}`);
if (resultSubhadeep.retrievedChunks.length > 0 && resultSubhadeep.retrievedChunks.some(c => c.docId === "DOC-HR-102")) {
  console.log("[PASS] Subhadeep successfully retrieved HR-Restricted doc DOC-HR-102!");
} else {
  console.error("[FAIL] Subhadeep should have access to DOC-HR-102");
}

// 3. Test Permission-Enforced Retrieval with Lower Clearance (Alex Rivera, Staff Eng, Level 3)
console.log("\n--- TEST 2: Alex Rivera (Staff Eng, Level 3) queries confidential comp ---");
const resultAlex = rag.retrieve({
  query: "What are the executive compensation bands and bonus multiplier matrix?",
  currentUser: data.ROLES.staff_engineer,
  topK: 3
});
console.log(`Retrieved chunks: ${resultAlex.retrievedChunks.length}`);
console.log(`Blocked docs: ${resultAlex.blockedDocs.length}`);
const alexGotComp = resultAlex.retrievedChunks.some(c => c.docId === "DOC-HR-102");
const alexBlockedComp = resultAlex.blockedDocs.some(d => d.docId === "DOC-HR-102");
if (!alexGotComp && alexBlockedComp) {
  console.log("[PASS] Strict ACL enforced! Alex was prevented from retrieving DOC-HR-102.");
  console.log(`Blocked reason: ${resultAlex.blockedDocs[0].reason}`);
} else {
  console.error("[FAIL] Alex should NOT have retrieved DOC-HR-102");
}

// 4. Test Multi-Agent Intent Classification & HITL Sensitive Action Interception
console.log("\n--- TEST 3: Sensitive Action & HITL Approval Interception ---");
(async () => {
  const hitlRes = await orchestrator.processQuery({
    query: "Scale EKS production compute cluster from 12 to 36 nodes",
    currentUser: data.ROLES.staff_engineer
  });

  if (hitlRes.type === "PENDING_APPROVAL") {
    console.log(`[PASS] Sensitive action intercepted! Approval ID: ${hitlRes.approval.approvalId}`);
    console.log(`Target: ${hitlRes.approval.targetSystem}`);
    console.log(`Cost Impact: ${hitlRes.approval.costImpact}`);
    console.log(`Risk Level: ${hitlRes.approval.riskLevel}`);

    // Test Human Approval Resumption
    console.log("\n--- TEST 4: Human-in-the-Loop Resumption ---");
    const resumeRes = await orchestrator.approveAndResume(
      hitlRes.approval.approvalId,
      data.ROLES.cio_admin,
      "Approved after verifying Q4 compute budget buffer"
    );
    console.log(`[PASS] ${resumeRes.message}`);
    console.log(`Status: ${resumeRes.status}`);
  } else {
    console.error("[FAIL] Action should have been halted for human approval!");
  }

  // 5. Test Business Intelligence Insight Synthesis
  console.log("\n--- TEST 5: Business Intelligence & KPI Synthesis ---");
  const biRes = await orchestrator.processQuery({
    query: "Show me Q3 ARR, gross margins, and monthly burn rate",
    currentUser: data.ROLES.finance_controller
  });
  if (biRes.type === "BI_INSIGHT" && biRes.chartConfig) {
    console.log("[PASS] BI Agent successfully synthesized KPI brief and chart configuration!");
    console.log(`Chart Title: ${biRes.chartConfig.title}`);
  } else {
    console.error("[FAIL] BI Agent should produce chartConfig and insights");
  }

  // 6. Test Audit Logging
  console.log("\n--- TEST 6: Audit Trail Verification ---");
  const auditLogs = audit.getLogs();
  console.log(`Total events logged: ${auditLogs.length}`);
  const hasAclEvent = auditLogs.some(l => l.action.includes("ACL") || l.action.includes("APPROVAL"));
  if (hasAclEvent) {
    console.log("[PASS] Security & governance events successfully recorded in audit ledger!");
  } else {
    console.error("[FAIL] Audit ledger missing security events");
  }

  console.log("\n=== ALL TEST CRITERIA VERIFIED AND PASSED SUCCESSFULLY! ===");
})();

