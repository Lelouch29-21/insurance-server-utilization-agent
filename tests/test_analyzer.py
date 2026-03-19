from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from server_utilization_agent.analyzer import UtilizationAnalyzer
from server_utilization_agent.models import MetricSnapshot, ServerCost, ServerMetrics


class UtilizationAnalyzerTest(unittest.TestCase):
    def test_underutilized_server_receives_savings_recommendation(self) -> None:
        analyzer = UtilizationAnalyzer(threshold_percent=40, analysis_window_days=30)
        metrics = [
            ServerMetrics(
                server_id="app-server-01",
                cpu=MetricSnapshot.from_values("cpu", [22, 23, 21]),
                memory=MetricSnapshot.from_values("memory", [31, 30, 32]),
            )
        ]
        costs = {
            "app-server-01": ServerCost(
                server_id="app-server-01",
                monthly_cost=180.0,
                currency="USD",
                source="csv",
            )
        }

        analysis = analyzer.analyze(metrics, costs)[0]

        self.assertEqual(analysis.status, "Underutilized")
        self.assertAlmostEqual(analysis.utilization_score, 31.0)
        self.assertAlmostEqual(analysis.monthly_savings_if_removed or 0, 180.0)
        self.assertIn("below the 40.0% threshold", analysis.rationale)

    def test_healthy_server_is_not_flagged_for_removal(self) -> None:
        analyzer = UtilizationAnalyzer(threshold_percent=40, analysis_window_days=30)
        metrics = [
            ServerMetrics(
                server_id="app-server-02",
                cpu=MetricSnapshot.from_values("cpu", [50, 52, 49]),
                memory=MetricSnapshot.from_values("memory", [44, 45, 43]),
            )
        ]
        costs = {
            "app-server-02": ServerCost(
                server_id="app-server-02",
                monthly_cost=180.0,
                currency="USD",
                source="csv",
            )
        }

        analysis = analyzer.analyze(metrics, costs)[0]

        self.assertEqual(analysis.status, "Healthy")
        self.assertEqual(analysis.recommendation, "Keep in service")
        self.assertAlmostEqual(analysis.monthly_savings_if_removed or 0, 0.0)


if __name__ == "__main__":
    unittest.main()
