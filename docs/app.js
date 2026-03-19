const SAMPLE_REPORT_PATH = "./data/sample-report.json";

const state = {
  report: null,
  filter: "all",
  search: "",
  dataSourceMessage: "",
  supportsDateFiltering: false,
  availableStartDate: "",
  availableEndDate: "",
  selectedStartDate: "",
  selectedEndDate: "",
};

const elements = {
  loadSampleButton: document.querySelector("#load-sample-button"),
  uploadInput: document.querySelector("#report-upload"),
  startDateInput: document.querySelector("#start-date-input"),
  endDateInput: document.querySelector("#end-date-input"),
  resetDatesButton: document.querySelector("#reset-dates-button"),
  dataSourceNote: document.querySelector("#data-source-note"),
  dateRangeNote: document.querySelector("#date-range-note"),
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

  const handleDateChange = () => {
    if (!state.supportsDateFiltering) {
      return;
    }

    const normalized = normalizeDateWindow(
      elements.startDateInput.value || state.availableStartDate,
      elements.endDateInput.value || state.availableEndDate,
      state.availableStartDate,
      state.availableEndDate
    );
    state.selectedStartDate = normalized.start;
    state.selectedEndDate = normalized.end;
    syncDateInputs();
    render();
  };

  elements.startDateInput.addEventListener("change", handleDateChange);
  elements.endDateInput.addEventListener("change", handleDateChange);

  elements.resetDatesButton.addEventListener("click", () => {
    if (!state.supportsDateFiltering) {
      return;
    }
    state.selectedStartDate = state.availableStartDate;
    state.selectedEndDate = state.availableEndDate;
    syncDateInputs();
    render();
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
  state.dataSourceMessage = message;
  state.supportsDateFiltering = hasServerMetricSeries(report);

  const availableWindow = getAvailableDateWindow(report);
  state.availableStartDate = availableWindow.start;
  state.availableEndDate = availableWindow.end;
  state.selectedStartDate = availableWindow.start;
  state.selectedEndDate = availableWindow.end;

  syncDateInputs();
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
}

function render() {
  if (!state.report) {
    return;
  }

  const view = buildViewModel(state.report);
  const visibleServers = view.servers.filter((server) => {
    const matchesFilter =
      state.filter === "all" || server.status.toLowerCase() === state.filter;
    const matchesSearch =
      !state.search || server.server_id.toLowerCase().includes(state.search);
    return matchesFilter && matchesSearch;
  });

  renderDateNotes(view);
  renderSummary(view);
  renderServers(visibleServers);
  renderRecommendations(visibleServers);
  renderWarnings(view.warnings);
  renderMissing(state.report.missing_servers ?? []);
}

function buildViewModel(report) {
  const threshold = Number(report.threshold_percent ?? 40);
  const warnings = [...(report.warnings ?? [])];

  if (!state.supportsDateFiltering) {
    const servers = report.servers ?? [];
    return {
      servers,
      summary: computeSummary(servers),
      warnings,
      windowDays:
        report.analysis_window?.days ??
        inclusiveDayDifference(
          state.availableStartDate,
          state.availableEndDate
        ),
    };
  }

  const metricsIndex = new Map(
    (report.server_metrics ?? []).map((entry) => [entry.server_id, entry.metrics])
  );
  const derivedServers = [];
  for (const server of report.servers ?? []) {
    const recalculated = deriveServerForWindow(
      server,
      metricsIndex.get(server.server_id),
      threshold,
      state.selectedStartDate,
      state.selectedEndDate
    );
    if (!recalculated) {
      warnings.push(
        `No metric samples were available for ${server.server_id} in the selected date window.`
      );
      continue;
    }
    derivedServers.push(recalculated);
  }

  return {
    servers: derivedServers,
    summary: computeSummary(derivedServers),
    warnings: uniqueStrings(warnings),
    windowDays: inclusiveDayDifference(
      state.selectedStartDate,
      state.selectedEndDate
    ),
  };
}

function deriveServerForWindow(
  server,
  metrics,
  threshold,
  startDate,
  endDate
) {
  const cpuPoints = filterPointsByDate(
    metrics?.cpu?.points ?? [],
    startDate,
    endDate
  );
  const memoryPoints = filterPointsByDate(
    metrics?.memory?.points ?? [],
    startDate,
    endDate
  );

  if (cpuPoints.length === 0 || memoryPoints.length === 0) {
    return null;
  }

  const avgCpu = average(cpuPoints.map((point) => point.value_percent));
  const avgMemory = average(memoryPoints.map((point) => point.value_percent));
  const utilizationScore = Math.max(avgCpu, avgMemory);
  const underutilized = utilizationScore < threshold;
  const monthlyCost =
    typeof server.monthly_cost === "number" ? server.monthly_cost : null;
  const annualCost =
    typeof server.annual_cost === "number"
      ? server.annual_cost
      : monthlyCost !== null
        ? monthlyCost * 12
        : null;

  return {
    ...server,
    analysis_window_days: inclusiveDayDifference(startDate, endDate),
    avg_cpu: avgCpu,
    avg_memory: avgMemory,
    utilization_score: utilizationScore,
    status: underutilized ? "Underutilized" : "Healthy",
    monthly_cost: monthlyCost,
    annual_cost: annualCost,
    monthly_savings_if_removed: underutilized ? monthlyCost : monthlyCost !== null ? 0 : null,
    annual_savings_if_removed: underutilized ? annualCost : annualCost !== null ? 0 : null,
    recommendation: underutilized
      ? "Review for removal or consolidation"
      : "Keep in service",
    rationale: buildRationale({
      serverId: server.server_id,
      utilizationScore,
      threshold,
      dayCount: inclusiveDayDifference(startDate, endDate),
      underutilized,
      monthlyCost,
      annualCost,
      currency: server.currency,
    }),
  };
}

function buildRationale({
  serverId,
  utilizationScore,
  threshold,
  dayCount,
  underutilized,
  monthlyCost,
  annualCost,
  currency,
}) {
  if (!underutilized) {
    return `${serverId} is operating above the ${threshold.toFixed(
      1
    )}% threshold with a ${utilizationScore.toFixed(
      1
    )}% utilization score over the selected ${dayCount}-day window.`;
  }

  if (typeof monthlyCost !== "number" || typeof annualCost !== "number") {
    return `${serverId} averaged ${utilizationScore.toFixed(
      1
    )}% utilization over the selected ${dayCount}-day window, which is below the ${threshold.toFixed(
      1
    )}% threshold. The server should be reviewed for removal or consolidation, but no cost data was supplied for savings estimation.`;
  }

  return `${serverId} averaged ${utilizationScore.toFixed(
    1
  )}% utilization over the selected ${dayCount}-day window, which is below the ${threshold.toFixed(
    1
  )}% threshold. If it can be safely removed or consolidated, the organization could avoid about ${currency} ${monthlyCost.toFixed(
    2
  )} per month and ${currency} ${annualCost.toFixed(2)} per year.`;
}

function computeSummary(servers) {
  const underutilizedServers = servers.filter(
    (server) => server.status.toLowerCase() === "underutilized"
  );
  const healthyServers = servers.length - underutilizedServers.length;
  return {
    servers_analyzed: servers.length,
    underutilized_servers: underutilizedServers.length,
    healthy_servers: healthyServers,
    potential_monthly_savings_by_currency: aggregateSavingsByCurrency(
      underutilizedServers,
      "monthly_savings_if_removed"
    ),
    potential_annual_savings_by_currency: aggregateSavingsByCurrency(
      underutilizedServers,
      "annual_savings_if_removed"
    ),
  };
}

function renderSummary(view) {
  const summary = view.summary;
  const underutilized = Number(summary.underutilized_servers ?? 0);
  const healthy = Number(summary.healthy_servers ?? 0);
  const total = Math.max(underutilized + healthy, 1);
  const monthlyTotals = summary.potential_monthly_savings_by_currency ?? {};
  const annualTotals = summary.potential_annual_savings_by_currency ?? {};
  const generatedAt = formatDate(state.report.generated_at);

  elements.thresholdValue.textContent = `${Number(
    state.report.threshold_percent ?? 0
  ).toFixed(1)}%`;
  elements.windowDays.textContent = `${view.windowDays} days`;
  elements.generatedAt.textContent = generatedAt;

  elements.underutilizedCount.textContent = String(underutilized);
  elements.healthyCount.textContent = String(healthy);
  elements.monthlySavings.textContent = formatSavingsBuckets(monthlyTotals);
  elements.annualSavings.textContent = formatSavingsBuckets(annualTotals);

  elements.distributionUnderutilized.style.width = `${
    (underutilized / total) * 100
  }%`;
  elements.distributionHealthy.style.width = `${(healthy / total) * 100}%`;

  const highestSavingsServer = [...view.servers]
    .filter((server) => typeof server.monthly_savings_if_removed === "number")
    .sort(
      (left, right) =>
        (right.monthly_savings_if_removed ?? 0) -
        (left.monthly_savings_if_removed ?? 0)
    )[0];

  const insightCards = [
    {
      label: "Servers analyzed",
      value: String(summary.servers_analyzed ?? view.servers.length),
    },
    {
      label: "Threshold",
      value: `${Number(state.report.threshold_percent ?? 0).toFixed(1)}%`,
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

function renderDateNotes(view) {
  if (!state.supportsDateFiltering) {
    elements.dateRangeNote.textContent =
      "This report does not include raw metric samples, so date changes are disabled.";
    return;
  }

  const available = `${formatDateLabel(
    state.availableStartDate
  )} to ${formatDateLabel(state.availableEndDate)}`;
  const selected = `${formatDateLabel(
    state.selectedStartDate
  )} to ${formatDateLabel(state.selectedEndDate)}`;
  const fullWindowSelected =
    state.selectedStartDate === state.availableStartDate &&
    state.selectedEndDate === state.availableEndDate;

  elements.dateRangeNote.textContent = fullWindowSelected
    ? `Available range: ${available}. Showing the full loaded window.`
    : `Available range: ${available}. Recalculating metrics for ${selected} (${view.windowDays} days).`;
}

function syncDateInputs() {
  elements.startDateInput.min = state.availableStartDate;
  elements.startDateInput.max = state.availableEndDate;
  elements.endDateInput.min = state.availableStartDate;
  elements.endDateInput.max = state.availableEndDate;
  elements.startDateInput.value = state.selectedStartDate;
  elements.endDateInput.value = state.selectedEndDate;

  const disabled = !state.supportsDateFiltering;
  elements.startDateInput.disabled = disabled;
  elements.endDateInput.disabled = disabled;
  elements.resetDatesButton.disabled = disabled;
}

function hasServerMetricSeries(report) {
  return (report.server_metrics ?? []).some((entry) =>
    Object.values(entry.metrics ?? {}).some(
      (metric) => Array.isArray(metric.points) && metric.points.length > 0
    )
  );
}

function getAvailableDateWindow(report) {
  const dates = [];
  for (const entry of report.server_metrics ?? []) {
    for (const metric of Object.values(entry.metrics ?? {})) {
      for (const point of metric.points ?? []) {
        const dateValue = toDateInputValue(point.timestamp);
        if (dateValue) {
          dates.push(dateValue);
        }
      }
    }
  }

  if (dates.length > 0) {
    dates.sort();
    return {
      start: dates[0],
      end: dates[dates.length - 1],
    };
  }

  const start = toDateInputValue(report.analysis_window?.start);
  const end = toDateInputValue(report.analysis_window?.end);
  if (start && end) {
    return { start, end };
  }

  const today = new Date().toISOString().slice(0, 10);
  return { start: today, end: today };
}

function normalizeDateWindow(start, end, min, max) {
  let normalizedStart = clampDateString(start, min, max);
  let normalizedEnd = clampDateString(end, min, max);
  if (normalizedStart > normalizedEnd) {
    [normalizedStart, normalizedEnd] = [normalizedEnd, normalizedStart];
  }
  return { start: normalizedStart, end: normalizedEnd };
}

function clampDateString(value, min, max) {
  if (!value) {
    return min;
  }
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

function filterPointsByDate(points, startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T23:59:59.999Z`);
  return points.filter((point) => {
    const timestamp = new Date(point.timestamp);
    return timestamp >= start && timestamp <= end;
  });
}

function aggregateSavingsByCurrency(servers, key) {
  return servers.reduce((totals, server) => {
    const amount = server[key];
    if (typeof amount !== "number") {
      return totals;
    }
    totals[server.currency] = (totals[server.currency] ?? 0) + amount;
    return totals;
  }, {});
}

function inclusiveDayDifference(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return Math.round((end - start) / 86400000) + 1;
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function uniqueStrings(values) {
  return [...new Set(values)];
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

function formatDateLabel(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00Z`);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

function toDateInputValue(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
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
