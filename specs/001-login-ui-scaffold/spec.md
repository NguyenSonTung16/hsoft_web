# Feature Specification: LIS Login UI Scaffold

**Feature Branch**: `001-login-ui-scaffold`  
**Created**: 2026-03-16  
**Status**: Draft  
**Input**: User description: "Tao giao dien dang nhap gom Username/Password, Co so, Khu XN, Ngay lam viec; chi can giao dien va san phuong thuc de lien ket backend sau nay"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enter Login Information (Priority: P1)

As a LIS user, I can see and fill a login screen with Username, Password, Co so, Khu XN, and Ngay lam viec so I can prepare a valid login request.

**Why this priority**: This is the minimum entry point required before any LIS workflow can start.

**Independent Test**: Open login screen, verify all fields are visible, editable (except intentionally read-only controls), and submit button state responds to form completeness.

**Acceptance Scenarios**:

1. **Given** the user opens the app, **When** the login screen loads, **Then** Username, Password, Co so, Khu XN, Ngay lam viec, and Login action are displayed.
2. **Given** the user enters all required inputs, **When** the form is valid, **Then** the Login action becomes available.

---

### User Story 2 - Validate Inputs Before Submission (Priority: P2)

As a LIS user, I get immediate validation feedback when required inputs are missing or invalid so that I can correct data before login submission.

**Why this priority**: Preventing invalid submissions reduces login failures and support load.

**Independent Test**: Try blank username/password, missing Co so, missing Khu XN, and invalid/empty work date; verify clear validation messages and blocked submit.

**Acceptance Scenarios**:

1. **Given** one or more required fields are empty, **When** the user attempts login, **Then** submission is blocked and field-specific messages are shown.
2. **Given** a valid field set becomes invalid after edits, **When** validation re-runs, **Then** login action is disabled until errors are resolved.

---

### User Story 3 - Backend-Ready Method Stubs (Priority: P3)

As a developer, I have pre-defined frontend method contracts for authentication and lookup data so backend integration can be added later without redesigning the UI flow.

**Why this priority**: It accelerates future integration while keeping this phase UI-only.

**Independent Test**: Trigger each method from UI actions and verify deterministic placeholder responses/states are produced without calling real backend services.

**Acceptance Scenarios**:

1. **Given** the login screen initializes, **When** lookup-loading methods run, **Then** Co so and Khu XN controls are populated from placeholder sources.
2. **Given** login is submitted with valid input, **When** login method stub runs, **Then** request payload shape and success/error placeholder handling are consistent.

### Edge Cases

- Co so has no available options for the current context.
- Selected Co so has no compatible Khu XN values.
- Work date is outside allowed working window.
- Rapid repeated login clicks occur while a request is in progress.
- Lookup-loading fails and later succeeds after retry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a login screen with inputs for Username, Password, Co so, Khu XN, and Ngay lam viec.
- **FR-002**: System MUST treat Username, Password, Co so, Khu XN, and Ngay lam viec as required fields for login submission.
- **FR-003**: System MUST validate field completeness and basic format rules before allowing login submission.
- **FR-004**: System MUST prevent duplicate submissions while a login attempt is in progress.
- **FR-005**: System MUST provide user-visible validation feedback for each invalid field.
- **FR-006**: System MUST include placeholder methods for loading Co so options and Khu XN options.
- **FR-007**: System MUST include a placeholder authentication method that accepts a structured login payload and returns deterministic mock success/failure outcomes.
- **FR-008**: System MUST define UI states for idle, loading, success, and error so backend integration can bind to existing states later.
- **FR-009**: System MUST keep backend integration points encapsulated behind replaceable method contracts so future API wiring does not require UI redesign.
- **FR-010**: System MUST log submission attempts and errors at UI/service boundary in a non-sensitive way (no raw password disclosure).

### LIS Workflow Integrity *(mandatory for this project)*

- Impacted canonical step: this feature governs system entry before `registration -> ordering -> ...` workflow begins.
- Guard condition: user MUST not access workflow modules until authentication succeeds.
- Prohibited bypass: direct navigation to patient/order/specimen/result screens without authenticated session MUST be blocked.

### Access Control and Permission Mapping *(mandatory for this project)*

- Actors in scope: reception staff, laboratory technician, laboratory doctor, system admin.
- Permission model mapping:
  - View login page: pre-auth access allowed only to login UI surface.
  - Access protected modules after login: governed by role and T/X/S/V/I/E model after successful authentication.
- Enforcement points:
  - Frontend guard: block protected routes until authenticated session exists.
  - Service guard: reject submission when required login context is invalid.

### Authorization and Session Security *(mandatory if feature introduces protected actions)*

- Login flow MUST require authenticated identity before any patient/specimen/result data access.
- Session initialization contract MUST support expiration metadata for future enforcement.
- Re-authentication hook MUST be defined for future session renewal and timeout handling.

### Assumptions

- This phase is UI-only and does not call production backend endpoints.
- Co so and Khu XN source data are provided from temporary placeholder datasets.
- Password masking and secure input behavior are part of the UI baseline.
- Detailed authorization checks for specific business modules are out of scope for this feature and will be enforced post-auth in subsequent features.

### Key Entities *(include if feature involves data)*

- **LoginFormState**: Represents current values and validation state for Username, Password, Co so, Khu XN, and Ngay lam viec.
- **FacilityOption (CoSo)**: Represents a selectable operating facility entry.
- **LabAreaOption (KhuXN)**: Represents a selectable laboratory area tied to a facility.
- **LoginRequestDraft**: Represents the structured payload shape that future backend authentication endpoint will consume.
- **SessionBootstrapState**: Represents frontend state transitions for login attempt lifecycle (idle/loading/success/error) with timeout metadata placeholder.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of required login controls (Username, Password, Co so, Khu XN, Ngay lam viec) are visible and interactive on first screen render.
- **SC-002**: At least 95% of invalid form submissions are blocked client-side before request dispatch during test execution.
- **SC-003**: Users can complete a valid login form submission flow in under 30 seconds in usability walkthroughs.
- **SC-004**: Frontend integration stubs for authentication and lookup loading can be replaced by real backend calls without changing the login screen layout or user interaction flow.
