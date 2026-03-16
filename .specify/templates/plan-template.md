# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] **Principle I - Workflow Integrity**: Feature preserves LIS flow order:
  registration -> ordering -> collection -> receipt -> analysis -> entry -> approval ->
  print -> payment. No bypass or reordering of mandatory gates.
- [ ] **Principle II - RBAC by Actor**: Plan defines role constraints for reception staff,
  lab technicians, lab doctors, and system administrators at UI + backend levels.
- [ ] **Principle III - Permission String (T/X/S/V/I/E)**: Protected actions map to the
  6-position permission model and include explicit enforcement points.
- [ ] **Principle IV - Oracle Partition/Data Access Governance**: Date-range features define
  MMYY partition strategy and cross-month query behavior. Direct DB access is excluded.
  Centralized data-access abstractions and required `pkg_xetnghiem` usage are specified.
- [ ] **Principle V - Analyzer Mapping Layer**: Any analyzer integration uses an adapter +
  mapping contract from machine parameters to LIS test codes when device integration is
  enabled; manual result entry mode remains supported without analyzer integration.
- [ ] **Principle VI - Approval and Auditability**: Output channels (print/export/transmit)
  are blocked until doctor approval. Audit fields and amendment history are specified.
- [ ] **Principle VII - Cross-Month Reporting**: Reporting and analytics explicitly define
  multi-schema aggregation and reconciliation rules when windows span months.
- [ ] **Principle VIII - Multi-Facility Scalability**: Plan supports multi-facility,
  multi-department, and multi-device operation through configuration, not code forks.
- [ ] **Principle IX - Specimen Identification**: Specimen identifiers are unique,
  barcode/unique ID generation point is defined, and continuity across specimen lifecycle
  steps is enforced. Manual identifier entry is audited.
- [ ] **Principle X - Specimen Lifecycle**: Plan defines specimen flow:
  collection -> transport -> receipt -> validation -> analysis, including explicit
  rejection criteria and required status/reason persistence.
- [ ] **Principle XI - Analyzer Ingestion Pipeline**: Plan defines device listener,
  raw staging, mapping, validation, and official LIS storage gating when analyzer
  integration is enabled, or explicit manual result-entry service flow otherwise.
- [ ] **Principle XII - External Integration**: Integration strategy identifies protocol
  contract (HL7 v2/FHIR/XML/JSON gateway as applicable) and keeps adapters isolated from
  core workflow logic.
- [ ] **Principle XIII - Comprehensive Audit Logging**: Plan defines immutable audit
  coverage for required actions with actor, timestamp, action type, previous value,
  and new value.
- [ ] **Principle XIV - Retention and Archival**: Plan defines operational retention
  window, archival strategy, and archived-data reporting access expectations.
- [ ] **Principle XV - Output Control Enforcement**: Print/export/transmission paths
  enforce runtime approval checks with explicit rejection behavior when unapproved.
- [ ] **Principle XVI - Authorization and Security**: Plan defines explicit approval
  permission model, mandatory authentication, and session expiration/re-auth controls.
- [ ] **Principle XVII - Patient Identity Integrity**: Plan enforces permanent patient
  identity references across registration, order, specimen, and result paths.
- [ ] **Principle XVIII - Order Integrity**: Plan defines unique order identifiers and
  ensures specimens/results retain source-order linkage.
- [ ] **Principle XIX - Specimen State Control**: Plan defines one-specimen-to-one-order
  association and rejects invalid specimen state transitions.
- [ ] **Principle XX - Analyzer Validation Rules**: Plan defines unit normalization,
  demographic-aware reference-range evaluation, and critical-value handling for all result
  sources, including manual entry.
- [ ] **Principle XXI - Result Immutability/Versioning**: Plan enforces no direct edit of
  approved results and includes amendment/version history strategy.
- [ ] **Principle XXII - Data Consistency**: Plan includes referential integrity and
  transactional boundaries for critical operations.
- [ ] **Principle XXIII - Performance/Scalability**: Plan is partition-aware and includes
  high-throughput ingestion constraints and strategy.
- [ ] **Principle XXIV - Reporting Integrity**: Plan includes reproducible reporting
  snapshots and historical consistency safeguards.
- [ ] **Principle XXV - Data Privacy**: Plan includes confidentiality controls and patient
  access logging strategy for compliance.
- [ ] **Principle XXVI - Backup/DR**: Plan defines backup cadence and disaster-recovery
  criteria to protect approved laboratory results.
- [ ] **Principle XXVII - Configuration Governance**: Plan keeps test catalog/reference
  ranges/device mappings configurable without code changes and auditable.
- [ ] **Principle XXVIII - Device Resilience**: Plan ensures adapter isolation, retries,
  and error tracking for analyzer failures when analyzer integration is enabled.
- [ ] **Principle XXIX - Observability**: Plan includes monitoring coverage for ingestion,
  database performance, integration endpoints, and report workloads.
- [ ] **Monorepo Contract**: Tasks reference concrete paths under
  `hsoft-web-frontend/hsoft-frontend/src` and/or `hoft-web-backend/src`.
- [ ] **Quality Gates**: Plan includes tests for permission enforcement, approval gates,
  cross-month correctness, analyzer mapping behavior when analyzer integration is enabled,
  specimen tracking, immutable audit behavior, archival-reporting behavior, manual
  result-entry behavior, and
  resilience/privacy/recovery behavior as applicable.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
hoft-web-backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

hsoft-web-frontend/hsoft-frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
