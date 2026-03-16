# Feature Specification: LIS Login Backend GraphQL API

**Feature Branch**: `002-lis-login-backend`  
**Created**: 2026-03-16  
**Status**: Draft  
**Input**: User description: "LIS Login Backend using Apollo GraphQL"

## Clarifications

### Session 2026-03-16

- Q: What session expiration policy should be enforced for login sessions? -> A: 7-day sliding session
- Q: Which password hash algorithm should be required for authentication? -> A: Argon2id
- Q: What is the transaction consistency policy for session creation and login-attempt logging? -> A: Atomic — both writes must succeed or both are rolled back; login returns database error on failure
- Q: How should repeated failed login attempts be handled? -> A: Increment FAILED_ATTEMPTS per user; lock account after 5 consecutive failures; require admin unlock to restore access
- Q: What error message policy should be used for credential and scope failures? -> A: Generic uniform message "Invalid username or password" for all credential failures to prevent user enumeration

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Load Login Lookup Data (Priority: P1)

As a LIS user opening the login page, I can load active facilities and then load lab areas for my selected facility so I can prepare a valid login submission.

**Why this priority**: Without lookup data, users cannot choose operational context and cannot proceed to login.

**Independent Test**: Query `loadFacilities` and `loadLabAreas(facilityId)` with valid inputs, confirm only active and facility-matching options are returned.

**Acceptance Scenarios**:

1. **Given** active facilities exist, **When** the frontend requests `loadFacilities`, **Then** it receives facility options with id, code, and name for active facilities only.
2. **Given** a facility is selected, **When** the frontend requests `loadLabAreas(facilityId)`, **Then** it receives only active lab areas tied to that facility.
3. **Given** an unknown or inactive facility identifier, **When** `loadLabAreas` is requested, **Then** the response is an empty list or a clear validation error with no unrelated data exposure.

---

### User Story 2 - Authenticate User Session (Priority: P1)

As a LIS user, I can submit username, password, facility, lab area, and work date and receive a session state when credentials and access scope are valid.

**Why this priority**: This is the gateway to all protected LIS operations.

**Independent Test**: Submit `submitLogin(input)` with valid user credentials and authorized scope, then verify login response includes status, message, session token, re-auth flag, issued time, and expiration time.

**Acceptance Scenarios**:

1. **Given** username/password are valid and user scope includes selected facility and lab area, **When** `submitLogin` is called, **Then** login succeeds and a session state is returned.
2. **Given** username/password are invalid, **When** `submitLogin` is called, **Then** login fails with a clear error message and no active session token.
3. **Given** credentials are valid but selected facility or lab area is unauthorized for that user, **When** `submitLogin` is called, **Then** login fails as unauthorized scope.

---

### User Story 3 - Audit Login Attempts (Priority: P2)

As a system administrator, I can rely on immutable login attempt records for successful and failed authentication events for operational monitoring and security review.

**Why this priority**: Auditability is required for traceability and incident response.

**Independent Test**: Execute one successful and one failed login attempt, then confirm both generate audit records with event details and timestamps.

**Acceptance Scenarios**:

1. **Given** a successful login, **When** authentication completes, **Then** a success attempt log is recorded and linked to the created session.
2. **Given** a failed login, **When** authentication is rejected, **Then** an error attempt log is recorded with failure reason code.

### Edge Cases

