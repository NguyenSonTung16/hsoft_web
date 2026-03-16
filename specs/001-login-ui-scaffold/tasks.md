# Tasks: LIS Login UI Scaffold

**Input**: Design documents from `/specs/001-login-ui-scaffold/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Operating Mode**: Manual LIS (no analyzer integration — Constitution Principle V)
**Tests**: No automated tests are requested for this phase. Verification is manual browser walkthrough plus `npm run build` / `npm run lint`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Exact file paths included in each description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the frontend dev environment is ready and the build/lint baseline is green before any feature code is added.

- [x] T001 Verify frontend dependencies are installed by running `npm install` in `hsoft-web-frontend/hsoft-frontend`
- [x] T002 [P] Confirm TypeScript build and lint baseline pass with `npm run build` and `npm run lint` in `hsoft-web-frontend/hsoft-frontend`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared type definitions and the application-root bootstrap shell.
All three user stories depend on the types (T003) and the App-level auth gate (T004).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Create shared login type definitions in `hsoft-web-frontend/hsoft-frontend/src/features/login/types/login.types.ts` declaring the `FacilityOption`, `LabAreaOption`, `LoginFormState`, `LoginRequestDraft`, `SessionBootstrapState`, and `LoginAttemptLog` interfaces as specified in `specs/001-login-ui-scaffold/data-model.md`
- [x] T004 Refactor `hsoft-web-frontend/hsoft-frontend/src/App.tsx` to remove the Vite counter/hero demo and become the session-aware application bootstrap shell: render the login screen when `SessionBootstrapState.status` is `idle` or `error`, and render a placeholder authenticated-content area when status is `success`

**Checkpoint**: Types and App shell are in place — user story implementation can begin.

---

## Phase 3: User Story 1 — Enter Login Information (Priority: P1) 🎯 MVP

**Goal**: A LIS user opens the app and sees all five required login inputs (`Username`, `Password`, `Co so`, `Khu XN`, `Ngay lam viec`) with `Co so` populating from placeholder data on mount and `Khu XN` options updating when `Co so` changes.

**Independent Test**: Start the dev server (`npm run dev`), open the app, and confirm:
1. All five labeled inputs are visible and interactive.
2. `Co so` select box contains placeholder options loaded on mount.
3. Changing `Co so` triggers `Khu XN` to reload with placeholder options scoped to the selection.
4. The submit button is rendered and responds to overall form completeness.

### Implementation for User Story 1

- [x] T005 [P] [US1] Create placeholder facility service in `hsoft-web-frontend/hsoft-frontend/src/features/login/services/facilityService.ts` implementing `loadFacilities()` returning at least two deterministic `FacilityOption` mock objects and `loadLabAreas(facilityId: string)` returning at least two deterministic `LabAreaOption` mock objects scoped to the provided `facilityId`
- [x] T006 [P] [US1] Create `LoginForm` component skeleton in `hsoft-web-frontend/hsoft-frontend/src/features/login/components/LoginForm.tsx` with labeled inputs for `Username` (text), `Password` (password — masked), `Co so` (select), `Khu XN` (select), `Ngay lam viec` (date input), and a submit button; accept all field values, option lists, and change handlers as props
- [x] T007 [US1] Wire `App.tsx` to initialize `LoginForm`, call `facilityService.loadFacilities()` on mount to populate `Co so`, and call `facilityService.loadLabAreas(facilityId)` whenever the selected facility changes to update `Khu XN` options
- [x] T008 [US1] Create login form layout styles in `hsoft-web-frontend/hsoft-frontend/src/features/login/styles/LoginForm.css` — centered card layout, grouped field rows, label-above-input pattern, and a full-width submit button sized for desktop hospital workstations

**Checkpoint**: User Story 1 is complete and independently testable. The app opens to the login screen and all five fields display with dependent lookup behavior.

---

## Phase 4: User Story 2 — Validate Inputs Before Submission (Priority: P2)

**Goal**: A LIS user gets immediate, per-field validation feedback when required inputs are missing or invalid; the submit action stays blocked until all fields pass validation.

**Independent Test**: With the login screen open:
1. Click submit without filling any field — confirm all five fields show individual error messages and submit remains blocked.
2. Fill `Username` and `Password` but leave `Co so` unselected — confirm `Co so` and `Khu XN` show errors.
3. Fill all fields with valid data — confirm submit button becomes available.
4. Clear `Password` after all fields were valid — confirm submit is blocked again with a `Password` error only.

### Implementation for User Story 2

- [x] T009 [P] [US2] Create `useLoginForm` hook in `hsoft-web-frontend/hsoft-frontend/src/features/login/hooks/useLoginForm.ts` managing field values, `touched` flags per field, and `errors` record; implement `validateLoginForm()` that returns errors for blank `username`, blank `password`, absent `facilityId`, absent `labAreaId`, and missing or unparseable `workDate`
- [x] T010 [US2] Update `LoginForm` component in `hsoft-web-frontend/hsoft-frontend/src/features/login/components/LoginForm.tsx` to accept `errors` and `touched` props and render a field-specific error message below each input that has been touched and is invalid
- [x] T011 [US2] Add submit-disabled enforcement to `LoginForm` in `hsoft-web-frontend/hsoft-frontend/src/features/login/components/LoginForm.tsx`: disable the submit button and show inline feedback when `Object.keys(errors).length > 0` or any required field is still untouched

**Checkpoint**: User Story 2 is complete. All five fields validate independently; the submit button correctly tracks form validity.

---

## Phase 5: User Story 3 — Backend-Ready Method Stubs (Priority: P3)

**Goal**: A developer can trigger `loadFacilities()`, `loadLabAreas()`, and `submitLogin()` from UI actions and receive deterministic placeholder responses; the login UI transitions through `idle → loading → success/error` states without any real backend call; no raw password data appears in any log event.

**Independent Test**: With valid form data, click submit and confirm:
1. UI enters `loading` state immediately (button disabled, loading indicator shown).
2. UI transitions to `success` state and shows a non-sensitive success message.
3. Inspect the browser console — confirm no raw password string is logged.
4. Temporarily trigger a stub error outcome and confirm UI shows a non-sensitive error message.

### Implementation for User Story 3

- [x] T012 [P] [US3] Create `loginService.ts` in `hsoft-web-frontend/hsoft-frontend/src/features/login/services/loginService.ts` implementing `LoginServiceContract` from `specs/001-login-ui-scaffold/contracts/login-service.interface.ts` as a stub: `submitLogin(payload)` returns `{ success: true, session: { reauthRequired: false }, errors: [] }` when `username` and `password` are non-empty, and `{ success: false, errors: [{ code: 'AUTH_FAILED', message: 'Invalid credentials' }] }` otherwise; `loadFacilities()` and `loadLabAreas()` delegate to `facilityService`
- [x] T013 [P] [US3] Create `loginLogger.ts` in `hsoft-web-frontend/hsoft-frontend/src/features/login/services/loginLogger.ts` implementing `logLoginAttempt(event: Omit<LoginAttemptLog, 'occurredAt'>)` that appends a `LoginAttemptLog` entry with the current ISO timestamp to `console.info`; the function MUST explicitly exclude any `password`-key value from the event object before logging
- [x] T014 [US3] Extend `useLoginForm` hook in `hsoft-web-frontend/hsoft-frontend/src/features/login/hooks/useLoginForm.ts` to wire `loginService.submitLogin()` through `SessionBootstrapState` transitions: set status to `loading` on dispatch, guard against duplicate submits by returning early when status is already `loading`, call `logLoginAttempt` on `submit` and on `submit_success` / `submit_error`, and update status and message from the `LoginResponseContract`
- [x] T015 [US3] Update `LoginForm` component in `hsoft-web-frontend/hsoft-frontend/src/features/login/components/LoginForm.tsx` to reflect `SessionBootstrapState`: show a loading indicator and disable the submit button while status is `loading`; show a non-sensitive success message when status is `success`; show a non-sensitive error message (from `session.message` or the first `errors[0].message`) when status is `error`

**Checkpoint**: All three user stories are complete. The full login flow, validation, and service stubs are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Style cleanup, legacy Vite demo removal, and final verification against the quickstart.

- [x] T016 [P] Replace Vite demo styles in `hsoft-web-frontend/hsoft-frontend/src/App.css` with login page shell styles: remove `.hero`, `.counter`, `#next-steps`, `#docs`, `#social`, `#spacer`, `.ticks` rule blocks; add a minimal outer page layout that centers the login card vertically and horizontally
- [x] T017 [P] Update `hsoft-web-frontend/hsoft-frontend/src/index.css`: replace or extend the existing CSS custom properties with variables for form input borders, focus rings, error-state colors, disabled-button opacity, and a neutral background suitable for a hospital workstation context
- [x] T018 Run `npm run build` and `npm run lint` in `hsoft-web-frontend/hsoft-frontend`, then open the dev server browser view and complete the manual verification checklist in `specs/001-login-ui-scaffold/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user stories**.
- **US1 (Phase 3)**: Depends on Foundational completion.
- **US2 (Phase 4)**: Depends on US1 completion (needs `LoginForm` component and `useLoginForm` hook structure to build validation into).
- **US3 (Phase 5)**: Depends on US2 completion (needs the validated `LoginFormState` and `LoginForm` state props to be wired before adding full state machine).
- **Polish (Phase 6)**: Depends on all user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational — no dependency on other stories.
- **US2 (P2)**: Depends on US1; validation builds directly on the `LoginForm` component and types introduced in US1.
- **US3 (P3)**: Depends on US2; completes the service contract, state machine, and logging that require the validated form state from US2.

### Within Each Phase

- Models/types before services and components.
- Services can be developed in parallel with components when they are independent files.
- Hook (`useLoginForm`) evolves across phases: stubbed in Phase 2 (foundational state), extended in US2 (validation), completed in US3 (state machine + service wiring).
- `LoginForm` component evolves similarly: skeleton (US1) → field errors (US2) → state feedback (US3).

### Parallel Opportunities

- **Phase 1**: T001 and T002 can run in parallel.
- **Phase 3**: T005 (facility service) and T006 (LoginForm skeleton) can run in parallel once T003 types exist.
- **Phase 5**: T012 (loginService stub) and T013 (loginLogger) can run in parallel before T014.
- **Phase 6**: T016 (App.css cleanup) and T017 (index.css variables) can run in parallel.

---

## Parallel Example: User Story 3

```bash
# Once US2 is complete, start T012 and T013 in parallel:
Task T012: "Create loginService.ts in .../services/loginService.ts implementing LoginServiceContract"
Task T013: "Create loginLogger.ts in .../services/loginLogger.ts"

