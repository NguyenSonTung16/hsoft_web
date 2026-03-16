---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app (this repository)**: `hoft-web-backend/src/`, `hsoft-web-frontend/hsoft-frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Constitution-Driven Mandatory Task Types

- Add tasks for LIS workflow gate enforcement when a feature affects workflow transitions.
- Add tasks for RBAC actor checks and T/X/S/V/I/E permission mapping for protected actions.
- Add tasks for approval-before-output guards when print/export/transmit is in scope.
- Add tasks for audit persistence (approver, approval timestamp, amendment history) when
  result approval or result edits are in scope.
- Add tasks for MMYY partition and cross-month query/report handling when date-range data
  access or reporting is in scope.
- Add tasks for centralized data-access changes and required `pkg_xetnghiem` procedure
  updates when critical transactional behavior changes.
- Add analyzer adapter/mapping tasks only when analyzer integration is enabled.
- Add tasks for specimen identifier generation, barcode continuity, and manual-entry audit
  controls when specimen handling is in scope.
- Add tasks for specimen lifecycle state handling and rejection reason persistence when
  collection/transport/receipt/validation flows are in scope.
- Add tasks for analyzer ingestion pipeline controls (listener, staging, mapping,
  validation, gated LIS persistence) only when analyzer integration is enabled.
- Add tasks for manual result-entry services, validation, audit, and approval gating when
  manual result entry is in scope.
- Add tasks for external integration contracts (HL7 v2/FHIR/XML/JSON gateway), ensuring
  adapters remain decoupled from core workflow logic.
- Add tasks for immutable audit infrastructure and required event fields.
- Add tasks for retention window and archival reporting access behavior when data lifecycle
  or reporting features are in scope.
- Add tasks for explicit approval authorization, authentication enforcement, and session
  security controls for protected clinical operations.
- Add tasks for patient identity continuity and unique order-ID propagation across
  registration, orders, specimens, analyzer data, and results.
- Add tasks for approved-result immutability and amendment/version-history persistence.
- Add tasks for referential integrity and transactional consistency in critical operations.
- Add tasks for report reproducibility and historical consistency under changing configs.
- Add tasks for privacy controls, patient-record access logging, backup/restore validation,
  and disaster-recovery readiness.
- Add tasks for configuration-governance auditing, device-failure isolation, retry/error
  handling, and operational observability coverage.
- Add tests covering each applicable item above in unit/integration/system levels.

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T004 Setup database schema and migrations framework
- [ ] T005 [P] Implement authentication/authorization framework
- [ ] T006 [P] Setup API routing and middleware structure
- [ ] T007 Create base models/entities that all stories depend on
- [ ] T008 Configure error handling and logging infrastructure
- [ ] T009 Setup environment configuration management
- [ ] T010 Define LIS workflow transition guards and invalid-transition handling
- [ ] T011 [P] Define role matrix (actor x action) and T/X/S/V/I/E mapping
- [ ] T012 [P] Define approval-before-output policy and audit persistence contract
- [ ] T013 Define MMYY partition and cross-month query strategy for impacted modules
- [ ] T014 [P] Define analyzer mapping contract (if device integration is in scope)
- [ ] T014A [P] Define manual result-entry service flow (if manual entry is in scope)
- [ ] T015 [P] Define specimen identifier and barcode continuity contract
- [ ] T016 Define specimen lifecycle states and rejection reason model
- [ ] T017 [P] Define analyzer ingestion pipeline controls and staging behavior
- [ ] T017A [P] Define manual result-entry validation, audit, and approval controls
- [ ] T018 [P] Define external integration protocol contracts and adapter boundaries
- [ ] T019 Define immutable audit model and required event payload fields
- [ ] T020 Define retention window, archival policy, and archive-report access strategy
- [ ] T021 [P] Define explicit approval authorization and authentication/session controls
- [ ] T022 Define patient identity linkage and unique order-ID propagation contract
- [ ] T023 [P] Define approved-result immutability and amendment/versioning model
- [ ] T024 Define referential-integrity and transactional-boundary requirements
- [ ] T025 [P] Define reproducible-report snapshot strategy and historical consistency
- [ ] T026 Define privacy, access logging, backup, and disaster-recovery controls
- [ ] T027 [P] Define configuration-governance auditing and no-code config boundaries
- [ ] T028 [P] Define device-failure isolation, retry policy, and error-tracking model
- [ ] T028A [P] Define dual-mode operation boundaries (manual vs analyzer-integrated)
- [ ] T029 [P] Define observability requirements for ingestion/DB/integration/reporting

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T030 [P] [US1] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T031 [P] [US1] Integration test for [user journey] in tests/integration/test_[name].py
- [ ] T032 [P] [US1] Authorization test for T/X/S/V/I/E enforcement on protected actions
- [ ] T033 [P] [US1] Approval-gate test: unapproved results cannot print/export/transmit
- [ ] T034 [P] [US1] Cross-month test for MMYY data aggregation (when applicable)

### Implementation for User Story 1

- [ ] T035 [P] [US1] Create [Entity1] model in src/models/[entity1].py
- [ ] T036 [P] [US1] Create [Entity2] model in src/models/[entity2].py
- [ ] T037 [US1] Implement [Service] in src/services/[service].py (depends on T035, T036)
- [ ] T038 [US1] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] T039 [US1] Add validation and error handling
- [ ] T040 [US1] Add logging for user story 1 operations

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T041 [P] [US2] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T042 [P] [US2] Integration test for [user journey] in tests/integration/test_[name].py

### Implementation for User Story 2

- [ ] T043 [P] [US2] Create [Entity] model in src/models/[entity].py
- [ ] T044 [US2] Implement [Service] in src/services/[service].py
- [ ] T045 [US2] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] T046 [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T047 [P] [US3] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T048 [P] [US3] Integration test for [user journey] in tests/integration/test_[name].py

### Implementation for User Story 3

- [ ] T049 [P] [US3] Create [Entity] model in src/models/[entity].py
- [ ] T050 [US3] Implement [Service] in src/services/[service].py
- [ ] T051 [US3] Implement [endpoint/feature] in src/[location]/[file].py

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests (if requested) in tests/unit/
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