- No active facilities exist when login page initializes.
- Selected facility has zero active lab areas.
- Username exists but user account is inactive.
- Password format is valid but hash verification fails.
- User has active account but no active scope for selected facility and lab area.
- Work date is missing, malformed, or outside permitted operational date policy.
- User account reaches the failed-attempt lockout threshold on the final bad credential attempt.
- User account is already locked when a login is submitted; login is rejected immediately without attempting password validation.
- Session insert and attempt-log insert fail as a unit; both are rolled back and login returns a database error response.
- Oracle query timeout or transient database connectivity interruption occurs during login.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose GraphQL query `loadFacilities` that returns active facility options from the facility master data.
- **FR-002**: System MUST expose GraphQL query `loadLabAreas(facilityId)` that returns active lab area options restricted to the requested facility.
- **FR-003**: System MUST expose GraphQL mutation `submitLogin(input)` accepting username, password, facilityId, labAreaId, and workDate.
- **FR-004**: System MUST support interface contracts for `FacilityOption`, `LabAreaOption`, `LoginInput`, `LoginResponse`, and `SessionState`.
- **FR-005**: System MUST verify user identity by locating user account by username and validating the submitted password against stored hash value.
- **FR-006**: System MUST reject authentication if user account is not found, inactive, locked (FAILED_ATTEMPTS reached threshold), or password verification fails.
- **FR-007**: System MUST validate user authorization scope against selected facility and lab area before creating session state.
- **FR-008**: System MUST create a new login session record for successful authentication that includes session token, selected context, and validity window.
- **FR-009**: System MUST log every login submission attempt, including successful and failed outcomes, in immutable attempt records.
- **FR-010**: System MUST return `LoginResponse` with `status: String!` and `message: String!` fields for all `submitLogin` outcomes; on success, MUST populate `session: SessionState` with bearer token, validity timestamps, facility, lab area, and work date; on failure, `session` MUST be null.
- **FR-011**: System MUST return session bootstrap information as a `SessionState` value in the `session` field of `LoginResponse` after successful authentication; `session` MUST be null for all failed authentication outcomes.
- **FR-012**: System MUST not store or log plaintext passwords at any step of authentication or audit.
- **FR-013**: System MUST return a single generic error message ("Invalid username or password") for all credential-related failures — including unknown username, wrong password, inactive account, and locked account — to prevent user enumeration. Unauthorized facility/lab access and database operation failures MUST each return their own distinct error status while similarly avoiding identity disclosure.
- **FR-014**: System MUST avoid unnecessary database calls by using direct lookups and scope checks aligned to existing schema indexes.
- **FR-015**: System MUST define request and response examples for `loadFacilities`, `loadLabAreas`, and `submitLogin` as part of API contract documentation.
- **FR-016**: System MUST define end-to-end sequence flow from client request to GraphQL operation to data store interaction for all login operations.
- **FR-017**: System MUST enforce a 7-day sliding session policy where each authorized request refreshes `expiresAt` by 7 days from the current request time.
- **FR-018**: System MUST use Argon2id for password hash verification and generation for user authentication records.
- **FR-019**: System MUST increment the `FAILED_ATTEMPTS` counter on the user account after each failed password verification and lock the account when the counter reaches 5 consecutive failures, preventing further login attempts until an administrator resets the counter and restores active status.
- **FR-020**: System MUST reset the `FAILED_ATTEMPTS` counter to zero on the user account **within the same atomic database transaction** as session creation, so the reset commits with the session insert or rolls back together on any failure.
- **FR-021**: System MUST expose GraphQL query `refreshSession(sessionToken: ID!)` that validates an active session token and extends `EXPIRES_AT` by 7 days from the current request time, returning the updated `SessionState` (FR-017).

### LIS Workflow Integrity *(mandatory for this project)*

- Impacted canonical chain: this feature gates entry before `registration -> ordering -> collection -> receipt -> analysis -> entry -> approval -> print -> payment`.
- Guard conditions:
  - Transition from login to registration is allowed only when authentication status is successful and session is active.
  - Transition remains blocked when authentication fails, scope validation fails, or session is expired.
- Prohibited bypasses and prevention:
  - Direct access to downstream workflow actions without active session is denied.
  - Facility/lab context switching without valid scope check is denied.

### Access Control and Permission Mapping *(mandatory for this project)*

- Actors in scope: reception staff, lab technician, lab doctor, system admin.
- Critical action mapping:
  - Perform login submission: requires authenticated identity flow initiation (`X`).
  - Access selected facility/lab context after login: requires scope validation (`V`).
  - View available facilities/lab areas on login page: requires active lookup visibility (`S`).
  - Manage user scope assignments: system admin only (`T`, `X`, `S`, `V`, `I`, `E` as assigned by policy).
- Unlock locked user accounts: system admin only (`X`).
- Enforcement locations:
  - Frontend guard: requests session bootstrap only after submit action.
  - Resolver guard: validates input presence and operation-level authorization path.
  - Service guard: enforces password verification and user scope checks before session creation.

### Result Entry Operating Mode *(mandatory for this project)*

- This feature operates in both `Manual LIS` and `Analyzer Integrated LIS` because login is the shared entry gate.
- Result entry behavior is unchanged by this feature; this feature only establishes authenticated session context.
- Approval, audit logging, and workflow integrity rules for result handling remain unchanged across operating modes.

### Audit Logging and Data Lifecycle *(mandatory if feature mutates clinical or access data)*

- Immutable audit events:
  - Login submit attempted.
  - Login submit successful.
  - Login submit failed.
- Required audit payload fields: actor username, occurrence timestamp, selected facility and lab area, event type, error code when failed, session reference when successful.
- Audit coverage includes all authentication attempts and scope rejection outcomes.
- Retention assumption: login attempt logs follow existing operational retention policy for access-audit data and remain queryable for security reviews.

### Authorization and Session Security *(mandatory if feature introduces protected actions)*

