from __future__ import annotations

import csv
from pathlib import Path

from server_utilization_agent.config import CostConfig
from server_utilization_agent.models import ServerCost


class CostCatalog:
    def __init__(self, config: CostConfig):
        self.config = config
        self._catalog = self._load_catalog()

    def _load_catalog(self) -> dict[str, ServerCost]:
        if self.config.source != "csv":
            raise ValueError("Only CSV cost sources are supported in the MVP")

        catalog: dict[str, ServerCost] = {}
        csv_path = self.config.csv_path
        if csv_path is None:
            return catalog

        if not Path(csv_path).exists():
            raise FileNotFoundError(f"Cost CSV not found: {csv_path}")

        with Path(csv_path).open(newline="") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                server_id = (row.get("server_id") or "").strip()
                if not server_id:
                    continue

                monthly_cost_raw = (row.get("monthly_cost") or "").strip()
                monthly_cost = float(monthly_cost_raw) if monthly_cost_raw else None
                currency = (row.get("currency") or self.config.default_currency).strip()
                catalog[server_id] = ServerCost(
                    server_id=server_id,
                    monthly_cost=monthly_cost,
                    currency=currency or self.config.default_currency,
                    source="csv",
                )
        return catalog

    def get_cost(self, server_id: str) -> ServerCost:
        cost = self._catalog.get(server_id)
        if cost is not None:
            return cost

        return ServerCost(
            server_id=server_id,
            monthly_cost=self.config.default_monthly_cost,
            currency=self.config.default_currency,
            source="default",
        )
