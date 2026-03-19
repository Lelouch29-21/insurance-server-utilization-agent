# PRD: AI Agent for Server Utilization and Cost Optimization

## Document Control
- Status: Draft
- Date: 2026-03-19
- Prepared for: Infrastructure / FinOps / Operations
- Prepared by: Codex

## 1. Overview
Build an AI agent that connects to the company's Grafana instance, retrieves utilization statistics for a provided list of servers, and generates a utilization report. The agent must identify underutilized servers and estimate the cost benefit of removing them.

For this PRD, a server is considered underutilized when its utilization score is below `40%`.

## 2. Problem Statement
Infrastructure teams can see server metrics in Grafana, but identifying low-value servers across a fleet is still manual and time-consuming. This leads to:
- Missed opportunities to remove or consolidate underutilized servers
- Unclear financial impact of keeping low-usage servers online
- Slow reporting for leadership, operations, and FinOps teams

The business needs an AI-driven assistant that can quickly analyze selected servers, flag underutilization, and explain the potential savings from decommissioning them.

## 3. Goals
- Connect securely to Grafana and retrieve utilization metrics for user-specified servers
- Generate a clear utilization report for all requested servers
- Highlight servers with utilization below `40%`
- Estimate monthly and annual cost savings from removing underutilized servers
- Present findings in business-friendly language that supports decision-making

## 4. Non-Goals
- Automatic server shutdown or deletion in MVP
- Capacity rebalancing or workload migration orchestration
- Real-time alerting in MVP
- Deep root-cause analysis of why a server is underutilized

## 5. Target Users
- Infrastructure Operations team
- Cloud / Platform Engineering team
- FinOps team
- Engineering managers and leadership reviewing optimization opportunities

## 6. Key User Stories
- As an operations engineer, I want to provide a list of servers and get a utilization summary so I can quickly identify waste.
- As a FinOps analyst, I want estimated savings for each underutilized server so I can prioritize cost-reduction actions.
- As a manager, I want a concise report with clear recommendations so I can review optimization opportunities without opening Grafana manually.

## 7. Product Scope
The AI agent will:
- Accept a list of server names, hostnames, instance IDs, or tags
- Query utilization data from Grafana for those servers
- Calculate utilization for a selected analysis window
- Mark servers below `40%` utilization as underutilized
- Estimate the cost benefit of removing those servers
- Return a human-readable report and structured output

## 8. Assumptions
- Grafana is the source of truth for server performance metrics
- Grafana access is available through API, dashboard queries, or underlying datasource queries
- Cost data is available either through a cloud billing source / CMDB / asset inventory or through a manually maintained per-server monthly cost table
- MVP will analyze a configurable time window, with `30 days` as the default
- MVP default utilization score will be based on `max(avg CPU utilization, avg memory utilization)` to avoid marking memory-heavy or CPU-heavy servers as removable too aggressively

## 9. Functional Requirements

### 9.1 Authentication and Access
- The system must connect securely to Grafana using a service account, API token, or approved SSO-backed integration.
- The system must support read-only access to dashboards, panels, or datasource queries.
- The system must log access attempts and query activity for auditability.

### 9.2 Server Selection
- The user must be able to submit a list of servers to analyze.
- The agent should support identifiers such as hostname, instance ID, VM name, or agreed tags.
- The agent should validate which requested servers are found in Grafana data and report any missing entries.

### 9.3 Metric Retrieval
- The system must fetch relevant metrics for each server over the chosen time window.
- MVP metrics should include CPU utilization and memory utilization.
- Optional secondary metrics, if available, should include disk usage, network throughput, and disk I/O.
- The system should support different Grafana-backed datasources as long as the metric queries are mapped during setup.

### 9.4 Utilization Calculation
- The agent must calculate a utilization score for each server.
- MVP default formula: `Utilization Score = max(avg CPU %, avg Memory %)`
- A server must be marked `Underutilized` when `Utilization Score < 40%`.
- The threshold should be configurable, but default to `40%`.

### 9.5 Cost Benefit Estimation
- The system must estimate cost savings for each underutilized server.
- MVP cost outputs should include estimated monthly savings and estimated annual savings.
- The report should clearly label savings as estimates.
- If migration, redundancy, or shared dependency information is unavailable, the agent must include a caution that removal requires dependency validation.

