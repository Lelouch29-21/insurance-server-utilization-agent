from __future__ import annotations

import json
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

from server_utilization_agent.models import (
    MetricSnapshot,
    ReportArtifacts,
    ServerAnalysis,
    ServerMetrics,
    TimeRange,
)


class ReportWriter:
    def __init__(self, threshold_percent: float, analysis_window_days: int):
        self.threshold_percent = threshold_percent
        self.analysis_window_days = analysis_window_days

    def write(
        self,
        analyses: list[ServerAnalysis],
        server_metrics: list[ServerMetrics],
        missing_servers: list[str],
        warnings: list[str],
        time_range: TimeRange,
        output_dir: Path,
    ) -> ReportArtifacts:
        output_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

        markdown_path = output_dir / f"utilization-report-{timestamp}.md"
        json_path = output_dir / f"utilization-report-{timestamp}.json"

        markdown_path.write_text(
            self._render_markdown(analyses, missing_servers, warnings, time_range)
        )
        json_path.write_text(
            json.dumps(
                self._render_json_payload(
                    analyses,
                    server_metrics,
                    missing_servers,
                    warnings,
                    time_range,
                ),
                indent=2,
            )
        )

        return ReportArtifacts(
            markdown_path=str(markdown_path),
            json_path=str(json_path),
        )

    def _render_markdown(
        self,
        analyses: list[ServerAnalysis],
        missing_servers: list[str],
        warnings: list[str],
        time_range: TimeRange,
    ) -> str:
        underutilized = [item for item in analyses if item.is_underutilized]
        monthly_savings = self._aggregate_savings_by_currency(
            underutilized,
            monthly=True,
        )
        annual_savings = self._aggregate_savings_by_currency(
            underutilized,
            monthly=False,
        )

        lines = [
            "# Server Utilization Report",
            "",
            f"- Generated at: {datetime.now(timezone.utc).isoformat()}",
            f"- Analysis window: {time_range.start.date()} to {time_range.end.date()}",
            f"- Underutilization threshold: {self.threshold_percent:.1f}%",
            "",
            "## Summary",
            "",
            f"- Servers analyzed: {len(analyses)}",
            f"- Underutilized servers: {len(underutilized)}",
            f"- Healthy servers: {len(analyses) - len(underutilized)}",
            f"- Potential monthly savings: {self._format_savings_buckets(monthly_savings)}",
            f"- Potential annual savings: {self._format_savings_buckets(annual_savings)}",
            "",
            "## Server Summary",
            "",
            "| Server | Avg CPU | Avg Memory | Utilization Score | Status | Monthly Cost | Annual Cost | Savings if Removed |",
            "|---|---:|---:|---:|---|---:|---:|---|",
        ]

        if analyses:
            for item in analyses:
                savings = (
                    f"{self._format_currency(item.monthly_savings_if_removed, item.currency)}/month, "
                    f"{self._format_currency(item.annual_savings_if_removed, item.currency)}/year"
                    if item.is_underutilized and item.monthly_savings_if_removed is not None
                    else ("Requires cost data" if item.is_underutilized else "Not recommended")
                )
                lines.append(
                    "| {server} | {cpu:.1f}% | {memory:.1f}% | {score:.1f}% | {status} | {monthly_cost} | {annual_cost} | {savings} |".format(
                        server=item.server_id,
                        cpu=item.avg_cpu,
                        memory=item.avg_memory,
                        score=item.utilization_score,
                        status="**Underutilized**" if item.is_underutilized else "Healthy",
                        monthly_cost=self._format_currency(item.monthly_cost, item.currency),
                        annual_cost=self._format_currency(item.annual_cost, item.currency),
                        savings=savings,
                    )
                )
        else:
            lines.append("| No servers analyzed | - | - | - | - | - | - | - |")

        lines.extend(["", "## Recommendations", ""])
        if analyses:
            for item in analyses:
                lines.append(f"### {item.server_id}")
                lines.append("")
                lines.append(f"- Status: {item.status}")
                lines.append(f"- Recommendation: {item.recommendation}")
                lines.append(f"- Rationale: {item.rationale}")
                lines.append("- Caveats:")
                for caveat in item.caveats:
                    lines.append(f"  - {caveat}")
                lines.append("")
        else:
            lines.extend(["No server results were available.", ""])

        if missing_servers:
            lines.extend(["## Missing Servers", ""])
            for server_id in missing_servers:
                lines.append(f"- {server_id}")
            lines.append("")

        if warnings:
            lines.extend(["## Warnings", ""])
            for warning in warnings:
                lines.append(f"- {warning}")
            lines.append("")

        return "\n".join(lines).rstrip() + "\n"

    def _render_json_payload(
        self,
        analyses: list[ServerAnalysis],
        server_metrics: list[ServerMetrics],
        missing_servers: list[str],
        warnings: list[str],
        time_range: TimeRange,
    ) -> dict:
        underutilized = [item for item in analyses if item.is_underutilized]
        return {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "analysis_window": {
                "start": time_range.start.isoformat(),
                "end": time_range.end.isoformat(),
                "days": self.analysis_window_days,
            },
            "threshold_percent": self.threshold_percent,
            "summary": {
                "servers_analyzed": len(analyses),
                "underutilized_servers": len(underutilized),
                "healthy_servers": len(analyses) - len(underutilized),
                "potential_monthly_savings_by_currency": self._aggregate_savings_by_currency(
                    underutilized,
                    monthly=True,
                ),
                "potential_annual_savings_by_currency": self._aggregate_savings_by_currency(
                    underutilized,
                    monthly=False,
                ),
            },
            "servers": [asdict(item) for item in analyses],
            "server_metrics": [self._serialize_server_metrics(item) for item in server_metrics],
            "missing_servers": missing_servers,
            "warnings": warnings,
        }

    @staticmethod
    def _format_currency(amount: float | None, currency: str) -> str:
        if amount is None:
            return "N/A"
        return f"{currency} {amount:,.2f}"

    @staticmethod
    def _aggregate_savings_by_currency(
        analyses: list[ServerAnalysis],
        monthly: bool,
    ) -> dict[str, float]:
        totals: dict[str, float] = {}
        for item in analyses:
            amount = (
                item.monthly_savings_if_removed
                if monthly
                else item.annual_savings_if_removed
            )
            if amount is None:
                continue
            totals[item.currency] = totals.get(item.currency, 0.0) + amount
        return totals

    def _format_savings_buckets(self, totals: dict[str, float]) -> str:
        if not totals:
            return "N/A"

        return ", ".join(
            self._format_currency(amount, currency)
            for currency, amount in sorted(totals.items())
        )

    def _serialize_server_metrics(self, metrics: ServerMetrics) -> dict:
        return {
            "server_id": metrics.server_id,
            "metrics": {
                "cpu": self._serialize_metric_snapshot(metrics.cpu),
                "memory": self._serialize_metric_snapshot(metrics.memory),
                **{
                    name: self._serialize_metric_snapshot(snapshot)
                    for name, snapshot in metrics.extras.items()
                },
            },
        }

    @staticmethod
    def _serialize_metric_snapshot(snapshot: MetricSnapshot) -> dict:
        return {
            "average_percent": snapshot.average_percent,
            "minimum_percent": snapshot.minimum_percent,
            "maximum_percent": snapshot.maximum_percent,
            "sample_count": snapshot.sample_count,
            "points": [
                {
                    "timestamp": point.timestamp.isoformat(),
                    "value_percent": point.value_percent,
                }
                for point in snapshot.points
            ],
        }
