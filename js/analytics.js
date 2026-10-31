/**
 * Enterprise Analytics & Audit Logging Engine
 * Manages the immutable audit ledger, real-time KPI metrics, and high-fidelity SVG chart visualizations.
 */

class AuditLogger {
  constructor(initialLogs = []) {
    this.logs = JSON.parse(JSON.stringify(initialLogs));
    this.listeners = [];
  }

  logEvent(event) {
    const logEntry = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: event.user || "Anonymous",
      userRole: event.userRole || "Employee",
      clearanceTier: event.clearanceTier || 1,
      action: event.action || "UNKNOWN_ACTION",
      query: event.query || "",
      retrievedDocIds: event.retrievedDocIds || [],
      blockedDocIds: event.blockedDocIds || [],
      latencyMs: event.latencyMs || 0,
      status: event.status || "SUCCESS",
      riskLevel: event.riskLevel || "LOW",
      details: event.details || ""
    };

    this.logs.unshift(logEntry);
    this.notify();
    return logEntry;
  }

  getLogs(filter = {}) {
    return this.logs.filter(entry => {
      if (filter.role && filter.role !== "ALL" && !entry.userRole.toLowerCase().includes(filter.role.toLowerCase())) {
        return false;
      }
      if (filter.action && filter.action !== "ALL" && entry.action !== filter.action) {
        return false;
      }
      if (filter.riskLevel && filter.riskLevel !== "ALL" && entry.riskLevel !== filter.riskLevel) {
        return false;
      }
      if (filter.search) {
        const s = filter.search.toLowerCase();
        const matches = entry.query.toLowerCase().includes(s) ||
                        entry.user.toLowerCase().includes(s) ||
                        entry.action.toLowerCase().includes(s) ||
                        entry.id.toLowerCase().includes(s);
        if (!matches) return false;
      }
      return true;
    });
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l(this.logs));
  }

  exportCSV() {
    const headers = ["ID", "Timestamp", "User", "Role", "ClearanceTier", "Action", "Status", "RiskLevel", "LatencyMs", "Query", "Details"];
    const rows = this.logs.map(l => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.user}"`,
      `"${l.userRole}"`,
      l.clearanceTier,
      `"${l.action}"`,
      `"${l.status}"`,
      `"${l.riskLevel}"`,
      l.latencyMs,
      `"${(l.query || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);
    return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  }

  exportJSON() {
    return JSON.stringify(this.logs, null, 2);
  }
}

/**
 * High-Fidelity SVG Chart Visualizer
 * Generates responsive, standalone SVG charts without any external dependencies.
 */
class EnterpriseChartEngine {
  // Render Area/Line trend chart
  static renderTrendChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = options.width || 640;
    const height = options.height || 220;
    const padding = { top: 25, right: 30, bottom: 35, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...data.map(d => d.queries), 1800);
    const minVal = 0;

    const getX = (idx) => padding.left + (idx / (data.length - 1)) * chartW;
    const getY = (val) => padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

    // Build path
    const points = data.map((d, i) => `${getX(i)},${getY(d.queries)}`);
    const linePath = `M ${points.join(" L ")}`;
    const areaPath = `M ${points[0]} L ${points.join(" L ")} L ${getX(data.length - 1)},${padding.top + chartH} L ${padding.left},${padding.top + chartH} Z`;

    let gridLines = "";
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      const val = Math.round(maxVal - (maxVal / 4) * i);
      gridLines += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#E2E8F0" stroke-dasharray="3,3" />
        <text x="${padding.left - 8}" y="${y + 4}" fill="#64748B" font-size="11" text-anchor="end" font-family="Inter, system-ui">${val}</text>
      `;
    }

    let xLabels = "";
    data.forEach((d, i) => {
      const x = getX(i);
      xLabels += `
        <text x="${x}" y="${height - 10}" fill="#64748B" font-size="11" text-anchor="middle" font-family="Inter, system-ui">${d.day}</text>
        <circle cx="${x}" cy="${getY(d.queries)}" r="4" fill="#2563EB" stroke="#FFFFFF" stroke-width="2" class="chart-point" />
      `;
    });

    container.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="enterprise-chart-svg" style="width: 100%; height: auto;">
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        ${gridLines}
        <path d="${areaPath}" fill="url(#trendGradient)" />
        <path d="${linePath}" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        ${xLabels}
      </svg>
    `;
  }

  // Render Horizontal Bar Chart for Department Breakdown
  static renderDepartmentBars(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = `<div class="dept-bar-list">`;
    data.forEach(item => {
      html += `
        <div class="dept-bar-item">
          <div class="dept-bar-header">
            <span class="dept-name"><span class="dept-dot" style="background-color: ${item.color};"></span>${item.department}</span>
            <span class="dept-stat"><strong>${item.percentage}%</strong> (${item.queries} queries)</span>
          </div>
          <div class="dept-progress-track">
            <div class="dept-progress-fill" style="width: ${item.percentage}%; background-color: ${item.color};"></div>
          </div>
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  }

  // Render Grouped Comparison Bar Chart (Budget vs Actual Spend)
  static renderGroupedBarChart(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = 640;
    const height = 240;
    const padding = { top: 30, right: 25, bottom: 40, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const categories = config.categories;
    const numCats = categories.length;
    const catWidth = chartW / numCats;
    const barW = Math.min(22, (catWidth - 20) / 2);

    let maxVal = 0;
    config.series.forEach(s => {
      s.data.forEach(v => { if (v > maxVal) maxVal = v; });
    });
    maxVal = Math.ceil(maxVal * 1.15);

    const getY = (val) => padding.top + chartH - (val / maxVal) * chartH;

    let grid = "";
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      const val = Math.round(maxVal - (maxVal / 4) * i);
      grid += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#E2E8F0" stroke-dasharray="3,3" />
        <text x="${padding.left - 8}" y="${y + 4}" fill="#64748B" font-size="11" text-anchor="end" font-family="Inter, system-ui">$${val}k</text>
      `;
    }

    let bars = "";
    let labels = "";
    categories.forEach((cat, cIdx) => {
      const groupX = padding.left + cIdx * catWidth;
      const x1 = groupX + (catWidth / 2) - barW - 2;
      const x2 = groupX + (catWidth / 2) + 2;

      const v1 = config.series[0].data[cIdx];
      const v2 = config.series[1].data[cIdx];
      const y1 = getY(v1);
      const y2 = getY(v2);
      const h1 = (chartH + padding.top) - y1;
      const h2 = (chartH + padding.top) - y2;

      bars += `
        <rect x="${x1}" y="${y1}" width="${barW}" height="${h1}" rx="3" fill="${config.series[0].color}" />
        <rect x="${x2}" y="${y2}" width="${barW}" height="${h2}" rx="3" fill="${config.series[1].color}" />
      `;

      labels += `
        <text x="${groupX + catWidth / 2}" y="${height - 12}" fill="#475569" font-size="11" font-weight="500" text-anchor="middle" font-family="Inter, system-ui">${cat}</text>
      `;
    });

    // Legend
    const legend = `
      <g transform="translate(${width - 210}, 12)">
        <rect x="0" y="0" width="12" height="12" rx="2" fill="${config.series[0].color}"/>
        <text x="18" y="10" fill="#475569" font-size="11" font-family="Inter, system-ui">${config.series[0].name}</text>
        <rect x="90" y="0" width="12" height="12" rx="2" fill="${config.series[1].color}"/>
        <text x="108" y="10" fill="#475569" font-size="11" font-family="Inter, system-ui">${config.series[1].name}</text>
      </g>
    `;

    container.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="enterprise-chart-svg" style="width: 100%; height: auto;">
        ${legend}
        ${grid}
        ${bars}
        ${labels}
      </svg>
    `;
  }
}

// Attach to window
window.AuditLogger = AuditLogger;
window.EnterpriseChartEngine = EnterpriseChartEngine;

