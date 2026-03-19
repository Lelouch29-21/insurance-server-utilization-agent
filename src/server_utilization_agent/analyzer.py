from __future__ import annotations

from server_utilization_agent.models import ServerAnalysis, ServerCost, ServerMetrics


class UtilizationAnalyzer:
    def __init__(self, threshold_percent: float, analysis_window_days: int):
        self.threshold_percent = threshold_percent
        self.analysis_window_days = analysis_window_days

    def analyze(
        self,
        server_metrics: list[ServerMetrics],
        cost_lookup: dict[str, ServerCost],
    ) -> list[ServerAnalysis]:
        analyses: list[ServerAnalysis] = []

        for metrics in server_metrics:
            cost = cost_lookup[metrics.server_id]
            utilization_score = max(
                metrics.cpu.average_percent,
                metrics.memory.average_percent,
            )
            underutilized = utilization_score < self.threshold_percent

            if underutilized:
                monthly_savings = cost.monthly_cost
                annual_savings = cost.annual_cost
                recommendation = "Review for removal or consolidation"
                rationale = self._build_underutilized_rationale(
                    metrics.server_id,
                    utilization_score,
                    cost,
                )
            else:
                monthly_savings = 0.0 if cost.monthly_cost is not None else None
                annual_savings = 0.0 if cost.annual_cost is not None else None
                recommendation = "Keep in service"
                rationale = (
                    f"{metrics.server_id} is operating above the "
                    f"{self.threshold_percent:.1f}% threshold with a "
                    f"{utilization_score:.1f}% utilization score over the last "
                    f"{self.analysis_window_days} days."
                )

            analyses.append(
                ServerAnalysis(
                    server_id=metrics.server_id,
                    analysis_window_days=self.analysis_window_days,
                    avg_cpu=metrics.cpu.average_percent,
                    avg_memory=metrics.memory.average_percent,
                    utilization_score=utilization_score,
                    status="Underutilized" if underutilized else "Healthy",
                    monthly_cost=cost.monthly_cost,
                    annual_cost=cost.annual_cost,
                    monthly_savings_if_removed=monthly_savings,
                    annual_savings_if_removed=annual_savings,
                    currency=cost.currency,
                    recommendation=recommendation,
                    rationale=rationale,
                    caveats=[
                        "Average utilization may hide short peak demand windows.",
                        "The server may still support standby, failover, or critical workloads.",
                        "Confirm dependencies with application owners before removing the server.",
                    ],
                )
            )

        return sorted(analyses, key=lambda item: (not item.is_underutilized, item.server_id))

    def _build_underutilized_rationale(
        self,
        server_id: str,
        utilization_score: float,
        cost: ServerCost,
    ) -> str:
        if cost.monthly_cost is None or cost.annual_cost is None:
            return (
                f"{server_id} averaged {utilization_score:.1f}% utilization over the "
                f"last {self.analysis_window_days} days, which is below the "
                f"{self.threshold_percent:.1f}% threshold. The server should be reviewed "
                "for removal or consolidation, but no monthly cost was supplied, so savings "
                "must be estimated separately."
            )

        return (
            f"{server_id} averaged {utilization_score:.1f}% utilization over the last "
            f"{self.analysis_window_days} days, which is below the "
            f"{self.threshold_percent:.1f}% threshold. If it can be safely removed or "
            f"consolidated, the organization could avoid about {cost.currency} "
            f"{cost.monthly_cost:,.2f} per month and {cost.currency} "
            f"{cost.annual_cost:,.2f} per year."
        )