- All protected LIS resources require an active session token issued by successful authentication.
- Session validity window uses a 7-day sliding policy and includes issued and expiration timestamps with a re-authentication indicator.
- Re-authentication is required when session is expired, missing, invalid, or flagged by security policy.
- Password verification always compares submitted secret with stored Argon2id hash value; plaintext password persistence is prohibited.
- All credential failure responses (unknown user, wrong password, inactive account, locked account) MUST return an identical generic message to prevent username enumeration attacks.

### Consistency, Performance, and Reporting Integrity *(mandatory if feature touches storage/query/reporting)*

- Session creation and login-attempt logging MUST execute atomically within a single database transaction; if either insert fails, the entire transaction is rolled back and the login operation returns a database error.
- Successful authentication outcomes MUST NOT return a success response unless both the session insert and the attempt-log insert have committed.
- Lookup queries should return stable ordering and active-only records to keep client behavior deterministic.
- Query patterns for facilities, lab areas, user scope, and recent login events must align with existing indexed access paths to support expected login-page responsiveness.

### Privacy, Recovery, and Operations *(mandatory if feature affects compliance/operations)*

- Access data confidentiality controls apply to authentication and session records.
- Operational logs and session records must exclude plaintext secrets.
- Backup and recovery procedures must include session and login-attempt records to support operational traceability.
- Observability must allow operators to detect spikes in login failures, scope-denied attempts, and database-origin authentication errors.

### API Contract Examples

- `loadFacilities` response example:
  - `[ { id, code, name } ]`
- `loadLabAreas(facilityId)` response example:
  - `[ { id, code, name } ]`
- `submitLogin(input)` request example:
  - `{ username, password, facilityId, labAreaId, workDate }`
- `submitLogin` success response example:
  - `{ status: "success", message, session: { sessionToken, reauthRequired, issuedAt, expiresAt, facilityId, labAreaId, workDate } }`
- `submitLogin` failure response example:
  - `{ status: "error", message, session: null }`
- `refreshSession(sessionToken)` response example:
  - `{ sessionToken, reauthRequired, issuedAt, expiresAt, facilityId, labAreaId, workDate }`

### Sequence Flow Expectations

- Login lookup flow:
  - Client requests facilities.
  - GraphQL query resolves active facilities from facility data.
  - Client selects facility and requests lab areas.
  - GraphQL query resolves active lab areas filtered by facility.
- Login submit flow:
  - Client submits login input.
  - GraphQL mutation resolves account lookup and password validation.
  - Authorization scope is checked for selected facility/lab area.
  - On success: session is created, success attempt is logged, and session state is returned.
  - On failure: error attempt is logged and error response is returned.

### Assumptions

- Work date is supplied by the client in valid calendar date format and validated before persistence.
- Session tokens follow a 7-day sliding validity window that is refreshed on authorized activity.
- Existing and newly provisioned user credentials can be represented as Argon2id hashes.
- User scope data is maintained by administrative workflows outside this feature.
- Facility and lab area option lists are expected to be lightweight and suitable for login-time lookup.

### Dependencies

- Active Oracle schema objects for facility, lab area, user account, user scope, session, and login-attempt logging are available.
- Frontend login UI calls operation contracts using the defined query and mutation names.

### Key Entities *(include if feature involves data)*

- **FacilityOption**: Active facility selection item containing id, code, and display name.
- **LabAreaOption**: Active laboratory area selection item tied to one facility.
- **LoginInput**: User-submitted authentication payload containing identity secret and selected operational context.
- **LoginResponse**: Authentication outcome payload containing status, message, and session metadata.
- **SessionState**: Bootstrap session context returned after successful authentication, including token, selected facility, selected lab area, work date, and validity timestamps.
- **UserAccount**: Credential-bearing user identity record with active state and password hash.
- **UserScope**: Authorization mapping between user and allowed facility/lab area combinations.
- **SessionRecord**: Persisted authenticated session state used for access continuity and expiration checks.
- **LoginAttemptLog**: Immutable security event record for login submission outcomes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of login-page initializations receive either a valid facility list or a clear recoverable error outcome within 2 seconds under normal operating load.
- **SC-002**: 100% of lab area responses contain only records that belong to the requested facility and are active.
- **SC-003**: At least 99% of valid login submissions return a session response in under 3 seconds under normal operating load.
- **SC-004**: Failed login submissions produce a non-success response on all rejection paths. Login-attempt audit records are written on a best-effort basis; transient database write errors may result in a missing audit record without affecting the authentication response.
- **SC-005**: 100% of successful login submissions produce both a session record and a success login-attempt audit record.
- **SC-006**: 0 plaintext password values are stored in persistent records or emitted in audit logs.
