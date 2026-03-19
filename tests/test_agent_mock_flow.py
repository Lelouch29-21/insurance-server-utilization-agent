from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from server_utilization_agent.agent import ServerUtilizationAgent
from server_utilization_agent.config import load_config


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


if __name__ == "__main__":
    unittest.main()