# After T012 and T013 complete, continue with T014 then T015:
Task T014: "Extend useLoginForm hook — wire submitLogin() through SessionBootstrapState"
Task T015: "Update LoginForm component to reflect SessionBootstrapState"
```

---

## Implementation Strategy

### MVP First — User Story 1 Only (Phases 1–3)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (types + App shell).
3. Complete Phase 3: User Story 1 (all five fields, dependent options, basic layout).
4. **STOP and VALIDATE**: `npm run dev` → confirm screen and option loading work.
5. Proceed to US2 polish or deploy demo.

### Incremental Delivery

1. Phase 1 + Phase 2 → shared foundation ready.
2. Phase 3 (US1) → login screen with options → validate and demo (MVP).
3. Phase 4 (US2) → validation and submit blocking → validate independently.
4. Phase 5 (US3) → full stub service + state machine → validate independently.
5. Phase 6 → polish, cleanup, quickstart sign-off → ready for backend integration.

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 18 |
| Setup tasks | 2 (T001–T002) |
| Foundational tasks | 2 (T003–T004) |
| US1 tasks | 4 (T005–T008) |
| US2 tasks | 3 (T009–T011) |
| US3 tasks | 4 (T012–T015) |
| Polish tasks | 3 (T016–T018) |
| Parallelizable tasks [P] | 9 (T002, T005, T006, T009, T012, T013, T016, T017, and T001+T002 together) |
| Test tasks | 0 (not requested) |
| MVP scope | Phases 1–3 (User Story 1) — 8 tasks |
| Frontend files changed | `App.tsx`, `App.css`, `index.css` (3 existing) |
| Frontend files added | `login.types.ts`, `LoginForm.tsx`, `useLoginForm.ts`, `facilityService.ts`, `loginService.ts`, `loginLogger.ts`, `LoginForm.css` (7 new) |
| Backend files changed | None — backend stays unchanged in this phase |
