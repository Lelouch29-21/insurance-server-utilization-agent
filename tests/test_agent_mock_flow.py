from __future__ import annotations

import json
import sys
import tempfile
from datetime import date
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from server_utilization_agent.agent import ServerUtilizationAgent
from server_utilization_agent.config import load_config
from server_utilization_agent.models import TimeRange


class AgentMockFlowTest(unittest.TestCase):
    def test_mock_run_creates_reports_and_flags_underutilized_servers(self) -> None:
        config = load_config(ROOT / "configs" / "example-config.mock.json")
        agent = ServerUtilizationAgent(config)

        with tempfile.TemporaryDirectory() as temp_dir:
            result = agent.run(
                server_ids=["app-server-01", "app-server-02", "batch-server-03"],
                output_dir=temp_dir,
            )

            self.assertEqual(len(result.analyses), 3)
            underutilized_servers = [
                item.server_id for item in result.analyses if item.is_underutilized
            ]
            self.assertEqual(underutilized_servers, ["app-server-01", "batch-server-03"])

            markdown_path = Path(result.report_artifacts.markdown_path)
            json_path = Path(result.report_artifacts.json_path)
            self.assertTrue(markdown_path.exists())
            self.assertTrue(json_path.exists())

            markdown = markdown_path.read_text()
            report_payload = json.loads(json_path.read_text())

            self.assertIn("Server Utilization Report", markdown)
            self.assertEqual(report_payload["summary"]["underutilized_servers"], 2)
            self.assertEqual(len(report_payload["server_metrics"]), 3)
            self.assertEqual(
                len(report_payload["server_metrics"][0]["metrics"]["cpu"]["points"]),
                6,
            )

    def test_custom_date_range_is_reflected_in_report_payload(self) -> None:
        config = load_config(ROOT / "configs" / "example-config.mock.json")
        agent = ServerUtilizationAgent(config)
        time_range = TimeRange.from_dates(
            start_date=date(2026, 1, 1),
            end_date=date(2026, 1, 15),
        )

        with tempfile.TemporaryDirectory() as temp_dir:
            result = agent.run(
                server_ids=["app-server-01"],
                output_dir=temp_dir,
                time_range=time_range,
            )

            report_payload = json.loads(
                Path(result.report_artifacts.json_path).read_text()
            )

            self.assertEqual(report_payload["analysis_window"]["days"], 15)
            self.assertEqual(
                report_payload["analysis_window"]["start"],
                "2026-01-01T00:00:00+00:00",
            )
            self.assertEqual(
                report_payload["analysis_window"]["end"],
                "2026-01-15T23:59:59.999999+00:00",
            )


if __name__ == "__main__":
    unittest.main()
