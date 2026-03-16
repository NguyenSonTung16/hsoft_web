# Implementation Plan: LIS Login UI Scaffold

**Branch**: `001-login-ui-scaffold` | **Date**: 2026-03-16 | **Spec**: `/specs/001-login-ui-scaffold/spec.md`
**Input**: Feature specification from `/specs/001-login-ui-scaffold/spec.md`

## Summary

Replace the current Vite starter screen with a frontend-only LIS login entry screen for
Manual LIS mode. The implementation keeps scope inside the existing React app, adds typed
placeholder service contracts for facility lookup, lab-area lookup, authentication, and
session bootstrap, and preserves future backend integration points without introducing
real GraphQL or Oracle calls in this phase.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19.2, Vite 8  
**Primary Dependencies**: React, React DOM, Vite, ESLint; backend reference remains Apollo GraphQL + Oracle but is unchanged in this feature  
**Storage**: N/A for this phase; in-memory mock datasets and transient UI/session bootstrap state only  
**Testing**: `npm run build`, `npm run lint`, and manual browser walkthroughs against the feature spec; automated UI tests are planned before real backend wiring  
**Target Platform**: Modern desktop browsers used on hospital workstations, with responsive fallback for smaller laptop/tablet widths  
**Project Type**: Monorepo web application with React frontend and Node/Apollo backend  
**Performance Goals**: Login screen first render under 2 seconds on a normal workstation, lookup and mock submit transitions under 300 ms, duplicate submit prevention during pending requests  
**Constraints**: No real backend calls, no router or global state library additions, no sensitive logging, preserve Manual LIS operation and future authenticated-route guard points  
**Scale/Scope**: One login entry screen, four actor categories, two dependent lookup datasets, one session bootstrap flow, no patient/order/specimen/result screens yet

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked after Phase 1 design artifacts.*

- [x] **Principle I - Workflow Integrity**: The feature is a pre-workflow authentication surface only; it blocks access to downstream LIS modules until login succeeds and does not reorder any clinical steps.
- [x] **Principle II - RBAC by Actor**: The plan models reception staff, laboratory technicians, laboratory doctors, and system administrators as valid post-login actors while keeping the login page itself as the only pre-auth surface.
- [x] **Principle III - Permission String (T X S V I E)**: No protected CRUD/print/export action is introduced in this phase; the plan reserves the authenticated session boundary where T/X/S/V/I/E checks will attach in later protected screens.
- [x] **Principle IV - Oracle Partition/Data Access Governance**: No Oracle access, MMYY partition query, or direct DB path is introduced; future auth integration is explicitly routed through backend contracts rather than direct frontend data access.
- [x] **Principle V - Analyzer Mapping Layer**: The feature is explicitly Manual LIS mode and does not assume analyzer integration; no device logic is introduced, preserving optional integration later.
- [x] **Principle VI - Approval and Auditability**: The login screen does not print, export, transmit, or approve clinical results; it introduces only non-sensitive login-attempt logging and keeps approval gates for later clinical modules.
- [x] **Principle VII - Cross-Month Reporting**: No reporting or date-range aggregation is added in this feature.
- [x] **Principle VIII - Multi-Facility Scalability**: Facility (`Co so`) and lab-area (`Khu XN`) choices are modeled as configuration-backed options, not hard-coded single-site behavior.
- [x] **Principle IX - Specimen Identification**: No specimen identifiers are introduced or altered by this authentication feature.
- [x] **Principle X - Specimen Lifecycle**: No specimen lifecycle state is introduced or bypassed by this feature.
- [x] **Principle XI - Analyzer Ingestion Pipeline**: No analyzer ingestion is implemented; the design remains consistent with manual operation by avoiding any dependency on device listeners or staging pipelines.
- [x] **Principle XII - External Integration**: Phase 1 design produces placeholder service and GraphQL contracts only; no external adapter is added to core workflow code.
- [x] **Principle XIII - Comprehensive Audit Logging**: The plan adds non-sensitive UI/service-boundary logging for login attempts and errors; immutable clinical audit requirements remain deferred to backend auth/session implementation.
- [x] **Principle XIV - Retention and Archival**: No retained operational or archival dataset is created in this frontend-only phase.
- [x] **Principle XV - Output Control Enforcement**: The feature introduces no print/export/transmission path.
- [x] **Principle XVI - Authorization and Security**: The login flow is the required authentication gate for later protected actions, includes session-expiration placeholder metadata, and defines a re-authentication hook for future timeout handling.
- [x] **Principle XVII - Patient Identity Integrity**: No patient identity data is entered or changed in this feature.
- [x] **Principle XVIII - Order Integrity**: No laboratory order identifier is created or modified in this feature.
- [x] **Principle XIX - Specimen State Control**: No specimen-order association or state transition is introduced in this feature.
- [x] **Principle XX - Analyzer Validation Rules**: Result validation is out of scope; this phase validates only login input completeness and work-date rules.
- [x] **Principle XXI - Result Immutability/Versioning**: No clinical result data is created or edited in this feature.
- [x] **Principle XXII - Data Consistency**: The plan keeps form state, selected facility, selected lab area, and session bootstrap state typed and internally consistent without multi-entity transactional writes.
- [x] **Principle XXIII - Performance/Scalability**: The plan keeps login lookup and submit flow lightweight, prevents duplicate submits, and avoids introducing any blocking integration workload.
- [x] **Principle XXIV - Reporting Integrity**: No reporting surface is introduced.
- [x] **Principle XXV - Data Privacy**: Password input is masked, raw passwords are excluded from logs, and no patient data is exposed on the unauthenticated screen.
- [x] **Principle XXVI - Backup/DR**: No persistent clinical data is written in this feature; DR requirements stay with the backend implementation phase.
- [x] **Principle XXVII - Configuration Governance**: Placeholder `Co so` and `Khu XN` datasets are isolated behind replaceable service contracts so later configuration-backed loading does not require UI redesign.
- [x] **Principle XXVIII - Device Resilience**: No analyzer/device integration is introduced, so manual-mode availability is preserved with no device dependency.
- [x] **Principle XXIX - Observability**: The plan includes deterministic loading/success/error states and non-sensitive stub logging at the UI/service boundary; backend/runtime telemetry remains for later implementation.
- [x] **Monorepo Contract**: Planned code changes target `hsoft-web-frontend/hsoft-frontend/src`, while future backend integration references `hoft-web-backend/src` contracts without changing backend code in this phase.
- [x] **Quality Gates**: Verification covers field rendering, validation blocking, dependent option loading, duplicate-submit prevention, non-sensitive logging, and mock idle/loading/success/error transitions; analyzer/reporting/specimen/result gates are not applicable to this authentication-only scope.

