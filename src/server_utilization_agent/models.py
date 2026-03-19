from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, time, timedelta, timezone


@dataclass(frozen=True)
class TimeRange:
    start: datetime
    end: datetime

    @classmethod
    def last_days(cls, days: int) -> "TimeRange":
        if days < 1:
            raise ValueError("days must be at least 1")

        end = datetime.now(timezone.utc)
        start_date = (end - timedelta(days=days - 1)).date()
        start = datetime.combine(start_date, time.min, tzinfo=timezone.utc)
        return cls(start=start, end=end)

    @classmethod
    def from_dates(cls, start_date: date, end_date: date) -> "TimeRange":
        if end_date < start_date:
            raise ValueError("end_date must be on or after start_date")

        start = datetime.combine(start_date, time.min, tzinfo=timezone.utc)
        end = datetime.combine(end_date, time.max, tzinfo=timezone.utc)
        return cls(start=start, end=end)

    @classmethod
    def from_date_strings(cls, start_date: str, end_date: str) -> "TimeRange":
        return cls.from_dates(
            start_date=date.fromisoformat(start_date),
            end_date=date.fromisoformat(end_date),
        )

    @property
    def start_ms(self) -> int:
        return int(self.start.timestamp() * 1000)

    @property
    def end_ms(self) -> int:
        return int(self.end.timestamp() * 1000)

    @property
    def day_count(self) -> int:
        return (self.end.date() - self.start.date()).days + 1


@dataclass(frozen=True)
class MetricPoint:
    timestamp: datetime
    value_percent: float

    @property
    def timestamp_ms(self) -> int:
        return int(self.timestamp.timestamp() * 1000)


@dataclass(frozen=True)
class MetricSnapshot:
    name: str
    average_percent: float
    minimum_percent: float
    maximum_percent: float
    sample_count: int
    points: list[MetricPoint] = field(default_factory=list)

    @classmethod
    def from_values(cls, name: str, values: list[float]) -> "MetricSnapshot":
        if not values:
            raise ValueError(f"No values supplied for metric '{name}'")

        normalized_values = [float(value) for value in values]
        return cls(
            name=name,
            average_percent=sum(normalized_values) / len(normalized_values),
            minimum_percent=min(normalized_values),
            maximum_percent=max(normalized_values),
            sample_count=len(normalized_values),
        )

    @classmethod
    def from_points(cls, name: str, points: list[MetricPoint]) -> "MetricSnapshot":
        if not points:
            raise ValueError(f"No points supplied for metric '{name}'")

        values = [point.value_percent for point in points]
        return cls(
            name=name,
            average_percent=sum(values) / len(values),
            minimum_percent=min(values),
            maximum_percent=max(values),
            sample_count=len(values),
            points=sorted(points, key=lambda point: point.timestamp),
        )


@dataclass(frozen=True)
class ServerMetrics:
    server_id: str
    cpu: MetricSnapshot
    memory: MetricSnapshot
    extras: dict[str, MetricSnapshot] = field(default_factory=dict)


@dataclass(frozen=True)
class ServerCost:
    server_id: str
    monthly_cost: float | None
    currency: str
    source: str

    @property
    def annual_cost(self) -> float | None:
        if self.monthly_cost is None:
            return None
        return self.monthly_cost * 12


@dataclass(frozen=True)
class ServerAnalysis:
    server_id: str
    analysis_window_days: int
    avg_cpu: float
    avg_memory: float
    utilization_score: float
    status: str
    monthly_cost: float | None
    annual_cost: float | None
    monthly_savings_if_removed: float | None
    annual_savings_if_removed: float | None
    currency: str
    recommendation: str
    rationale: str
    caveats: list[str]

    @property
    def is_underutilized(self) -> bool:
        return self.status.lower() == "underutilized"


@dataclass(frozen=True)
class MetricsCollectionResult:
    server_metrics: list[ServerMetrics]
    missing_servers: list[str]
    warnings: list[str]


@dataclass(frozen=True)
class ReportArtifacts:
    markdown_path: str
    json_path: str


@dataclass(frozen=True)
class AgentRunResult:
    analyses: list[ServerAnalysis]
    missing_servers: list[str]
    warnings: list[str]
    report_artifacts: ReportArtifacts
