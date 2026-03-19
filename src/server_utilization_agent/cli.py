from __future__ import annotations

import argparse
import sys
from pathlib import Path

from server_utilization_agent.agent import ServerUtilizationAgent
from server_utilization_agent.config import load_config


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Analyze server utilization and identify underutilized servers."
    )
    parser.add_argument(
        "--config",
        required=True,
        help="Path to the JSON config file.",
    )
    parser.add_argument(
        "--servers",
        nargs="*",
        default=[],
        help="Server IDs to analyze.",
    )
    parser.add_argument(
        "--servers-file",
        help="Optional newline-delimited file of server IDs.",
    )
    parser.add_argument(
        "--output-dir",
        help="Optional output directory override.",
    )
    parser.add_argument(
        "--print-report",
        action="store_true",
        help="Print the generated Markdown report to stdout.",
    )
    return parser.parse_args()


def load_server_ids(args: argparse.Namespace) -> list[str]:
    server_ids: list[str] = []
    server_ids.extend(args.servers)

    if args.servers_file:
        lines = Path(args.servers_file).read_text().splitlines()
        server_ids.extend(line.strip() for line in lines if line.strip())

    deduplicated: list[str] = []
    seen: set[str] = set()
    for server_id in server_ids:
        if server_id not in seen:
            deduplicated.append(server_id)
            seen.add(server_id)
    return deduplicated


def main() -> int:
    args = parse_args()
    server_ids = load_server_ids(args)
    if not server_ids:
        print("No servers supplied. Use --servers or --servers-file.", file=sys.stderr)
        return 2

    config = load_config(args.config)
    agent = ServerUtilizationAgent(config)
    result = agent.run(server_ids=server_ids, output_dir=args.output_dir)

    print(f"Markdown report: {result.report_artifacts.markdown_path}")
    print(f"JSON report: {result.report_artifacts.json_path}")

    if result.missing_servers:
        print(f"Missing servers: {', '.join(result.missing_servers)}")
    if result.warnings:
        print("Warnings:")
        for warning in result.warnings:
            print(f"- {warning}")

    if args.print_report:
        print()
        print(Path(result.report_artifacts.markdown_path).read_text())

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
