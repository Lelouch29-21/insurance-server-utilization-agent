const SAMPLE_REPORT_PATH = "./data/sample-report.json";

const state = {
  report: null,
  filter: "all",
  search: "",
};

const elements = {
  loadSampleButton: document.querySelector("#load-sample-button"),
  uploadInput: document.querySelector("#report-upload"),
  dataSourceNote: document.querySelector("#data-source-note"),
  thresholdValue: document.querySelector("#threshold-value"),
  windowDays: document.querySelector("#window-days"),
  generatedAt: document.querySelector("#generated-at"),
  underutilizedCount: document.querySelector("#underutilized-count"),
  healthyCount: document.querySelector("#healthy-count"),
  monthlySavings: document.querySelector("#monthly-savings"),
  annualSavings: document.querySelector("#annual-savings"),
  distributionUnderutilized: document.querySelector("#distribution-underutilized"),
  distributionHealthy: document.querySelector("#distribution-healthy"),
  insightStrip: document.querySelector("#insight-strip"),
  searchInput: document.querySelector("#search-input"),
  filterButtons: Array.from(document.querySelectorAll(".filter-button")),
  serverGrid: document.querySelector("#server-grid"),
  serverTableBody: document.querySelector("#server-table-body"),
  recommendationsList: document.querySelector("#recommendations-list"),
  emptyState: document.querySelector("#empty-state"),
  warningsPanel: document.querySelector("#warnings-panel"),
  warningsList: document.querySelector("#warnings-list"),
  missingPanel: document.querySelector("#missing-panel"),
  missingList: document.querySelector("#missing-list"),
};

async function init() {
  attachEventListeners();
  await loadSampleReport();
}

function attachEventListeners() {
  elements.loadSampleButton.addEventListener("click", () => {
    loadSampleReport().catch((error) => showLoadError(error.message));
  });

  elements.uploadInput.addEventListener("change", async (event) => {
    const [file] = event.target.files ?? [];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      applyReport(parsed, `Loaded report from ${file.name}.`);
    } catch (error) {
      showLoadError(`Unable to read ${file.name}: ${error.message}`);
    } finally {
      event.target.value = "";
    }
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    render();
  });

  elements.filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      elements.filterButtons.forEach((item) =>
        item.classList.toggle("active", item === button)
      );
      render();
    });
  });
}

async function loadSampleReport() {
  const response = await fetch(SAMPLE_REPORT_PATH);
  if (!response.ok) {
    throw new Error(`Sample report request failed with HTTP ${response.status}`);
  }

  const payload = await response.json();
  applyReport(payload, "Showing bundled sample data from the generated MVP report.");
}

function applyReport(report, message) {
  validateReport(report);
  state.report = report;
  elements.dataSourceNote.textContent = message;
  render();
}

function validateReport(report) {
  if (!report || typeof report !== "object") {
    throw new Error("Report payload must be a JSON object.");
  }
  if (!Array.isArray(report.servers)) {
    throw new Error("Report payload is missing a servers array.");
  }
  if (!report.summary || typeof report.summary !== "object") {
    throw new Error("Report payload is missing the summary object.");
  }
}

function render() {
  if (!state.report) {
    return;
  }

  const report = state.report;
  const servers = report.servers ?? [];
  const visibleServers = servers.filter((server) => {
    const matchesFilter =
      state.filter === "all" ||
      server.status.toLowerCase() === state.filter;
    const matchesSearch =
      !state.search || server.server_id.toLowerCase().includes(state.search);
    return matchesFilter && matchesSearch;
  });

  renderSummary(report, servers);
  renderServers(visibleServers);
  renderRecommendations(visibleServers);
  renderWarnings(report.warnings ?? []);
  renderMissing(report.missing_servers ?? []);
}

function renderSummary(report, servers) {
  const summary = report.summary ?? {};
  const underutilized = Number(summary.underutilized_servers ?? 0);
  const healthy = Number(summary.healthy_servers ?? 0);
  const total = Math.max(underutilized + healthy, 1);
  const monthlyTotals = summary.potential_monthly_savings_by_currency ?? {};
  const annualTotals = summary.potential_annual_savings_by_currency ?? {};
  const analysisWindowDays = report.analysis_window?.days ?? "-";
  const generatedAt = formatDate(report.generated_at);

  elements.thresholdValue.textContent = `${Number(report.threshold_percent ?? 0).toFixed(1)}%`;
  elements.windowDays.textContent = `${analysisWindowDays} days`;
  elements.generatedAt.textContent = generatedAt;

  elements.underutilizedCount.textContent = String(underutilized);
  elements.healthyCount.textContent = String(healthy);
  elements.monthlySavings.textContent = formatSavingsBuckets(monthlyTotals);
  elements.annualSavings.textContent = formatSavingsBuckets(annualTotals);

  elements.distributionUnderutilized.style.width = `${(underutilized / total) * 100}%`;
  elements.distributionHealthy.style.width = `${(healthy / total) * 100}%`;

  const highestSavingsServer = [...servers]
    .filter((server) => typeof server.monthly_savings_if_removed === "number")
    .sort(
      (left, right) =>
        (right.monthly_savings_if_removed ?? 0) - (left.monthly_savings_if_removed ?? 0)
    )[0];

  const insightCards = [
    {
      label: "Servers analyzed",
      value: String(summary.servers_analyzed ?? servers.length),
    },
    {
      label: "Threshold",
      value: `${Number(report.threshold_percent ?? 0).toFixed(1)}%`,
    },
    {
      label: "Largest monthly opportunity",
      value: highestSavingsServer
        ? `${highestSavingsServer.server_id} · ${formatCurrency(
            highestSavingsServer.monthly_savings_if_removed,
            highestSavingsServer.currency
          )}`
        : "N/A",
    },
  ];

  elements.insightStrip.innerHTML = insightCards
    .map(
      (item) => `
        <article class="insight-card">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
        </article>
      `
    )
    .join("");
}

