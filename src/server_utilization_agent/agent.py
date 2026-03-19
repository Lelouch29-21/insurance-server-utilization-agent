from __future__ import annotations

from pathlib import Path

from server_utilization_agent.analyzer import UtilizationAnalyzer
from server_utilization_agent.config import AppConfig
from server_utilization_agent.costs import CostCatalog
from server_utilization_agent.grafana import build_metrics_provider
from server_utilization_agent.models import AgentRunResult, TimeRange
from server_utilization_agent.reporter import ReportWriter


class ServerUtilizationAgent:
    def __init__(self, config: AppConfig):
        self.config = config
        self.metrics_provider = build_metrics_provider(config.grafana)
        self.cost_catalog = CostCatalog(config.costs)
        self.analyzer = UtilizationAnalyzer(
            threshold_percent=config.threshold_percent,
            analysis_window_days=config.analysis_window_days,
        )
        self.report_writer = ReportWriter(
            threshold_percent=config.threshold_percent,
            analysis_window_days=config.analysis_window_days,
        )

    def run(
        self,
        server_ids: list[str],
        output_dir: str | Path | None = None,
        time_range: TimeRange | None = None,
    ) -> AgentRunResult:
        effective_time_range = time_range or TimeRange.last_days(
            self.config.analysis_window_days
        )
        self.analyzer.analysis_window_days = effective_time_range.day_count
        self.report_writer.analysis_window_days = effective_time_range.day_count
        metrics_result = self.metrics_provider.fetch_server_metrics(
            server_ids,
            effective_time_range,
        )

        cost_lookup = {
            server_id: self.cost_catalog.get_cost(server_id)
            for server_id in server_ids
        }
        analyses = self.analyzer.analyze(metrics_result.server_metrics, cost_lookup)

        report_output_dir = (
            Path(output_dir).resolve()
            if output_dir is not None
            else self.config.reporting.output_dir
        )
        artifacts = self.report_writer.write(
            analyses=analyses,
            server_metrics=metrics_result.server_metrics,
            missing_servers=metrics_result.missing_servers,
            warnings=metrics_result.warnings,
            time_range=effective_time_range,
            output_dir=report_output_dir,
        )

        return AgentRunResult(
            analyses=analyses,
            missing_servers=metrics_result.missing_servers,
            warnings=metrics_result.warnings,
            report_artifacts=artifacts,
        )