## Project Structure

### Documentation (this feature)

```text
specs/001-login-ui-scaffold/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── auth.schema.graphql
│   ├── login-service.interface.ts
│   └── contract.md
└── tasks.md
```

### Source Code (repository root)

```text
hoft-web-backend/
├── src/
│   ├── graphql/
│   ├── modules/
│   └── database/

hsoft-web-frontend/hsoft-frontend/
├── src/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   ├── main.tsx
│   └── features/
│       └── login/
│           ├── components/
│           ├── hooks/
│           ├── services/
│           ├── styles/
│           └── types/
```

**Structure Decision**: Use the existing web-application monorepo layout. Implement the login scaffold entirely in `hsoft-web-frontend/hsoft-frontend/src`, keep `App.tsx` as the top-level bootstrap/auth gate, and group login-specific UI, state, contracts, and styling under `src/features/login`. Backend files remain unchanged in this phase and are referenced only by the planning contracts for future GraphQL integration.

## Phase 0 Research Output

- Testing strategy: use current build/lint/manual walkthrough workflow now; introduce Vitest + React Testing Library before backend integration.
- UI architecture: keep a single-screen root app with local feature state and no router until protected screens exist.
- Contract strategy: document both future GraphQL shapes and frontend service interfaces so UI code can swap mock services for real resolvers later.
- Operating mode: model the feature as Manual LIS entry, avoiding analyzer assumptions while preserving future session/auth boundaries.

## Phase 1 Design Summary

- Data model centers on `LoginFormState`, `FacilityOption`, `LabAreaOption`, `LoginRequestDraft`, and `SessionBootstrapState`.
- Contracts define placeholder lookup queries and a login mutation for future GraphQL work plus a frontend service interface for the current UI-only phase.
- Quickstart focuses on frontend development and manual verification because no runtime auth backend exists yet.

## Post-Design Constitution Re-Check

All constitution gates still pass after design. No new violations were introduced by `research.md`, `data-model.md`, `quickstart.md`, or the contract artifacts.

## Complexity Tracking

No constitution violations or justified exceptions are required for this feature.
