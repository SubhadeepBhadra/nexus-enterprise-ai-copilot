/**
 * Enterprise AI Copilot - Master Application Controller
 * Handles UI interactions, state synchronization, RBAC switching,
 * chat session threads / history, global enterprise search, and workflow execution.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Core Engines with Mock Enterprise Data
  const ragEngine = new window.EnterpriseRAGEngine(window.ENTERPRISE_DATA.DOCUMENTS);
  const auditLogger = new window.AuditLogger(window.ENTERPRISE_DATA.INITIAL_AUDIT_LOGS);
  const agentOrchestrator = new window.AgentOrchestrator(ragEngine, auditLogger);

  // Chat Sessions Storage Persistence
  const STORAGE_KEY = "nexus_copilot_chat_sessions";

  function loadSessionsFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load sessions from localStorage:", e);
    }
    return JSON.parse(JSON.stringify(window.ENTERPRISE_DATA.INITIAL_CHAT_SESSIONS || []));
  }

  function saveSessionsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.chatSessions));
    } catch (e) {
      console.warn("Could not save sessions to localStorage:", e);
    }
  }

  // Application State
  const state = {
    currentUser: window.ENTERPRISE_DATA.ROLES.cio_admin, // Default: Subhadeep Bhadra (CIO)
    activeTab: "chat",
    chatSessions: loadSessionsFromStorage(),
    activeSessionId: null, // Always null on load/refresh so agent starts on a clean fresh conversation
    pendingApprovalsCount: 0,
    activeCitationDoc: null,
    searchFilterCategory: "all"
  };

  // DOM Elements Cache
  const elements = {
    roleSelect: document.getElementById("roleSelect"),
    userAvatarBadge: document.getElementById("userAvatarBadge"),
    userAvatarInitials: document.getElementById("userAvatarInitials"),
    userName: document.getElementById("userName"),
    userRoleTitle: document.getElementById("userRoleTitle"),
    sidebarClearanceBadge: document.getElementById("sidebarClearanceBadge"),
    sidebarClearanceDesc: document.getElementById("sidebarClearanceDesc"),
    approvalBellBadge: document.getElementById("approvalBellBadge"),
    approvalsNavBadge: document.getElementById("approvalsNavBadge"),
    
    // Chat & Sessions
    copilotChatSidebar: document.getElementById("copilotChatSidebar"),
    btnMinimizeSidebar: document.getElementById("btnMinimizeSidebar"),
    btnToggleSidebar: document.getElementById("btnToggleSidebar"),
    chatInput: document.getElementById("chatInput"),
    sendBtn: document.getElementById("sendBtn"),
    chatMessages: document.getElementById("chatMessages"),
    chatSessionsList: document.getElementById("chatSessionsList"),
    chatSessionCount: document.getElementById("chatSessionCount"),
    activeSessionTitle: document.getElementById("activeSessionTitle"),
    btnNewChat: document.getElementById("btnNewChat"),
    btnClearAllChats: document.getElementById("btnClearAllChats"),

    // Global Search Palette
    globalSearchBtn: document.getElementById("globalSearchBtn"),
    globalSearchModal: document.getElementById("globalSearchModal"),
    paletteSearchInput: document.getElementById("paletteSearchInput"),
    paletteResults: document.getElementById("paletteResults"),
    btnClosePalette: document.getElementById("btnClosePalette"),
    paletteDocsCount: document.getElementById("paletteDocsCount"),

    // Drawers & Modals
    citationDrawer: document.getElementById("citationDrawer"),
    drawerBackdrop: document.getElementById("drawerBackdrop"),
    drawerTitle: document.getElementById("drawerTitle"),
    drawerMeta: document.getElementById("drawerMeta"),
    drawerContent: document.getElementById("drawerContent"),
    ingestModal: document.getElementById("ingestModal"),
    toastContainer: document.getElementById("toastContainer")
  };

  // =========================================================================
  // Role-Based Access Control (RBAC) Switcher & Dynamic Avatar Badges
  // =========================================================================
  function switchRole(roleId) {
    const selectedRole = window.ENTERPRISE_DATA.ROLES[roleId];
    if (!selectedRole) return;

    state.currentUser = selectedRole;

    // Update Initials & Gradient Avatar Badge
    if (elements.userAvatarBadge && selectedRole.avatarBg) {
      elements.userAvatarBadge.style.background = selectedRole.avatarBg;
    }
    if (elements.userAvatarInitials && selectedRole.initials) {
      elements.userAvatarInitials.textContent = selectedRole.initials;
    }

    elements.userName.textContent = selectedRole.name;
    elements.userRoleTitle.textContent = selectedRole.title;
    elements.sidebarClearanceBadge.textContent = selectedRole.clearanceLabel;
    elements.sidebarClearanceBadge.className = `clearance-level-text ${selectedRole.badgeClass}`;
    elements.sidebarClearanceDesc.textContent = `Clearances: ${selectedRole.allowedClearances.join(", ")}`;

    showToast(`Active Persona: ${selectedRole.name} (${selectedRole.clearanceLabel})`, "success");

    // Re-render Knowledge Base, Audit Logs and Approvals to reflect clearance context
    renderKnowledgeBase();
    renderAuditLogs();
    renderPendingApprovals();
  }

  elements.roleSelect.addEventListener("change", (e) => {
    switchRole(e.target.value);
  });

  // =========================================================================
  // Navigation & View Switching
  // =========================================================================
  const navItems = document.querySelectorAll(".nav-item");
  const viewPanels = document.querySelectorAll(".view-panel");

  function switchTab(tabId) {
    state.activeTab = tabId;
    navItems.forEach(item => {
      item.classList.toggle("active", item.dataset.tab === tabId);
    });
    viewPanels.forEach(panel => {
      panel.classList.toggle("active", panel.id === `view-${tabId}`);
    });

    if (tabId === "insights") {
      renderBusinessInsights();
    } else if (tabId === "kb") {
      renderKnowledgeBase();
    } else if (tabId === "approvals") {
      renderPendingApprovals();
    } else if (tabId === "audit") {
      renderAuditLogs();
    } else if (tabId === "agents") {
      renderWorkflowsList();
    }
  }

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      switchTab(item.dataset.tab);
    });
  });

  document.getElementById("approvalBellBtn")?.addEventListener("click", () => {
    switchTab("approvals");
  });

  // =========================================================================
  // Toast Notifications
  // =========================================================================
  function showToast(message, type = "info") {
    if (!elements.toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "warning") icon = "⚠️";
    if (type === "error") icon = "❌";

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(20px)";
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  // =========================================================================
  // Chat History & Session Management
  // =========================================================================

  const COPILOT_HERO_TEMPLATE = `
    <div class="copilot-hero" id="copilotHero">
      <div class="hero-icon">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <h1 class="hero-title">Enterprise AI Copilot</h1>
      <p class="hero-subtitle">
        Search verified institutional knowledge, execute automated workflows, generate business analytics, and enforce least-privilege security clearance in real time.
      </p>

      <!-- Quick Prompt Recommendation Chips -->
      <div class="prompt-chips-grid">
        <div class="prompt-chip" data-query="How do we handle multi-region failover between us-east-1 and eu-central-1?">
          <div class="chip-title">
            <span>Cloud Architecture & Topology</span>
            <span class="chip-tag tag-rag">RAG Search</span>
          </div>
          <div class="chip-desc">Retrieves EKS node topology, Karpenter rules & RPO/RTO metrics.</div>
        </div>

        <div class="prompt-chip" data-query="Show me the executive compensation bands and bonus matrix for FY2026">
          <div class="chip-title">
            <span>Executive Bonus & Salary Bands</span>
            <span class="chip-tag tag-security">Clearance Test</span>
          </div>
          <div class="chip-desc">Tests RBAC filtering: Restricted to Level 4+ HR & Executive roles.</div>
        </div>

        <div class="prompt-chip" data-query="Scale EKS production compute cluster from 12 to 36 nodes">
          <div class="chip-title">
            <span>Scale Production Cluster</span>
            <span class="chip-tag tag-agent">HITL Approval</span>
          </div>
          <div class="chip-desc">Triggers Human-In-The-Loop gate (+$18,400/mo impact).</div>
        </div>

        <div class="prompt-chip" data-query="What was our Q3 ARR, gross margin, monthly burn rate, and runway?">
          <div class="chip-title">
            <span>Q3 Financial Performance Telemetry</span>
            <span class="chip-tag tag-analytics">BI Synthesis</span>
          </div>
          <div class="chip-desc">Generates audited financial KPI summary table and budget delta chart.</div>
        </div>
      </div>
    </div>
  `;

  function renderChatSessionsList() {
    if (!elements.chatSessionsList) return;

    if (elements.chatSessionCount) {
      elements.chatSessionCount.textContent = `${state.chatSessions.length}`;
    }

    elements.chatSessionsList.innerHTML = "";

    if (state.chatSessions.length === 0) {
      elements.chatSessionsList.innerHTML = `
        <div style="padding: 24px 12px; text-align: center; color: var(--text-tertiary); font-size: 12px;">
          No past conversations.<br>Click "New Chat" to begin.
        </div>
      `;
      return;
    }

    state.chatSessions.forEach(session => {
      const isActive = session.id === state.activeSessionId;
      const item = document.createElement("div");
      item.className = `chat-session-item ${isActive ? 'active' : ''}`;
      item.dataset.id = session.id;

      item.innerHTML = `
        <div class="chat-session-info-left">
          <span class="chat-session-icon">💬</span>
          <div class="chat-session-text-wrap">
            <span class="chat-session-title">${escapeHtml(session.title)}</span>
            <span class="chat-session-meta">${session.timestamp || 'Today'}</span>
          </div>
        </div>
        <button class="btn-delete-session" data-id="${session.id}" title="Delete conversation">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;

      item.addEventListener("click", (e) => {
        if (e.target.closest(".btn-delete-session")) return;
        loadChatSession(session.id);
      });

      const delBtn = item.querySelector(".btn-delete-session");
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteChatSession(session.id);
      });

      elements.chatSessionsList.appendChild(item);
    });
  }

  function loadChatSession(sessionId) {
    const session = state.chatSessions.find(s => s.id === sessionId);
    if (!session) return;

    state.activeSessionId = sessionId;
    if (elements.activeSessionTitle) {
      elements.activeSessionTitle.textContent = session.title;
    }

    elements.chatMessages.innerHTML = "";

    if (!session.messages || session.messages.length === 0) {
      elements.chatMessages.innerHTML = COPILOT_HERO_TEMPLATE;
      bindPromptChips();
    } else {
      session.messages.forEach(msg => {
        if (msg.sender === "user") {
          appendUserMessage(msg.text, msg.time, false);
        } else {
          appendAIMessageFromHistory(msg);
        }
      });
    }

    renderChatSessionsList();
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  }

  function createNewChat(showNotification = true) {
    state.activeSessionId = null;
    if (elements.activeSessionTitle) {
      elements.activeSessionTitle.textContent = "New Copilot Conversation";
    }
    elements.chatMessages.innerHTML = COPILOT_HERO_TEMPLATE;
    bindPromptChips();
    renderChatSessionsList();
    if (elements.chatInput) {
      elements.chatInput.value = "";
      if (showNotification) {
        elements.chatInput.focus();
      }
    }
    if (showNotification) {
      showToast("Started new copilot conversation", "info");
    }
  }

  function deleteChatSession(sessionId) {
    state.chatSessions = state.chatSessions.filter(s => s.id !== sessionId);
    saveSessionsToStorage();

    if (state.activeSessionId === sessionId) {
      createNewChat(false);
    } else {
      renderChatSessionsList();
    }

    showToast("Conversation deleted", "info");
  }

  function clearAllChatSessions() {
    state.chatSessions = [];
    saveSessionsToStorage();
    createNewChat(false);
    showToast("All chat history deleted", "info");
  }

  // Sidebar Minimization & Toggle Logic
  function toggleChatSidebar(forceState = null) {
    if (!elements.copilotChatSidebar) return;
    const isCurrentlyCollapsed = elements.copilotChatSidebar.classList.contains("collapsed");
    const targetState = forceState !== null ? forceState : !isCurrentlyCollapsed;

    elements.copilotChatSidebar.classList.toggle("collapsed", targetState);

    if (elements.btnToggleSidebar) {
      elements.btnToggleSidebar.classList.toggle("active", targetState);
      elements.btnToggleSidebar.title = targetState 
        ? "Expand Chat History Sidebar" 
        : "Minimize Chat History Sidebar";
    }

    showToast(targetState ? "Chat history sidebar minimized" : "Chat history sidebar expanded", "info");
  }

  elements.btnMinimizeSidebar?.addEventListener("click", () => toggleChatSidebar(true));
  elements.btnToggleSidebar?.addEventListener("click", () => toggleChatSidebar());

  elements.btnNewChat?.addEventListener("click", createNewChat);
  elements.btnClearAllChats?.addEventListener("click", clearAllChatSessions);

  function appendAIMessageFromHistory(msg) {
    const row = document.createElement("div");
    row.className = "chat-row ai";
    row.innerHTML = `
      <div class="msg-avatar ai">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div class="msg-bubble" style="width: 100%;">
        <div class="msg-meta">
          <strong style="color: var(--primary-700);">Nexus Enterprise Agent</strong>
          <span>•</span>
          <span>${msg.time || 'Completed'}</span>
        </div>
        <div class="msg-content">
          ${parseMarkdown(msg.text)}
        </div>
      </div>
    `;
    elements.chatMessages.appendChild(row);

    row.querySelectorAll(".citation-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        openCitationDrawer(pill.dataset.docId);
      });
    });
  }

  function bindPromptChips() {
    document.querySelectorAll(".prompt-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const query = chip.dataset.query;
        if (query) {
          handleSendQuery(query);
        }
      });
    });
  }

  // =========================================================================
  // Chat Execution & Agent ReAct Reasoning
  // =========================================================================
  async function handleSendQuery(customQuery = null) {
    const text = customQuery || elements.chatInput.value.trim();
    if (!text || agentOrchestrator.isProcessing) return;

    elements.chatInput.value = "";
    elements.chatInput.style.height = "auto";
    elements.sendBtn.disabled = true;

    // Remove hero if it exists
    const hero = document.getElementById("copilotHero");
    if (hero) hero.remove();

    // If starting a fresh chat session, create new thread in history
    if (!state.activeSessionId) {
      const words = text.split(/\s+/).slice(0, 6).join(" ");
      const newTitle = words + (text.split(/\s+/).length > 6 ? "..." : "");
      const newSession = {
        id: `sess-${Date.now()}`,
        title: newTitle,
        timestamp: "Just now",
        messages: []
      };
      state.chatSessions.unshift(newSession);
      state.activeSessionId = newSession.id;
      if (elements.activeSessionTitle) {
        elements.activeSessionTitle.textContent = newTitle;
      }
      saveSessionsToStorage();
      renderChatSessionsList();
    }

    const currentSession = state.chatSessions.find(s => s.id === state.activeSessionId);
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Render User Message
    appendUserMessage(text, currentTime, true);
    if (currentSession) {
      currentSession.messages.push({ sender: "user", text, time: currentTime });
      saveSessionsToStorage();
    }

    // 2. Render AI Placeholder Message with Live Trace Accordion
    const aiMessageContainer = appendAIMessagePlaceholder();

    try {
      const response = await agentOrchestrator.processQuery({
        query: text,
        currentUser: state.currentUser,
        onStepUpdate: (steps) => {
          updateTraceSteps(aiMessageContainer, steps);
        },
        onPendingApproval: (approval) => {
          updatePendingBadge();
          renderHitlApprovalCard(aiMessageContainer, approval);
        }
      });

      // Update response content
      finalizeAIMessage(aiMessageContainer, response);
      updatePendingBadge();

      // Persist in current session
      if (currentSession && response.markdown) {
        currentSession.messages.push({
          sender: "ai",
          text: response.markdown,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: response.citations
        });
        saveSessionsToStorage();
      }

    } catch (err) {
      console.error(err);
      aiMessageContainer.querySelector(".msg-content").innerHTML = `
        <div style="color: var(--rose-600); font-weight: 600;">
          ❌ Task encountered an unexpected error: ${err.message}
        </div>
      `;
    } finally {
      elements.sendBtn.disabled = false;
      elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }
  }

  function appendUserMessage(text, time = null, scroll = true) {
    const formattedTime = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const row = document.createElement("div");
    row.className = "chat-row user";
    row.innerHTML = `
      <div class="msg-bubble">
        <div class="msg-meta" style="color: rgba(255,255,255,0.85); justify-content: flex-end;">
          <span>${state.currentUser.name} (${state.currentUser.clearanceLabel})</span>
          <span>•</span>
          <span>${formattedTime}</span>
        </div>
        <div class="msg-text">${escapeHtml(text)}</div>
      </div>
      <div class="msg-avatar user-avatar-badge" style="background: ${state.currentUser.avatarBg || 'linear-gradient(135deg, #6366F1, #8B5CF6)'};">
        <span>${state.currentUser.initials || 'SB'}</span>
      </div>
    `;
    elements.chatMessages.appendChild(row);
    if (scroll) {
      elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }
  }

  function appendAIMessagePlaceholder() {
    const row = document.createElement("div");
    row.className = "chat-row ai";
    row.innerHTML = `
      <div class="msg-avatar ai">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div class="msg-bubble" style="width: 100%;">
        <div class="msg-meta">
          <strong style="color: var(--primary-700);">Nexus Enterprise Agent</strong>
          <span>•</span>
          <span class="response-timer">Thinking...</span>
        </div>
        
        <!-- Live Agent Trace Accordion -->
        <div class="agent-trace-accordion">
          <div class="trace-summary-header">
            <span class="trace-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Agent Execution & Reasoning Trace (<span class="trace-step-count">1 step</span>)
            </span>
            <span class="trace-toggle-icon">▼</span>
          </div>
          <div class="trace-steps-list"></div>
        </div>

        <div class="msg-content">
          <span style="color: var(--text-tertiary);">Processing enterprise request across vector indices and tool integrations...</span>
        </div>
      </div>
    `;
    elements.chatMessages.appendChild(row);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

    const header = row.querySelector(".trace-summary-header");
    const list = row.querySelector(".trace-steps-list");
    header.addEventListener("click", () => {
      const isHidden = list.style.display === "none";
      list.style.display = isHidden ? "flex" : "none";
      header.querySelector(".trace-toggle-icon").textContent = isHidden ? "▼" : "▶";
    });

    return row;
  }

  function updateTraceSteps(row, steps) {
    const list = row.querySelector(".trace-steps-list");
    const countEl = row.querySelector(".trace-step-count");
    if (!list || !countEl) return;

    countEl.textContent = `${steps.length} step${steps.length > 1 ? 's' : ''}`;
    list.innerHTML = "";

    steps.forEach(step => {
      const stepItem = document.createElement("div");
      stepItem.className = `trace-step-item ${step.type}`;
      stepItem.innerHTML = `
        <div class="step-content">
          <strong>${step.agent} • ${step.title}</strong>
          <div class="step-details">${escapeHtml(step.content)}</div>
        </div>
      `;
      list.appendChild(stepItem);
    });
  }

  function finalizeAIMessage(row, response) {
    const timer = row.querySelector(".response-timer");
    if (timer) timer.textContent = `${response.latencyMs}ms`;

    const contentEl = row.querySelector(".msg-content");
    if (!contentEl) return;

    if (response.type === "PENDING_APPROVAL") {
      contentEl.innerHTML = `
        <div style="margin-bottom: 8px; color: #B45309; font-weight: 600;">
          ⚠️ Sensitive Action Halted for Mandatory Human Authorization (HITL):
        </div>
      `;
      return;
    }

    if (response.type === "BI_INSIGHT") {
      let html = parseMarkdown(response.markdown);
      if (response.chartConfig) {
        const chartId = `chat-chart-${Date.now()}`;
        html += `
          <div class="chart-card" style="margin-top: 16px; border: 1px solid var(--border-default);">
            <div class="chart-card-title">${response.chartConfig.title}</div>
            <div id="${chartId}" style="margin-top: 10px;"></div>
          </div>
        `;
        contentEl.innerHTML = html;
        setTimeout(() => {
          window.EnterpriseChartEngine.renderGroupedBarChart(chartId, response.chartConfig);
        }, 50);
      } else {
        contentEl.innerHTML = html;
      }
    } else {
      contentEl.innerHTML = parseMarkdown(response.markdown || response.message);
    }

    contentEl.querySelectorAll(".citation-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        openCitationDrawer(pill.dataset.docId);
      });
    });
  }

  function renderHitlApprovalCard(row, approval) {
    const contentEl = row.querySelector(".msg-content");
    if (!contentEl) return;

    const card = document.createElement("div");
    card.className = "hitl-approval-card";
    card.id = `card-${approval.approvalId}`;
    card.innerHTML = `
      <div class="approval-card-header">
        <span class="approval-badge">
          🛡️ Human-in-the-Loop Gate • ${approval.category}
        </span>
        <span class="badge-risk critical">${approval.riskLevel} RISK</span>
      </div>

      <div class="approval-title">${approval.actionName}</div>
      <div style="font-size: 13px; color: #78350F; margin-bottom: 10px;">
        Requires verified sign-off before modifying enterprise cloud/system state.
      </div>

      <div class="approval-meta-grid">
        <div class="meta-col">
          <span>Cost / Impact</span>
          <strong style="color: #B45309;">${approval.costImpact}</strong>
        </div>
        <div class="meta-col">
          <span>Target System</span>
          <strong>${approval.targetSystem}</strong>
        </div>
        <div class="meta-col">
          <span>Requested By</span>
          <strong>${approval.requester.name}</strong>
        </div>
      </div>

      <div style="font-size: 11.5px; font-weight: 600; color: #92400E; margin-bottom: 4px;">Payload Parameters:</div>
      <pre class="approval-params-pre">${JSON.stringify(approval.parameters, null, 2)}</pre>

      <div class="approval-actions-bar">
        <button class="btn-reject" data-id="${approval.approvalId}">Reject Action</button>
        <button class="btn-approve" data-id="${approval.approvalId}">Approve & Resume</button>
      </div>
    `;

    contentEl.appendChild(card);

    card.querySelector(".btn-approve").addEventListener("click", async () => {
      await handleApproveAction(approval.approvalId, card);
    });

    card.querySelector(".btn-reject").addEventListener("click", async () => {
      await handleRejectAction(approval.approvalId, card);
    });
  }

  async function handleApproveAction(approvalId, cardElement) {
    try {
      const res = await agentOrchestrator.approveAndResume(
        approvalId,
        state.currentUser,
        `Approved by ${state.currentUser.name} (${state.currentUser.clearanceLabel})`
      );

      cardElement.innerHTML = `
        <div style="color: var(--emerald-700); font-weight: 600; font-size: 13.5px; display: flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          ${res.message}
        </div>
        <div style="font-size: 11.5px; color: var(--emerald-600); margin-top: 4px;">
          Execution resumed. Confirmation token: #AUTH-${Date.now().toString().slice(-6)}
        </div>
      `;
      cardElement.style.background = "var(--emerald-50)";
      cardElement.style.borderColor = "#A7F3D0";

      showToast(`Action ${approvalId} Authorized!`, "success");
      updatePendingBadge();
      renderPendingApprovals();
      renderAuditLogs();

    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function handleRejectAction(approvalId, cardElement) {
    try {
      const res = await agentOrchestrator.rejectAction(
        approvalId,
        state.currentUser,
        "Denied by authorized operator"
      );

      cardElement.innerHTML = `
        <div style="color: var(--rose-700); font-weight: 600; font-size: 13.5px; display: flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          ${res.message}
        </div>
        <div style="font-size: 11.5px; color: var(--rose-600); margin-top: 4px;">
          Rollback complete. System state unchanged.
        </div>
      `;
      cardElement.style.background = "var(--rose-50)";
      cardElement.style.borderColor = "#FECDD3";

      showToast(`Action ${approvalId} Declined.`, "warning");
      updatePendingBadge();
      renderPendingApprovals();
      renderAuditLogs();

    } catch (err) {
      showToast(err.message, "error");
    }
  }

  function updatePendingBadge() {
    const pendingList = Array.from(agentOrchestrator.pendingApprovals.values()).filter(a => a.status === "PENDING");
    state.pendingApprovalsCount = pendingList.length;

    if (elements.approvalBellBadge) {
      elements.approvalBellBadge.textContent = state.pendingApprovalsCount;
      elements.approvalBellBadge.style.display = state.pendingApprovalsCount > 0 ? "flex" : "none";
    }
    if (elements.approvalsNavBadge) {
      elements.approvalsNavBadge.textContent = `${state.pendingApprovalsCount} Pending`;
      elements.approvalsNavBadge.style.display = state.pendingApprovalsCount > 0 ? "inline-block" : "none";
    }
  }

  // Input Listeners
  elements.sendBtn.addEventListener("click", () => handleSendQuery());
  
  elements.chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery();
    }
  });

  elements.chatInput.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 140) + "px";
  });

  // =========================================================================
  // Global Enterprise Search & Command Palette Modal
  // =========================================================================

  function openGlobalSearch() {
    if (!elements.globalSearchModal) return;
    elements.globalSearchModal.classList.add("open");
    elements.paletteSearchInput.value = "";
    elements.paletteSearchInput.focus();
    renderPaletteResults("");
  }

  function closeGlobalSearch() {
    if (!elements.globalSearchModal) return;
    elements.globalSearchModal.classList.remove("open");
  }

  elements.globalSearchBtn?.addEventListener("click", openGlobalSearch);
  elements.btnClosePalette?.addEventListener("click", closeGlobalSearch);
  elements.globalSearchModal?.addEventListener("click", (e) => {
    if (e.target === elements.globalSearchModal) {
      closeGlobalSearch();
    }
  });

  elements.paletteSearchInput?.addEventListener("input", (e) => {
    renderPaletteResults(e.target.value.trim());
  });

  document.querySelectorAll(".palette-filter-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".palette-filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      state.searchFilterCategory = chip.dataset.filter;
      renderPaletteResults(elements.paletteSearchInput.value.trim());
    });
  });

  function renderPaletteResults(term) {
    if (!elements.paletteResults) return;
    const s = term.toLowerCase();
    const filter = state.searchFilterCategory;
    let html = "";

    // 1. Matched Documents
    if (filter === "all" || filter === "docs") {
      const matchedDocs = ragEngine.documents.filter(doc => {
        if (!s) return true;
        return doc.title.toLowerCase().includes(s) ||
               doc.id.toLowerCase().includes(s) ||
               doc.department.toLowerCase().includes(s) ||
               doc.tags.some(t => t.includes(s)) ||
               doc.summary.toLowerCase().includes(s);
      }).slice(0, s ? 8 : 4);

      if (matchedDocs.length > 0) {
        html += `<div class="palette-group-title">Knowledge Base Documents (${matchedDocs.length})</div>`;
        matchedDocs.forEach(doc => {
          html += `
            <div class="palette-result-item" data-type="doc" data-id="${doc.id}">
              <div class="palette-result-left">
                <div class="palette-result-icon">📄</div>
                <div class="palette-result-content">
                  <div class="palette-result-title">
                    <strong style="color: var(--primary-700); font-family: var(--font-mono);">${doc.id}:</strong> ${escapeHtml(doc.title)}
                  </div>
                  <div class="palette-result-snippet">${escapeHtml(doc.summary)}</div>
                </div>
              </div>
              <span class="palette-result-badge clearance-${doc.clearance}">${doc.clearance}</span>
            </div>
          `;
        });
      }
    }

    // 2. Matched Workflows
    if (filter === "all" || filter === "workflows") {
      const matchedWfs = window.ENTERPRISE_DATA.WORKFLOW_TEMPLATES.filter(wf => {
        if (!s) return true;
        return wf.name.toLowerCase().includes(s) ||
               wf.description.toLowerCase().includes(s) ||
               wf.department.toLowerCase().includes(s) ||
               wf.category.toLowerCase().includes(s);
      }).slice(0, 4);

      if (matchedWfs.length > 0) {
        html += `<div class="palette-group-title">Agent Workflow Runbooks (${matchedWfs.length})</div>`;
        matchedWfs.forEach(wf => {
          html += `
            <div class="palette-result-item" data-type="workflow" data-id="${wf.id}" data-name="${escapeHtml(wf.name)}">
              <div class="palette-result-left">
                <div class="palette-result-icon">⚡</div>
                <div class="palette-result-content">
                  <div class="palette-result-title">${escapeHtml(wf.name)}</div>
                  <div class="palette-result-snippet">${escapeHtml(wf.description)} • <strong>${wf.costImpact}</strong></div>
                </div>
              </div>
              <span class="badge-risk ${wf.riskLevel.toLowerCase()}">${wf.riskLevel}</span>
            </div>
          `;
        });
      }
    }

    // 3. Navigation Shortcuts
    if (filter === "all" || filter === "navigation") {
      const navLinks = [
        { tab: "chat", title: "Enterprise AI Copilot Chat", desc: "Interact with multi-agent orchestration and live RAG retrieval" },
        { tab: "agents", title: "AI Agents & Workflow Catalog", desc: "Explore agent definitions and automated operational DAGs" },
        { tab: "insights", title: "Executive Business Insights & KPIs", desc: "View real-time telemetry, adoption charts, and Q3 summaries" },
        { tab: "kb", title: "Company Knowledge Base & Ingestion", desc: "Browse 28+ verified documents and ingest new policies" },
        { tab: "approvals", title: "HITL Governance & Authorizations", desc: "Review sensitive operations requiring human approval" },
        { tab: "audit", title: "Security & Compliance Audit Ledger", desc: "Immutable event logs and compliance CSV/JSON exports" }
      ].filter(n => !s || n.title.toLowerCase().includes(s) || n.desc.toLowerCase().includes(s));

      if (navLinks.length > 0) {
        html += `<div class="palette-group-title">Platform Navigation</div>`;
        navLinks.forEach(n => {
          html += `
            <div class="palette-result-item" data-type="nav" data-tab="${n.tab}">
              <div class="palette-result-left">
                <div class="palette-result-icon">🧭</div>
                <div class="palette-result-content">
                  <div class="palette-result-title">${n.title}</div>
                  <div class="palette-result-snippet">${n.desc}</div>
                </div>
              </div>
              <span class="palette-result-badge" style="background: var(--bg-surface-subtle); border: 1px solid var(--border-default);">Page</span>
            </div>
          `;
        });
      }
    }

    if (!html) {
      html = `
        <div style="padding: 36px 16px; text-align: center; color: var(--text-muted);">
          <div style="font-size: 24px; margin-bottom: 6px;">🔍</div>
          <div style="font-size: 14px; font-weight: 600; color: var(--text-main);">No matching results found</div>
          <div style="font-size: 12px;">Try adjusting your search terms or selecting a different category filter.</div>
        </div>
      `;
    }

    elements.paletteResults.innerHTML = html;

    // Attach Click Handlers to Results
    elements.paletteResults.querySelectorAll(".palette-result-item").forEach(item => {
      item.addEventListener("click", () => {
        const type = item.dataset.type;
        closeGlobalSearch();

        if (type === "doc") {
          openCitationDrawer(item.dataset.id);
        } else if (type === "workflow") {
          switchTab("chat");
          handleSendQuery(`Run enterprise workflow: ${item.dataset.name}`);
        } else if (type === "nav") {
          switchTab(item.dataset.tab);
        }
      });
    });
  }

  // Keyboard Navigation for Palette and Global Shortcut (Ctrl/Cmd + K)
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      openGlobalSearch();
    } else if (e.key === "Escape") {
      closeGlobalSearch();
      closeCitationDrawer();
    }
  });

  // =========================================================================
  // Sliding Citation Drawer Handler
  // =========================================================================
  function openCitationDrawer(docId) {
    const doc = ragEngine.getDocumentById(docId);
    if (!doc) {
      showToast(`Document ${docId} not found.`, "error");
      return;
    }

    elements.drawerTitle.textContent = doc.title;
    elements.drawerMeta.innerHTML = `
      <div><strong>Document ID:</strong> ${doc.id}</div>
      <div><strong>Clearance:</strong> <span class="clearance-badge clearance-${doc.clearance}">${doc.clearance}</span></div>
      <div><strong>Department:</strong> ${doc.department}</div>
      <div><strong>Author:</strong> ${doc.author}</div>
      <div><strong>Last Updated:</strong> ${doc.updatedAt}</div>
      <div><strong>Version:</strong> ${doc.version}</div>
    `;
    elements.drawerContent.innerHTML = parseMarkdown(doc.content);

    elements.citationDrawer.classList.add("open");
    elements.drawerBackdrop.classList.add("open");
  }

  function closeCitationDrawer() {
    elements.citationDrawer.classList.remove("open");
    elements.drawerBackdrop.classList.remove("open");
  }

  document.getElementById("drawerCloseBtn")?.addEventListener("click", closeCitationDrawer);
  elements.drawerBackdrop?.addEventListener("click", closeCitationDrawer);

  // =========================================================================
  // View: Business Insights Hub & Dynamic Charts
  // =========================================================================
  function renderBusinessInsights() {
    const metrics = window.ENTERPRISE_DATA.BUSINESS_METRICS;
    
    window.EnterpriseChartEngine.renderTrendChart("trendChartContainer", metrics.weeklyTrend, {
      width: 600,
      height: 220
    });

    window.EnterpriseChartEngine.renderDepartmentBars("deptBarsContainer", metrics.departmentUsage);

    const briefBtn = document.getElementById("btnGenerateQ3Brief");
    if (briefBtn) {
      briefBtn.onclick = () => {
        switchTab("chat");
        handleSendQuery("Synthesize Q3 FY2026 Financial Results, ARR variance, and monthly runway analysis");
      };
    }
  }

  // =========================================================================
  // View: Knowledge Base Management & Ingestion
  // =========================================================================
  function renderKnowledgeBase() {
    const listContainer = document.getElementById("kbDocsTableBody");
    if (!listContainer) return;

    const searchTerm = document.getElementById("kbSearchInput")?.value.toLowerCase() || "";
    const selectedDept = document.getElementById("kbDeptFilter")?.value || "ALL";

    if (elements.paletteDocsCount) {
      elements.paletteDocsCount.textContent = `${ragEngine.documents.length}`;
    }

    const filteredDocs = ragEngine.documents.filter(doc => {
      if (selectedDept !== "ALL" && doc.department !== selectedDept) return false;
      if (searchTerm) {
        const matches = doc.title.toLowerCase().includes(searchTerm) ||
                        doc.id.toLowerCase().includes(searchTerm) ||
                        doc.tags.some(t => t.includes(searchTerm));
        if (!matches) return false;
      }
      return true;
    });

    listContainer.innerHTML = "";
    filteredDocs.forEach(doc => {
      const isAuthorized = state.currentUser.allowedClearances.includes(doc.clearance);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong style="color: var(--primary-700); font-family: var(--font-mono);">${doc.id}</strong></td>
        <td>
          <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(doc.title)}</div>
          <div style="font-size: 11.5px; color: var(--text-muted);">${escapeHtml(doc.summary)}</div>
        </td>
        <td>${doc.department}</td>
        <td><span class="clearance-badge clearance-${doc.clearance}">${doc.clearance}</span></td>
        <td>
          ${isAuthorized 
            ? `<span style="color: var(--emerald-600); font-weight: 600; font-size: 12px;">● Authorized</span>`
            : `<span style="color: var(--rose-600); font-weight: 600; font-size: 12px;">🔒 Restricted</span>`
          }
        </td>
        <td>${doc.updatedAt}</td>
        <td>
          <button class="btn-secondary view-doc-btn" data-id="${doc.id}" style="padding: 4px 8px; font-size: 11.5px;">View</button>
        </td>
      `;
      listContainer.appendChild(row);
    });

    listContainer.querySelectorAll(".view-doc-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        openCitationDrawer(btn.dataset.id);
      });
    });
  }

  document.getElementById("kbSearchInput")?.addEventListener("input", renderKnowledgeBase);
  document.getElementById("kbDeptFilter")?.addEventListener("change", renderKnowledgeBase);

  // Ingest Document Modal
  const openIngestBtn = document.getElementById("btnOpenIngestModal");
  const closeIngestBtn = document.getElementById("btnCloseIngestModal");
  const cancelIngestBtn = document.getElementById("btnCancelIngest");
  const ingestForm = document.getElementById("ingestDocForm");

  openIngestBtn?.addEventListener("click", () => {
    elements.ingestModal.classList.add("open");
  });

  const closeIngestModal = () => {
    elements.ingestModal.classList.remove("open");
    ingestForm?.reset();
  };

  closeIngestBtn?.addEventListener("click", closeIngestModal);
  cancelIngestBtn?.addEventListener("click", closeIngestModal);

  ingestForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("ingestDocId").value.trim();
    const title = document.getElementById("ingestDocTitle").value.trim();
    const department = document.getElementById("ingestDocDept").value;
    const clearance = document.getElementById("ingestDocClearance").value;
    const tags = document.getElementById("ingestDocTags").value;
    const content = document.getElementById("ingestDocContent").value.trim();

    try {
      ragEngine.ingestDocument({
        id,
        title,
        department,
        clearance,
        author: `${state.currentUser.name} (${state.currentUser.title})`,
        tags,
        content
      });

      showToast(`Document "${id}" indexed successfully into vector store!`, "success");
      closeIngestModal();
      renderKnowledgeBase();

      auditLogger.logEvent({
        user: state.currentUser.name,
        userRole: state.currentUser.title,
        clearanceTier: state.currentUser.clearanceTier,
        action: "DOCUMENT_INGESTED",
        query: `Ingest ${id}: ${title}`,
        retrievedDocIds: [id],
        blockedDocIds: [],
        latencyMs: 85,
        status: "SUCCESS",
        riskLevel: clearance.includes("Restricted") ? "HIGH" : "LOW",
        details: `Classification: ${clearance} • Department: ${department}`
      });

    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // =========================================================================
  // View: Pending Approvals & Human-in-the-Loop Center
  // =========================================================================
  function renderPendingApprovals() {
    const container = document.getElementById("approvalsListContainer");
    if (!container) return;

    const allApprovals = Array.from(agentOrchestrator.pendingApprovals.values());
    if (allApprovals.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
          <div style="font-size: 36px; margin-bottom: 8px;">🛡️</div>
          <div style="font-size: 16px; font-weight: 600; color: var(--text-main);">Zero Pending Authorizations</div>
          <div style="font-size: 13px;">All agent tasks and sensitive workflow requests are in compliant states.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    allApprovals.forEach(approval => {
      const card = document.createElement("div");
      card.className = "hitl-approval-card";
      card.style.background = approval.status === "PENDING" ? "#FFFBEB" : (approval.status === "APPROVED" ? "var(--emerald-50)" : "var(--rose-50)");
      card.style.borderColor = approval.status === "PENDING" ? "#FCD34D" : (approval.status === "APPROVED" ? "#A7F3D0" : "#FECDD3");

      card.innerHTML = `
        <div class="approval-card-header">
          <span class="approval-badge">
            ${approval.approvalId} • ${approval.category}
          </span>
          <span class="badge-risk ${approval.riskLevel.toLowerCase()}">${approval.status}</span>
        </div>

        <div class="approval-title">${approval.actionName}</div>
        <div class="approval-meta-grid">
          <div class="meta-col">
            <span>Cost / Impact</span>
            <strong>${approval.costImpact}</strong>
          </div>
          <div class="meta-col">
            <span>Target System</span>
            <strong>${approval.targetSystem}</strong>
          </div>
          <div class="meta-col">
            <span>Requested By</span>
            <strong>${approval.requester.name} (${approval.requester.role})</strong>
          </div>
        </div>

        <pre class="approval-params-pre">${JSON.stringify(approval.parameters, null, 2)}</pre>

        ${approval.status === "PENDING" ? `
          <div class="approval-actions-bar">
            <button class="btn-reject" data-id="${approval.approvalId}">Decline</button>
            <button class="btn-approve" data-id="${approval.approvalId}">Authorize Execution</button>
          </div>
        ` : `
          <div style="font-size: 12px; font-weight: 600; color: ${approval.status === 'APPROVED' ? 'var(--emerald-700)' : 'var(--rose-700)'};">
            ${approval.status === 'APPROVED' ? `✓ Authorized by ${approval.approvedBy?.name}` : `✕ Declined by ${approval.rejectedBy?.name}`}
          </div>
        `}
      `;

      if (approval.status === "PENDING") {
        card.querySelector(".btn-approve").addEventListener("click", async () => {
          await handleApproveAction(approval.approvalId, card);
        });
        card.querySelector(".btn-reject").addEventListener("click", async () => {
          await handleRejectAction(approval.approvalId, card);
        });
      }

      container.appendChild(card);
    });
  }

  // =========================================================================
  // View: Immutable Audit & Security Ledger
  // =========================================================================
  function renderAuditLogs() {
    const tbody = document.getElementById("auditTableBody");
    if (!tbody) return;

    const searchTerm = document.getElementById("auditSearchInput")?.value || "";
    const filterRisk = document.getElementById("auditRiskFilter")?.value || "ALL";

    const filteredLogs = auditLogger.getLogs({
      search: searchTerm,
      riskLevel: filterRisk
    });

    tbody.innerHTML = "";
    filteredLogs.forEach(entry => {
      const row = document.createElement("tr");
      let statusBadge = `<span style="color: var(--emerald-600); font-weight: 600;">SUCCESS</span>`;
      if (entry.status.includes("RESTRICTED") || entry.status === "REJECTED") {
        statusBadge = `<span style="color: var(--rose-600); font-weight: 600;">${entry.status}</span>`;
      } else if (entry.status.includes("APPROVAL")) {
        statusBadge = `<span style="color: var(--amber-700); font-weight: 600;">${entry.status}</span>`;
      }

      row.innerHTML = `
        <td style="font-family: var(--font-mono); font-size: 11.5px; color: var(--text-muted);">${entry.timestamp.split(" ")[1]}</td>
        <td>
          <div style="font-weight: 600;">${entry.user}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${entry.userRole}</div>
        </td>
        <td><strong style="color: var(--primary-700); font-size: 11.5px;">${entry.action}</strong></td>
        <td>
          <div style="max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(entry.query)}">
            ${escapeHtml(entry.query)}
          </div>
          ${entry.details ? `<div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(entry.details)}</div>` : ''}
        </td>
        <td><span class="badge-risk ${entry.riskLevel.toLowerCase()}">${entry.riskLevel}</span></td>
        <td>${statusBadge}</td>
        <td style="font-family: var(--font-mono); font-size: 11.5px;">${entry.latencyMs}ms</td>
      `;
      tbody.appendChild(row);
    });
  }

  document.getElementById("auditSearchInput")?.addEventListener("input", renderAuditLogs);
  document.getElementById("auditRiskFilter")?.addEventListener("change", renderAuditLogs);

  document.getElementById("btnExportAuditCsv")?.addEventListener("click", () => {
    const csv = auditLogger.exportCSV();
    downloadFile(csv, "nexus-enterprise-audit-log.csv", "text/csv");
    showToast("Audit log exported as CSV", "success");
  });

  document.getElementById("btnExportAuditJson")?.addEventListener("click", () => {
    const json = auditLogger.exportJSON();
    downloadFile(json, "nexus-enterprise-audit-log.json", "application/json");
    showToast("Audit log exported as JSON", "success");
  });

  // =========================================================================
  // View: Automated Workflows Catalog
  // =========================================================================
  function renderWorkflowsList() {
    const tbody = document.getElementById("workflowsTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    window.ENTERPRISE_DATA.WORKFLOW_TEMPLATES.forEach(wf => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <strong style="color: var(--text-main); font-size: 13.5px;">${wf.name}</strong>
          <div style="font-size: 11.5px; color: var(--text-muted);">${wf.description}</div>
        </td>
        <td>${wf.department}</td>
        <td><span class="badge-risk ${wf.riskLevel.toLowerCase()}">${wf.riskLevel}</span></td>
        <td style="font-weight: 600; color: ${wf.costImpact.includes('+') ? '#B45309' : 'var(--text-main)'};">${wf.costImpact}</td>
        <td>
          ${wf.requiresApproval 
            ? `<span style="color: #B45309; font-weight: 600; font-size: 11.5px;">⚠️ Human Approval Required</span>`
            : `<span style="color: var(--emerald-600); font-weight: 600; font-size: 11.5px;">✓ Auto-Execute</span>`
          }
        </td>
        <td>
          <button class="btn-trigger-wf trigger-wf-btn" data-id="${wf.id}">Launch</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    tbody.querySelectorAll(".trigger-wf-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const wfId = btn.dataset.id;
        const wf = window.ENTERPRISE_DATA.WORKFLOW_TEMPLATES.find(w => w.id === wfId);
        if (wf) {
          switchTab("chat");
          handleSendQuery(`Run enterprise workflow: ${wf.name}`);
        }
      });
    });
  }

  // =========================================================================
  // Helper Utilities: Markdown Parser, Escaper, File Downloader
  // =========================================================================
  function parseMarkdown(md) {
    if (!md) return "";
    
    let html = md.replace(/\[Doc(?:\s*#\d+)?:?\s*(DOC-[A-Z]+-\d+)\]/g, (match, docId) => {
      return `<button class="citation-pill" data-doc-id="${docId}"><span>📄</span> ${docId}</button>`;
    });

    html = html
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 15px; font-weight: 700; margin: 12px 0 6px 0; color: var(--text-main);">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4 style="font-size: 13.5px; font-weight: 700; margin: 10px 0 4px 0; color: var(--primary-800);">$1</h4>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code style="background: var(--bg-surface-alt); padding: 1px 5px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px; border: 1px solid var(--border-default);">$1</code>')
      .replace(/^> (.*$)/gim, '<blockquote style="border-left: 3px solid var(--primary-500); padding-left: 12px; margin: 8px 0; color: var(--text-secondary); background: var(--primary-50); padding: 6px 10px; border-radius: 0 4px 4px 0;">$1</blockquote>')
      .replace(/^\- (.*$)/gim, '<li style="margin-left: 18px; margin-bottom: 4px;">$1</li>');

    if (html.includes("|")) {
      html = html.replace(/(?:\|.*\|\r?\n?)+/g, (tableText) => {
        const rows = tableText.trim().split("\n");
        let tableHtml = '<div style="overflow-x: auto; margin: 12px 0;"><table class="enterprise-table" style="font-size: 12px; border: 1px solid var(--border-default);">';
        
        rows.forEach((row, idx) => {
          if (row.includes("---")) return;
          const cells = row.split("|").filter((_, i, arr) => i > 0 && i < arr.length - 1);
          const tag = idx === 0 ? "th" : "td";
          tableHtml += "<tr>";
          cells.forEach(c => {
            tableHtml += `<${tag} style="padding: 6px 10px;">${c.trim()}</${tag}>`;
          });
          tableHtml += "</tr>";
        });
        tableHtml += "</table></div>";
        return tableHtml;
      });
    }

    html = html.replace(/\n\n+/g, '<br><br>');
    return html;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Initial Boot - Always start on a fresh, clean conversation without loading past chats
  renderChatSessionsList();
  createNewChat(false);

  renderBusinessInsights();
  renderKnowledgeBase();
  renderPendingApprovals();
  renderAuditLogs();
  renderWorkflowsList();
  updatePendingBadge();
});
