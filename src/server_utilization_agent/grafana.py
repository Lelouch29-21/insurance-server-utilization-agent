from __future__ import annotations

import json
import math
import os
from pathlib import Path
from string import Template
from urllib import error, request

from server_utilization_agent.config import GrafanaConfig, MetricQueryConfig
from server_utilization_agent.models import (
    MetricSnapshot,
    MetricsCollectionResult,
    ServerMetrics,
    TimeRange,
)


class BaseMetricsProvider:
    def fetch_server_metrics(
        self,
        server_ids: list[str],
        time_range: TimeRange,
    ) -> MetricsCollectionResult:
        raise NotImplementedError


class MockMetricsProvider(BaseMetricsProvider):
    def __init__(self, mock_data_path: Path):
        raw = json.loads(mock_data_path.read_text())
        self.mock_data = raw.get("servers", {})

    def fetch_server_metrics(
        self,
        server_ids: list[str],
        time_range: TimeRange,
    ) -> MetricsCollectionResult:
        del time_range

        metrics: list[ServerMetrics] = []
        missing_servers: list[str] = []
        warnings: list[str] = []

        for server_id in server_ids:
            raw_metrics = self.mock_data.get(server_id)
            if raw_metrics is None:
                missing_servers.append(server_id)
                continue

            try:
                cpu_snapshot = MetricSnapshot.from_values("cpu", raw_metrics["cpu"])
                memory_snapshot = MetricSnapshot.from_values(
                    "memory", raw_metrics["memory"]
                )
                extra_snapshots = {
                    name: MetricSnapshot.from_values(name, values)
                    for name, values in raw_metrics.items()
                    if name not in {"cpu", "memory"}
                }
            except KeyError as exc:
                warnings.append(
                    f"Server '{server_id}' is missing required mock metric '{exc.args[0]}'"
                )
                continue

            metrics.append(
                ServerMetrics(
                    server_id=server_id,
                    cpu=cpu_snapshot,
                    memory=memory_snapshot,
                    extras=extra_snapshots,
                )
            )

        return MetricsCollectionResult(
            server_metrics=metrics,
            missing_servers=missing_servers,
            warnings=warnings,
        )


class GrafanaPrometheusProvider(BaseMetricsProvider):
    def __init__(self, config: GrafanaConfig):
        self.config = config

    def fetch_server_metrics(
        self,
        server_ids: list[str],
        time_range: TimeRange,
    ) -> MetricsCollectionResult:
        metrics: list[ServerMetrics] = []
        missing_servers: list[str] = []
        warnings: list[str] = []

        for server_id in server_ids:
            try:
                snapshots = {
                    metric_name: self._query_metric(
                        server_id=server_id,
                        metric_name=metric_name,
                        query_config=query_config,
                        time_range=time_range,
                    )
                    for metric_name, query_config in self.config.metric_queries.items()
                }
            except MissingMetricDataError:
                missing_servers.append(server_id)
                continue
            except RuntimeError as exc:
                warnings.append(str(exc))
                continue

            cpu_snapshot = snapshots.pop("cpu")
            memory_snapshot = snapshots.pop("memory")
            metrics.append(
                ServerMetrics(
                    server_id=server_id,
                    cpu=cpu_snapshot,
                    memory=memory_snapshot,
                    extras=snapshots,
                )
            )

        return MetricsCollectionResult(
            server_metrics=metrics,
            missing_servers=missing_servers,
            warnings=warnings,
        )

    def _query_metric(
        self,
        server_id: str,
        metric_name: str,
        query_config: MetricQueryConfig,
        time_range: TimeRange,
    ) -> MetricSnapshot:
        base_url = self.config.base_url.rstrip("/")
        token = os.environ.get(self.config.api_token_env)
        if not token:
            raise RuntimeError(
                f"Environment variable '{self.config.api_token_env}' is required for Grafana access"
            )

        expr = Template(query_config.expr_template).safe_substitute(
            server=server_id,
            window=f"{(time_range.end - time_range.start).days}d",
        )
        payload = {
            "from": str(time_range.start_ms),
            "to": str(time_range.end_ms),
            "queries": [
                {
                    "refId": query_config.ref_id,
                    "datasource": {
                        "uid": self.config.datasource_uid,
                        "type": self.config.datasource_type,
                    },
                    "expr": expr,
                    "format": "time_series",
                    "instant": False,
                    "intervalMs": query_config.interval_ms,
                    "legendFormat": query_config.legend_format,
                    "maxDataPoints": query_config.max_data_points,
                    "range": True,
                }
            ],
        }

        response = self._post_json(
            url=f"{base_url}/api/ds/query",
            payload=payload,
            token=token,
        )
        values = self._extract_numeric_values(response, query_config.ref_id)
        if not values:
            raise MissingMetricDataError(
                f"No {metric_name} data returned for server '{server_id}'"
            )

        return MetricSnapshot.from_values(metric_name, values)

    def _post_json(self, url: str, payload: dict, token: str) -> dict:
        body = json.dumps(payload).encode("utf-8")
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        req = request.Request(url=url, data=body, headers=headers, method="POST")

        try:
            with request.urlopen(req, timeout=60) as response:
                return json.loads(response.read().decode("utf-8"))
        except error.HTTPError as exc:
            error_body = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(
                f"Grafana query failed with HTTP {exc.code}: {error_body}"
            ) from exc
        except error.URLError as exc:
            raise RuntimeError(f"Grafana query failed: {exc.reason}") from exc

    def _extract_numeric_values(self, response: dict, ref_id: str) -> list[float]:
        result = response.get("results", {}).get(ref_id, {})
        if result.get("error"):
            raise RuntimeError(f"Grafana returned an error for refId {ref_id}: {result['error']}")

        values: list[float] = []
        for frame in result.get("frames", []):
            schema_fields = frame.get("schema", {}).get("fields", [])
            columns = frame.get("data", {}).get("values", [])
            for field, column in zip(schema_fields, columns):
                field_type = (field or {}).get("type")
                if field_type != "number":
                    continue
                values.extend(self._normalize_numeric_column(column))
        return values

    @staticmethod
    def _normalize_numeric_column(column: list[object]) -> list[float]:
        normalized: list[float] = []
        for value in column:
            if value is None:
                continue
            numeric = float(value)
            if math.isnan(numeric):
                continue
            normalized.append(numeric)
        return normalized


class MissingMetricDataError(RuntimeError):
    """Raised when a server has no data for a required metric."""


def build_metrics_provider(config: GrafanaConfig) -> BaseMetricsProvider:
    if config.mode == "mock":
        if config.mock_data_path is None:
            raise ValueError("Mock mode requires a mock_data_path")
        return MockMetricsProvider(config.mock_data_path)
    return GrafanaPrometheusProvider(config)
