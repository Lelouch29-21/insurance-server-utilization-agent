from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path


def _resolve_path(base_dir: Path, raw_path: str | None) -> Path | None:
    if not raw_path:
        return None

    path = Path(raw_path)
    if path.is_absolute():
        return path
    return (base_dir / path).resolve()


@dataclass(frozen=True)
class MetricQueryConfig:
    ref_id: str
    expr_template: str
    legend_format: str = "__auto"
    interval_ms: int = 300000
    max_data_points: int = 720


@dataclass(frozen=True)
class GrafanaConfig:
    mode: str
    base_url: str | None = None
    api_token_env: str = "GRAFANA_API_TOKEN"
    datasource_uid: str | None = None
    datasource_type: str = "prometheus"
    mock_data_path: Path | None = None
    metric_queries: dict[str, MetricQueryConfig] = field(default_factory=dict)


@dataclass(frozen=True)
class CostConfig:
    source: str
    csv_path: Path | None = None
    default_currency: str = "USD"
    default_monthly_cost: float | None = None


@dataclass(frozen=True)
class ReportingConfig:
    output_dir: Path


@dataclass(frozen=True)
class AppConfig:
    threshold_percent: float
    analysis_window_days: int
    grafana: GrafanaConfig
    costs: CostConfig
    reporting: ReportingConfig


def load_config(config_path: str | Path) -> AppConfig:
    path = Path(config_path).resolve()
    base_dir = path.parent
    raw = json.loads(path.read_text())

    grafana_raw = raw.get("grafana", {})
    metric_queries_raw = grafana_raw.get("metric_queries", {})
    metric_queries = {
        name: MetricQueryConfig(
            ref_id=value.get("ref_id", name[:1].upper()),
            expr_template=value["expr_template"],
            legend_format=value.get("legend_format", "__auto"),
            interval_ms=int(value.get("interval_ms", 300000)),
            max_data_points=int(value.get("max_data_points", 720)),
        )
        for name, value in metric_queries_raw.items()
    }

    grafana_config = GrafanaConfig(
        mode=grafana_raw.get("mode", "mock"),
        base_url=grafana_raw.get("base_url"),
        api_token_env=grafana_raw.get("api_token_env", "GRAFANA_API_TOKEN"),
        datasource_uid=grafana_raw.get("datasource_uid"),
        datasource_type=grafana_raw.get("datasource_type", "prometheus"),
        mock_data_path=_resolve_path(base_dir, grafana_raw.get("mock_data_path")),
        metric_queries=metric_queries,
    )

    costs_raw = raw.get("costs", {})
    cost_config = CostConfig(
        source=costs_raw.get("source", "csv"),
        csv_path=_resolve_path(base_dir, costs_raw.get("csv_path")),
        default_currency=costs_raw.get("default_currency", "USD"),
        default_monthly_cost=costs_raw.get("default_monthly_cost"),
    )

    reporting_raw = raw.get("reporting", {})
    output_dir = _resolve_path(base_dir, reporting_raw.get("output_dir", "outputs"))
    if output_dir is None:
        raise ValueError("Reporting output directory must be defined")

    config = AppConfig(
        threshold_percent=float(raw.get("threshold_percent", 40)),
        analysis_window_days=int(raw.get("analysis_window_days", 30)),
        grafana=grafana_config,
        costs=cost_config,
        reporting=ReportingConfig(output_dir=output_dir),
    )

    _validate_config(config)
    return config


def _validate_config(config: AppConfig) -> None:
    if config.grafana.mode == "mock":
        if config.grafana.mock_data_path is None:
            raise ValueError("Mock mode requires grafana.mock_data_path")
        return

    if config.grafana.mode != "grafana_prometheus":
        raise ValueError(
            "grafana.mode must be either 'mock' or 'grafana_prometheus'"
        )

    if not config.grafana.base_url:
        raise ValueError("grafana.base_url is required for grafana_prometheus mode")
    if not config.grafana.datasource_uid:
        raise ValueError(
            "grafana.datasource_uid is required for grafana_prometheus mode"
        )

    missing_queries = {"cpu", "memory"} - set(config.grafana.metric_queries.keys())
    if missing_queries:
        raise ValueError(
            "grafana.metric_queries must define cpu and memory queries; "
            f"missing: {', '.join(sorted(missing_queries))}"
        )
