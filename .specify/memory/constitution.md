<!--
Sync Impact Report
- Version change: 3.2.0 -> 3.3.0
- Modified principles:
  - V. Analyzer Integration via Mapping Layer
  - XI. Analyzer Result Ingestion Pipeline
  - XX. Advanced Analyzer Result Validation
  - XXVIII. Device Integration Resilience
- Added sections:
  - None
- Removed sections:
  - None
- Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ updated
  - .specify/templates/spec-template.md: ✅ updated
  - .specify/templates/tasks-template.md: ✅ updated
  - .specify/templates/commands/*.md: ⚠ pending (directory not present)
  - README.md: ⚠ pending (file not present)
  - docs/quickstart.md: ⚠ pending (file not present)
  - AGENTS.md / copilot-instructions.md: ⚠ pending (files not present)
- Deferred items:
  - None
-->

# IT Course Constitution

## Core Principles

### I. LIS Workflow Integrity Is Mandatory
All product behavior MUST preserve the laboratory workflow in this exact order:
patient registration -> test ordering -> specimen collection -> specimen receipt -> sample
analysis -> result entry -> result approval -> result printing -> payment settlement.
New features MUST NOT bypass or reorder mandatory control points in this chain.
Rationale: the workflow is the core medical process and protects clinical safety.

### II. Role-Based Access Control Is Mandatory
Every feature MUST enforce role-based access control for at least these actors:
reception staff, laboratory technicians, laboratory doctors, and system administrators.
Actions unavailable to a role MUST be blocked in both UI and backend resolvers/services.
Rationale: medical data and laboratory operations require strict duty separation.

### III. Permission String Contract (T X S V I E)
All modules MUST integrate with the 6-position permission model:
T (Create), X (Delete), S (Update), V (View), I (Print), E (Export).
Permission evaluation MUST be explicit and testable for all protected actions.
Any new module lacking this permission mapping MUST NOT be approved.
Rationale: a shared permission contract prevents inconsistent authorization behavior.

### IV. Oracle Monthly Partitioning and Data Access Governance
Transactional data MUST follow monthly schema partitioning using `hsoftMMYY`
(e.g., `hsoft0325`). Features requiring date ranges MUST support cross-month queries.
Direct database access is prohibited. Data access MUST use the centralized data-access
layer equivalent to AccessData.ts patterns. Critical business writes and validations MUST
be implemented through Oracle stored procedures in `pkg_xetnghiem`.
Rationale: partition-aware queries and controlled access are required for performance,
consistency, and maintainability.

### V. Analyzer Integration via Mapping Layer
Analyzer integration is an optional platform capability. When analyzer integration is
enabled, A15, Biolis, CA270, BS200, DMSPRO, drAutotest, and future devices MUST pass
through a mapping layer that translates device parameters to internal LIS test codes.
Systems configured for manual result entry mode MAY operate without analyzer integration.
Integration design MUST allow onboarding new devices without changing core domain workflow
code.
Rationale: loose coupling supports future device integration without making it mandatory
for every LIS deployment.

### VI. Result Approval, Auditability, and Regulatory Traceability
Laboratory results MUST be approved by a laboratory doctor before print, export, or
external transmission (including HL7/XML/API/email channels). The system MUST persist
approval actor, approval timestamp, and result amendment history for every approved or
revised result.
Rationale: medical compliance requires complete traceability and approved-result control.

### VII. Cross-Month Reporting and Aggregation
Reporting capabilities MUST support aggregation across multiple monthly schemas
(e.g., `hsoft0125`, `hsoft0225`, `hsoft0325`) when reporting windows span months.
Report specifications MUST define the partition range strategy and reconciliation rules.
Rationale: laboratory operations and compliance reporting depend on continuous periods.

### VIII. Multi-Facility Scalability by Design
Architecture and feature design MUST support multi-facility, multi-department/laboratory,
and multi-device operations without forking business logic per site.
Configuration-driven behavior MUST be preferred over hard-coded facility assumptions.
Rationale: the LIS product operates across heterogeneous hospital environments.

### IX. Specimen Identification and Barcode Tracking
Every specimen MUST have a unique identifier, implemented as barcode and/or equivalent
unique specimen token. Barcode generation MUST occur at test ordering or specimen
collection. Barcode identity MUST be preserved across specimen collection, transport,
receipt, and sample analysis. Analyzer integrations SHOULD prioritize barcode reading over
manual entry, and all manual specimen identifier entries MUST be audited.
Rationale: unique tracking prevents specimen mismatch and protects diagnostic integrity.

### X. Specimen Lifecycle Management
The system MUST implement the specimen lifecycle as:
specimen collection -> specimen transport -> specimen receipt -> specimen validation ->
sample analysis. The system MUST support specimen rejection for at least damaged specimen,
insufficient volume, incorrect container, and expired specimen. Rejected specimens MUST
persist rejection status and rejection reason in auditable records.
Rationale: explicit lifecycle control matches real laboratory operations.

### XI. Analyzer Result Ingestion Pipeline
When analyzer integration is enabled, analyzer ingestion MUST follow this pipeline:
device listener -> raw result ingestion -> mapping layer -> validation -> LIS result
storage. Raw analyzer output MUST be stored in temporary or staging persistence before
mapping. Mapping MUST convert device parameters to LIS test codes. Validation MUST verify
unit consistency, reference-range compatibility, and abnormal-flag integrity. Results MUST
NOT be stored as official LIS results until mapping and validation complete. In manual
result entry mode, results MAY be recorded through result-entry services without analyzer
ingestion, but they MUST still pass validation, audit logging, and approval controls.
Rationale: the platform must support both manual operation and deterministic device-driven
operation.

### XII. External Integration Standards
External integration SHOULD support HL7 v2, FHIR, or controlled XML/JSON gateways based
on partner capability. Result transmission MUST NOT include unapproved results.
Integration adapters MUST remain isolated from core workflow logic.
Rationale: LIS interoperability with HIS, EMR, and national reporting systems requires
standardized and decoupled integration architecture.

### XIII. Comprehensive Audit Logging
Audit logging MUST cover, at minimum: result entry, result modification, result approval,
result export, permission change, and specimen rejection. Audit records MUST include
actor, timestamp, action type, previous value, and new value. Audit logs MUST be
immutable and protected from unauthorized alteration.
Rationale: compliance and medical traceability depend on complete and tamper-resistant
activity history.

### XIV. Data Retention and Archival Policy
Operational monthly schemas SHOULD retain data for a configurable retention window
(for example 12 to 24 months based on policy). Historical data SHOULD be archived to
separate long-term storage. Reporting MUST be able to access archived datasets when
required by clinical, legal, or operational reporting needs.
Rationale: long-lived LIS data requires controlled storage growth without losing access.

### XV. Output Control Enforcement
All print, export, and transmission operations MUST verify result approval status at
execution time. If a result is not approved, the operation MUST be rejected and recorded.
Rationale: unapproved laboratory outputs must never be released to clinical consumers.

### XVI. Authorization and Security Enforcement
Result approval MUST be restricted to authorized laboratory doctors. Approval privileges
MUST be explicitly defined in the authorization model and MUST NOT be implicitly derived
from T/X/S/V/I/E permissions. All system access MUST require authenticated user identity,
and anonymous access to patient, specimen, or result data MUST NOT be allowed. User
sessions MUST enforce expiration and re-authentication policies.
Rationale: explicit authorization boundaries protect clinical decisions and data safety.

### XVII. Patient Identity Integrity
Patient identity MUST remain consistent across registration, laboratory orders, specimens,
and results. Specimens and laboratory results MUST maintain a permanent reference to the
originating patient identity.
Rationale: patient-identity continuity prevents clinical misattribution.

### XVIII. Laboratory Order Integrity
Each laboratory test order MUST have a unique order identifier. Specimens, analyzer
results, and reported results MUST reference the originating order identifier.
Rationale: orders are the transactional backbone of laboratory workflows.

### XIX. Specimen-Order Integrity and Status Control
Every specimen MUST be associated with exactly one laboratory order. Specimen state
transitions MUST follow a controlled state model, and invalid transitions (for example,
analysis before receipt) MUST be rejected by the system.
Rationale: controlled specimen state prevents unsafe workflow shortcuts.

### XX. Advanced Analyzer Result Validation
All laboratory results, including manually entered results and analyzer-ingested results,
MUST be validated before persistence or approval. Measurement units MUST be normalized to
LIS canonical units before persistence. Laboratory results MUST be evaluated against
reference ranges applicable to test and patient demographics. Results exceeding critical
thresholds SHOULD trigger clinical alert mechanisms.
Rationale: normalized and context-aware validation is necessary regardless of result
origin.

### XXI. Result Data Immutability and Versioning
Approved laboratory results MUST NOT be modified directly. Any post-approval change MUST
create an amendment record while preserving original data. Result revisions MUST maintain
version history for complete traceability.
Rationale: immutability and versioning preserve medico-legal evidence.

### XXII. Data Consistency and Transaction Integrity
All laboratory entities (patients, orders, specimens, results) MUST maintain referential
integrity. Critical laboratory operations MUST execute within database transactions to
prevent partial state updates.
Rationale: transactional consistency protects clinical and operational correctness.

### XXIII. Performance and Partition-Aware Scalability
Transactional queries MUST remain partition-aware and MUST avoid full scans across all
schemas. When analyzer integration is enabled, analyzer ingestion services MUST support
high-throughput processing without blocking laboratory workflow operations. Manual result
entry mode MUST remain responsive under expected clinical workloads.
Rationale: performance safeguards are mandatory for both manual and integrated laboratory
throughput.

### XXIV. Reporting Integrity and Historical Consistency
Clinical and regulatory reports MUST be reproducible using the same underlying data
snapshot. Historical reports MUST remain consistent even when reference ranges or
configuration values change later.
Rationale: reproducibility is essential for audits and clinical accountability.

### XXV. Data Privacy and Access Logging
Patient information MUST be protected according to medical-data confidentiality
regulations. Access to patient records SHOULD be logged for compliance auditing.
Rationale: privacy protection is a core healthcare obligation.

### XXVI. Backup and Disaster Recovery Governance
The system MUST support regular database backups and disaster-recovery procedures.
Recovery procedures MUST guarantee that approved laboratory results are not permanently
lost.
Rationale: continuity of care depends on resilient data recovery.

### XXVII. Configuration Governance and Change Control
Laboratory configuration (test catalog, reference ranges, device mappings) MUST be
changeable without code modifications. Configuration changes affecting laboratory
interpretation MUST be recorded in audit logs.
Rationale: configuration governance enables safe operational adaptability.

### XXVIII. Device Integration Resilience
When analyzer integration is enabled, failure in one analyzer integration MUST NOT disrupt
other devices or core LIS workflow. Analyzer ingestion failures MUST support retry
mechanisms and error tracking. Systems operating in manual result entry mode MUST remain
fully functional without device integrations.
Rationale: device isolation is required where integrations exist, while manual LIS
deployments must remain operational without them.

### XXIX. Observability and Operational Monitoring
The system SHOULD provide operational monitoring for manual result entry services,
database performance, integration endpoints, report-generation workloads, and analyzer
ingestion services when analyzer integration is enabled.
Rationale: observability improves incident response and service reliability.

## Architecture and Technical Standards

- The platform MUST support two operating modes:
  - Manual LIS: technicians read analyzer output externally and enter results manually.
  - Analyzer Integrated LIS: results are ingested automatically from configured devices.
- Both operating modes MUST preserve the same approval, audit, specimen-tracking,
  reference-range, and patient/order/result integrity controls.

- Frontend stack MUST remain React + Vite + TypeScript.
- Backend stack MUST remain Node.js + TypeScript + Apollo GraphQL.
- Backend request flow MUST be `schema -> resolver -> service -> database`.
- Resolvers MUST enforce authentication and role checks before invoking services.
- Services MUST enforce workflow gates and approval-state constraints.
- Database adapters MUST route read/write operations through centralized data-access
  abstractions aligned with AccessData.ts responsibilities.
- Oracle stored procedures in `pkg_xetnghiem` MUST be used for critical transaction
  operations, approval updates, and partition-sensitive writes.
- Schema partition utility behavior (MMYY conversion, partition existence checks,
  cross-month federation) MUST be centralized and reusable.
- Integration adapters for analyzers, when enabled, MUST be isolated by device and bound
  through a canonical mapping contract.
- Print/export/transmit endpoints MUST reject unapproved results.
- Specimen services MUST enforce unique specimen identifiers and barcode continuity across
  collection, transport, receipt, validation, and analysis transitions.
- Specimen rejection workflows MUST include structured rejection reasons and auditable
  state transitions.
- Result-entry services MUST support manual result entry mode with validation, audit, and
  approval gating before outputs are released.
- Analyzer ingestion architecture, when enabled, MUST include device listeners, staging
  persistence for raw output, deterministic mapping, and validation before official result
  persistence.
- Validation layers for all result sources MUST enforce measurement-unit normalization,
  reference-range compatibility, and abnormal-flag checks.
- External integration adapters MUST implement protocol contracts (HL7 v2, FHIR,
  XML/JSON gateway as applicable) and remain decoupled from core workflow services.
- Audit infrastructure MUST provide immutable append-only logging for mandated actions,
  including permission changes and specimen rejection events.
- Data lifecycle controls SHOULD implement configurable retention windows for operational
  monthly schemas and archive access paths for historical reporting.
- Authorization models MUST define explicit approval privileges independent of generic
  CRUD/print/export permissions.
- Authentication and session controls MUST enforce identity, session expiration, and
  re-authentication for protected clinical operations.
- Domain models MUST preserve immutable references: result -> specimen -> order -> patient.
- Specimen and order services MUST enforce one-specimen-to-one-order association and
  reject invalid state transitions.
- Result persistence services MUST enforce canonical-unit normalization, demographic-aware
  reference-range checks, and critical-threshold evaluation.
- Approved-result updates MUST use amendment/version mechanisms, never in-place mutation.
- Critical multi-entity operations MUST execute in transactional boundaries.
- Query and reporting services MUST be partition-aware and optimized for high-volume
  reporting workloads; when analyzer integration is enabled, they MUST also support
  high-volume analyzer ingestion workloads.
- Reporting services MUST support reproducible snapshots and historical consistency.
- Privacy controls MUST enforce medical confidentiality requirements and compliance-ready
  access logging.
- Platform operations MUST include backup, disaster-recovery, and validated restoration
  procedures for approved results.
- Configuration services MUST allow no-code updates to catalogs, ranges, and mappings,
  with auditable change records.
- Device integration runtime MUST isolate adapter failures and provide retry/error
  telemetry when analyzer integration is enabled.
- Observability stack SHOULD include metrics/logging/tracing for ingestion, database,
  integrations, manual result entry services, and reporting pipelines.

## Monorepo Structure Contract

- The repository MUST keep frontend and backend codebases in one workspace.
- Frontend implementation MUST remain under `hsoft-web-frontend/hsoft-frontend/src`.
- Backend implementation MUST remain under `hoft-web-backend/src`.
- Specs and plans MUST identify impacted side(s): frontend, backend, analyzer integration,
  database, or reporting.
- Tasks MUST include explicit file paths and identify any required stored procedure,
  data-access, mapping-layer, or RBAC updates.

## Delivery Workflow and Quality Gates

- Every spec MUST include the LIS workflow impact and approval-gate impact.
- Every plan MUST include a constitution check for workflow integrity, RBAC mapping,
  partition strategy, and auditability.
- Every implementation MUST include tests for:
  - role-based permission enforcement (T/X/S/V/I/E as applicable),
  - explicit approval-permission enforcement and authentication/session controls,
  - patient/order/specimen/result identity linkage and referential integrity,
  - approval-before-output behavior,
  - cross-month query/report correctness where date ranges span months,
  - result validation correctness for manual and device-driven inputs as applicable,
  - analyzer mapping correctness when analyzer integration is enabled,
  - unit normalization, reference-range validation, and critical-threshold handling,
  - barcode continuity and unique specimen identification,
  - specimen rejection state and reason persistence,
  - specimen state-machine validation and invalid-transition rejection,
  - result amendment/version history integrity after approval,
  - transactional consistency for critical multi-entity operations,
  - manual result-entry controls (validation, audit, approval gating) when manual mode is
    in scope,
  - ingestion pipeline controls (staging, mapping, validation, storage gating) when
    analyzer integration is enabled,
  - immutable audit logging completeness,
  - archive-path reporting behavior when historical data is required,
  - report reproducibility and historical consistency,
  - backup/restore recovery guarantees for approved results,
  - device-isolation and retry behavior for ingestion failures when analyzer integration is
    enabled.
- Code review MUST reject any direct DB access path that bypasses centralized data-access
  abstractions or stored procedure governance for critical transactions.
- Production readiness MUST include evidence that unapproved results cannot be printed,
  exported, or transmitted.

## Governance

This constitution is the highest-level engineering policy for this repository and
supersedes conflicting local practices.

- Amendment process:
  - Propose change via pull request updating this file and all impacted templates.
  - Include rationale, operational impact, migration guidance, and risk assessment.
  - Require approval from maintainers responsible for LIS architecture and operations.
- Versioning policy (semantic versioning):
  - MAJOR: incompatible principle removals/redefinitions or governance changes.
  - MINOR: new principle/section or materially expanded mandatory guidance.
  - PATCH: clarifications, wording improvements, and non-semantic refinements.
- Compliance review expectations:
  - Plan reviews MUST pass Constitution Check gates before implementation starts.
  - Pull requests MUST provide evidence for required tests and workflow gate enforcement.
  - Non-compliant changes MUST be rejected or merged only with an approved exception
    record that includes remediation timeline and owner.

**Version**: 3.3.0 | **Ratified**: 2026-03-13 | **Last Amended**: 2026-03-16