### 9.6 Reporting
- The system must generate a report containing the following for each server: server identifier, analysis window, average CPU utilization, average memory utilization, utilization score, utilization status, estimated monthly cost, estimated annual cost, estimated savings if removed, and recommendation with rationale.
- The report must clearly highlight all servers below `40%`.
- The report should provide both a summary table for all analyzed servers and a narrative section with observations and recommendations.

### 9.7 Explainability
- For every underutilized server, the agent must explain why it was flagged.
- The agent must describe the cost impact in plain business language.
- The agent should include caveats such as peak usage not being reflected in averages, the possibility of critical or standby workloads, and the need to confirm removal with application owners.

## 10. Output Example
The report should look conceptually like this:

| Server | Avg CPU | Avg Memory | Utilization Score | Status | Monthly Cost | Annual Cost | Savings if Removed |
|---|---:|---:|---:|---|---:|---:|---:|
| app-server-01 | 22% | 31% | 31% | Underutilized | $180 | $2,160 | $180/month, $2,160/year |
| app-server-02 | 51% | 44% | 51% | Healthy | $180 | $2,160 | Not recommended |

Narrative example:
"`app-server-01` is underutilized because its 30-day utilization score is 31%, below the 40% threshold. If this server is no longer required or can be consolidated into another host, the organization could avoid approximately $180 per month ($2,160 annually), subject to dependency review."

## 11. Recommended System Design

### 11.1 Components
- User interface layer: chat interface, internal web app, Slack bot, or command-line entry point
- AI orchestration layer: accepts the user request, plans the analysis, calls data connectors, and generates the report
- Grafana connector: authenticates and retrieves relevant server metrics
- Cost connector: pulls monthly infrastructure cost per server from billing, CMDB, or configuration
- Analysis engine: computes utilization score, classifies servers, and estimates savings
- Report generator: produces human-readable and machine-readable output

### 11.2 Data Flow
1. User provides a list of servers and optional time window.
2. Agent validates identifiers and fetches metrics from Grafana.
3. Agent fetches cost information for those servers.
4. Analysis engine computes utilization and identifies servers below `40%`.
5. Agent generates report with recommendations and cost-saving estimates.

## 12. Non-Functional Requirements
- Security: credentials must be stored securely and rotated per company policy
- Reliability: report generation should succeed for partial datasets and surface errors per server
- Performance: report for up to 200 servers should complete within 2 minutes under normal conditions
- Auditability: queries, classifications, and savings calculations should be traceable
- Configurability: thresholds, time windows, metric mappings, and cost inputs should be configurable

## 13. Success Metrics
- Reduction in manual effort required to prepare utilization reports
- Number of underutilized servers identified per month
- Estimated infrastructure savings surfaced by the tool
- Percentage of flagged servers that are later confirmed as valid optimization candidates
- User satisfaction from operations and FinOps stakeholders

## 14. Risks and Constraints
- Grafana may not expose all required metrics in a normalized format
- Average utilization alone may hide bursty or business-critical workloads
- Cost data may be incomplete or only available at group level rather than server level
- Servers used for failover, compliance, or reserved capacity may appear underutilized but still be necessary

## 15. Open Questions
- What exact Grafana datasource(s) back the server metrics: Prometheus, CloudWatch, Datadog, or another source?
- Should utilization be based only on CPU and memory, or should disk and network also affect the score?
- What is the source of cost truth for each server?
- Should the agent report only direct infrastructure savings, or also software licensing savings?
- What output channels are required for MVP: chat, PDF, CSV, email, or dashboard widget?
- Is the recommendation expected to say "remove", "consolidate", or "review for removal"?

## 16. MVP Recommendation
For MVP, build a read-only agent that:
- Accepts a server list
- Reads `30-day` CPU and memory metrics from Grafana
- Uses `max(avg CPU %, avg Memory %)` as the utilization score
- Flags servers below `40%`
- Pulls monthly server cost from a simple configuration table or billing export
- Returns a report with summary table, explanation, and monthly / annual savings estimate

This approach gives the team a practical first version quickly while keeping the door open for richer optimization logic in later phases.