function renderServers(servers) {
  elements.emptyState.classList.toggle("hidden", servers.length > 0);

  elements.serverGrid.innerHTML = servers
    .map(
      (server) => `
        <article class="server-card">
          <div class="server-card-header">
            <div>
              <h3>${escapeHtml(server.server_id)}</h3>
              <p>${escapeHtml(server.recommendation)}</p>
            </div>
            <span class="status-pill ${statusClass(server.status)}">${escapeHtml(server.status)}</span>
          </div>

          <div class="meter">
            <div class="meter-header">
              <span>CPU</span>
              <strong>${formatPercent(server.avg_cpu)}</strong>
            </div>
            <div class="meter-track">
              <div class="meter-fill cpu" style="width: ${clampPercent(server.avg_cpu)}%"></div>
            </div>
          </div>

          <div class="meter">
            <div class="meter-header">
              <span>Memory</span>
              <strong>${formatPercent(server.avg_memory)}</strong>
            </div>
            <div class="meter-track">
              <div class="meter-fill memory" style="width: ${clampPercent(server.avg_memory)}%"></div>
            </div>
          </div>

          <div class="server-meta">
            <div>
              <span>Utilization score</span>
              <strong>${formatPercent(server.utilization_score)}</strong>
            </div>
            <div>
              <span>Monthly cost</span>
              <strong>${formatCurrency(server.monthly_cost, server.currency)}</strong>
            </div>
            <div>
              <span>Savings if removed</span>
              <strong>${formatCurrency(
                server.monthly_savings_if_removed,
                server.currency
              )}</strong>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  elements.serverTableBody.innerHTML = servers
    .map(
      (server) => `
        <tr>
          <td>${escapeHtml(server.server_id)}</td>
          <td>${formatPercent(server.avg_cpu)}</td>
          <td>${formatPercent(server.avg_memory)}</td>
          <td class="score-cell">${formatPercent(server.utilization_score)}</td>
          <td><span class="status-pill ${statusClass(server.status)}">${escapeHtml(server.status)}</span></td>
          <td>${formatCurrency(server.monthly_cost, server.currency)}</td>
          <td>${formatCurrency(server.monthly_savings_if_removed, server.currency)}</td>
        </tr>
      `
    )
    .join("");
}

function renderRecommendations(servers) {
  elements.recommendationsList.innerHTML = servers
    .map(
      (server) => `
        <article class="recommendation-card">
          <div class="server-card-header">
            <h3>${escapeHtml(server.server_id)}</h3>
            <span class="status-pill ${statusClass(server.status)}">${escapeHtml(server.status)}</span>
          </div>
          <p>${escapeHtml(server.rationale)}</p>
          <ul>
            ${(server.caveats ?? [])
              .map((item) => `<li>${escapeHtml(item)}</li>`)
              .join("")}
          </ul>
        </article>
      `
    )
    .join("");
}

function renderWarnings(warnings) {
  const hasWarnings = warnings.length > 0;
  elements.warningsPanel.classList.toggle("hidden", !hasWarnings);
  elements.warningsList.innerHTML = warnings
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
}

function renderMissing(missingServers) {
  const hasMissing = missingServers.length > 0;
  elements.missingPanel.classList.toggle("hidden", !hasMissing);
  elements.missingList.innerHTML = missingServers
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
}

function statusClass(status) {
  return status.toLowerCase() === "underutilized" ? "underutilized" : "healthy";
}

function formatPercent(value) {
  return `${Number(value ?? 0).toFixed(1)}%`;
}

function clampPercent(value) {
  return Math.max(0, Math.min(Number(value ?? 0), 100));
}

function formatCurrency(amount, currency = "USD") {
  if (typeof amount !== "number") {
    return "N/A";
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatSavingsBuckets(totals) {
  const entries = Object.entries(totals ?? {});
  if (entries.length === 0) {
    return "N/A";
  }
  return entries
    .map(([currency, amount]) => formatCurrency(amount, currency))
    .join(" · ");
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function showLoadError(message) {
  elements.dataSourceNote.textContent = message;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

init().catch((error) => showLoadError(error.message));
