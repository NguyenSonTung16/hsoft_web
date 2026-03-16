# Tasks: LIS Login Backend GraphQL API

**Input**: Design documents from `/specs/002-lis-login-backend/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md)
**Branch**: `002-lis-login-backend`

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label — US1, US2, US3
- Exact file paths included in every task

---

## Phase 1: Setup

**Purpose**: Install the only new external dependency (`argon2`) so all later phases can
import it. No files in the login module are touched here.

- [x] T001 Add `argon2` to dependencies in `hoft-web-backend/package.json` and run `npm install` inside `hoft-web-backend/` to enable Argon2id hash verification (FR-018)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared TypeScript interfaces and the complete GraphQL SDL must exist before
any service or resolver work can begin. These two files have no mutual dependency and
can be written in parallel.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 [P] Create `hoft-web-backend/src/modules/login/login.types.ts` — define internal TypeScript interfaces: `LoginServiceInput` (username, password, facilityId, labAreaId, workDate), `SessionState` (sessionToken, reauthRequired, issuedAt, expiresAt, facilityId, labAreaId, workDate), `LoginServiceResult` (status, message, session?: SessionState), `UserAccountRow` (id, passwordHash, isActive, failedAttempts)
- [x] T003 [P] Create `hoft-web-backend/src/modules/login/login.schema.ts` — define GraphQL SDL template-literal string exporting `loginSchema` with: type `FacilityOption { id, code, name }`, type `LabAreaOption { id, code, name }`, type `SessionState { sessionToken: String!, reauthRequired: Boolean!, issuedAt: String!, expiresAt: String!, facilityId: ID!, labAreaId: ID!, workDate: String! }`, input `LoginInput { username, password, facilityId, labAreaId, workDate }`, type `LoginResponse { status: String!, message: String!, session: SessionState }`, queries `loadFacilities: [FacilityOption!]!`, `loadLabAreas(facilityId: ID!): [LabAreaOption!]!`, and `refreshSession(sessionToken: ID!): SessionState`; mutation `submitLogin(input: LoginInput!): LoginResponse!` (FR-004, FR-011, FR-021)

**Checkpoint**: Types and schema ready — user story service and resolver work can now begin.

---

## Phase 3: User Story 1 — Load Login Lookup Data (Priority: P1) 🎯 MVP

**Goal**: Frontend login page can query active facilities and — after facility selection —
active lab areas for that facility. Delivers a complete, independently testable API slice.

**Independent Test**: Run `loadFacilities` in Apollo Sandbox → receives BV-TW, BV-DA,
PK-QT facility rows. Run `loadLabAreas(facilityId: "<BV-TW id>")` → receives only HH,
SH, VS. Run `loadLabAreas` with an unknown facilityId → receives empty list.

- [x] T004 [P] [US1] Implement `loadFacilities()` in `hoft-web-backend/src/modules/login/login.service.ts` — open Oracle connection via `getConnection()`, execute `SELECT ID, CODE, NAME FROM LIS_FACILITY WHERE IS_ACTIVE='Y' ORDER BY NAME`, close connection in finally block, return `LoginServiceResult`-compatible array (FR-001, SC-001)
- [x] T005 [P] [US1] Implement `loadLabAreas(facilityId: string)` in `hoft-web-backend/src/modules/login/login.service.ts` — open connection, execute `SELECT ID, CODE, NAME FROM LIS_LAB_AREA WHERE FACILITY_ID = :1 AND IS_ACTIVE='Y' ORDER BY NAME` with bound parameter to prevent SQL injection, close connection in finally block, return array (FR-002, SC-002)
- [x] T006 [US1] Create `hoft-web-backend/src/modules/login/login.resolver.ts` — export `loginResolver` object with `Query.loadFacilities` calling `service.loadFacilities()` and `Query.loadLabAreas` calling `service.loadLabAreas(args.facilityId)` with guard that rejects missing `facilityId`
- [x] T007 [US1] Update `hoft-web-backend/src/graphql/index.ts` — import `loginSchema` from `../modules/login/login.schema` and `loginResolver` from `../modules/login/login.resolver`; append both to the existing `typeDefs` and `resolvers` arrays (no other changes to this file)

**Checkpoint**: `loadFacilities` and `loadLabAreas` operations are fully functional and independently testable via Apollo Sandbox at `http://localhost:3000/graphql`.

---

## Phase 4: User Story 2 — Authenticate User Session (Priority: P1)

**Goal**: User submits credentials and context; backend validates identity, scope, creates
a session record with a 7-day expiry, and returns a full `LoginResponse` including
session token and bootstrap state.

**Independent Test**: `submitLogin` with valid admin credentials and scope returns
`status: "success"`, non-null `sessionToken`, `issuedAt`, and `expiresAt` (7 days ahead).
`submitLogin` with wrong password returns `status: "error"` with generic message and null
`sessionToken`.

- [x] T008 [US2] Implement submitLogin steps 1–2 in `hoft-web-backend/src/modules/login/login.service.ts` — look up user by username (`SELECT ID, PASSWORD_HASH, IS_ACTIVE, FAILED_ATTEMPTS FROM LIS_USER_ACCOUNT WHERE USERNAME = :1`); if no row, `IS_ACTIVE='N'`, or `FAILED_ATTEMPTS >= 5` return `LoginResponse { status:"error", message:"Invalid username or password" }` without revealing which condition matched (FR-006, FR-013 anti-enumeration); on row found run `argon2.verify(row.PASSWORD_HASH, input.password)`; on mismatch increment `FAILED_ATTEMPTS` with a separate `UPDATE … SET FAILED_ATTEMPTS = FAILED_ATTEMPTS + 1` (autoCommit true); if new count reaches 5 also set `IS_ACTIVE='N'` in same UPDATE to lock the account (FR-019); return generic error response (FR-013)
- [x] T009 [US2] Implement submitLogin step 3 in `hoft-web-backend/src/modules/login/login.service.ts` — check authorization scope: `SELECT COUNT(*) FROM LIS_USER_SCOPE WHERE USER_ID=:1 AND FACILITY_ID=:2 AND LAB_AREA_ID=:3 AND IS_ACTIVE='Y'`; if count is 0 return `LoginResponse { status:"error", message:"Unauthorized facility or lab area access" }` (FR-007, FR-013)
- [x] T010 [US2] Implement submitLogin steps 4–5 in `hoft-web-backend/src/modules/login/login.service.ts` — generate `sessionToken = crypto.randomUUID()`; set `issuedAt = new Date()` and `expiresAt = new Date(issuedAt.getTime() + 7 * 24 * 60 * 60 * 1000)`; open connection with `autoCommit: false`; INSERT into `LIS_SESSION` (SESSION_TOKEN, USER_ID, FACILITY_ID, LAB_AREA_ID, WORK_DATE, STATUS='success', ISSUED_AT, EXPIRES_AT); INSERT into `LIS_LOGIN_ATTEMPT_LOG` (EVENT_TYPE='submit_success', USERNAME, FACILITY_ID, LAB_AREA_ID, SESSION_ID); UPDATE `LIS_USER_ACCOUNT SET FAILED_ATTEMPTS=0, LAST_LOGIN_AT=SYSTIMESTAMP WHERE ID=:1` — **inside the same `autoCommit:false` transaction** (FR-020); on any error call `connection.rollback()` and return `LoginResponse { status:"error", message:"Database error" }`; on success call `connection.commit()` and return `LoginResponse { status:"success", session: SessionState }` with all session fields populated (FR-008, FR-010, FR-011, FR-017)
- [x] T011 [US2] Add `Mutation.submitLogin` to `hoft-web-backend/src/modules/login/login.resolver.ts` — validate that `args.input` contains all required fields (username, password, facilityId, labAreaId, workDate); call `service.submitLogin(args.input)`; return result directly as `LoginResponse`

- [x] T017 [US2] Implement session refresh in `hoft-web-backend/src/modules/login/login.service.ts` and `login.resolver.ts` — add `refreshSession(sessionToken: string): SessionState | null` in service: query `SELECT * FROM LIS_SESSION WHERE SESSION_TOKEN=:1 AND STATUS='success' AND EXPIRES_AT > SYSTIMESTAMP`; if found UPDATE `LIS_SESSION SET EXPIRES_AT = SYSTIMESTAMP + INTERVAL '7' DAY WHERE SESSION_TOKEN=:1` with `autoCommit:true`; return updated `SessionState`; add `Query.refreshSession(sessionToken: ID!)` resolver entry that calls service and throws `UNAUTHENTICATED` on missing/expired token; manually test: call `refreshSession` with an active token and confirm `expiresAt` is 7 days from now (FR-017, FR-021)

**Checkpoint**: `submitLogin` and `refreshSession` are end-to-end functional. Valid credentials produce a session record in `LIS_SESSION` with all three atomic writes committed. `refreshSession` extends a live session's `expiresAt` by 7 days. Invalid credentials return the generic error. Account locks after 5 failures.

---

## Phase 5: User Story 3 — Audit Login Attempts (Priority: P2)

**Goal**: Every login submission — successful or failed, at any rejection stage — produces
an immutable record in `LIS_LOGIN_ATTEMPT_LOG` with correct `EVENT_TYPE` and `ERROR_CODE`
so administrators can monitor and investigate authentication events.

**Independent Test**: Execute one successful and one failed `submitLogin`; query
`LIS_LOGIN_ATTEMPT_LOG` directly and confirm: success row has `EVENT_TYPE='submit_success'`
and non-null `SESSION_ID`; failure row has `EVENT_TYPE='submit_error'` and non-null
`ERROR_CODE`. Confirm no row exists without one of the two event types.

- [x] T012 [US3] Add best-effort `INSERT INTO LIS_LOGIN_ATTEMPT_LOG(EVENT_TYPE='submit_error', USERNAME, FACILITY_ID, LAB_AREA_ID, ERROR_CODE)` for all pre-auth rejection paths in `hoft-web-backend/src/modules/login/login.service.ts` — use a new autoCommit connection so the log insert is independent of any transaction state; set `ERROR_CODE='USER_NOT_FOUND'` for unknown username, `ERROR_CODE='ACCOUNT_INACTIVE'` for inactive/locked account, `ERROR_CODE='INVALID_PASSWORD'` for hash mismatch (FR-009; best-effort: swallow insert errors to never block the auth response)
- [x] T013 [US3] Add best-effort `INSERT INTO LIS_LOGIN_ATTEMPT_LOG(EVENT_TYPE='submit_error', USERNAME, FACILITY_ID, LAB_AREA_ID, ERROR_CODE='UNAUTHORIZED_SCOPE')` for the scope-check rejection path in `hoft-web-backend/src/modules/login/login.service.ts` — same best-effort autoCommit pattern as T012 (FR-009, SC-004)
- [x] T014 [US3] Verify atomicity contract in `hoft-web-backend/src/modules/login/login.service.ts` — confirm the `LIS_SESSION` INSERT, `LIS_LOGIN_ATTEMPT_LOG(submit_success)` INSERT, and `LIS_USER_ACCOUNT SET FAILED_ATTEMPTS=0` UPDATE all share the same `autoCommit:false` connection so all three writes commit or roll back together; add a code comment documenting the atomic boundary explicitly (FR-Q3, FR-020, SC-005)

**Checkpoint**: All 3 user stories are independently functional. Both `submit_success` and `submit_error` log paths are exercised and produce complete `LIS_LOGIN_ATTEMPT_LOG` rows.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: TypeScript compilation gate and startup smoke-test to confirm all new code
integrates cleanly with existing server wiring before deployment.

- [x] T015 [P] Run `npx tsc --noEmit` inside `hoft-web-backend/` to confirm zero TypeScript strict-mode errors across the new login module and the updated `src/graphql/index.ts`
- [x] T016 [P] Start backend with `npm run start:dev` inside `hoft-web-backend/` and confirm Apollo Server starts without errors; open `http://localhost:3000/graphql` and verify `loadFacilities`, `loadLabAreas`, and `submitLogin` appear in the schema explorer

---
- [x] T020 [P] Create `specs/002-lis-login-backend/contracts/contract.md` — document API request/response examples for `loadFacilities`, `loadLabAreas`, `submitLogin` (success and error variants), and `refreshSession`; include audit event payload field structure for `submit_success` and `submit_error` log records in `LIS_LOGIN_ATTEMPT_LOG` (FR-015, FR-009)
- [x] T021 [P] Create `specs/002-lis-login-backend/contracts/auth.schema.graphql` with the final SDL for all login types and operations; extend `contract.md` with end-to-end sequence flow (text-based) for login-lookup, login-submit, and session-refresh flows; add security policy section covering Argon2id, 5-attempt lockout, 7-day sliding session, and best-effort audit logging (FR-016)
- [x] T022 [P] Harden resolver authorization policy in `hoft-web-backend/src/modules/login/login.resolver.ts` and `hoft-web-backend/src/graphql/index.ts` — enforce role-based checks for protected session refresh operations using request context role codes while preserving public login entry operations (Constitution Principle II, XVI)
- [x] T023 [P] Align critical transaction governance with constitution by updating `hoft-web-backend/src/modules/login/login.repository.ts` and `hoft-web-backend/src/database/login_procedures.sql` to call `pkg_xetnghiem.LIS_SUBMIT_LOGIN_TXN`; extend resolver tests in `hoft-web-backend/src/modules/login/__tests__/login.resolver.test.ts` for role-check coverage

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Can start in parallel with Phase 1 (no argon2 import in types/schema files); BLOCKS Phases 3–5
- **Phase 3 (US1)**: Depends on Phase 2 completion (T002, T003 must exist)
- **Phase 4 (US2)**: Depends on Phase 3 completion (resolver file T006 must exist to extend with submitLogin; argon2 from T001 must be installed)
- **Phase 5 (US3)**: Depends on Phase 4 completion (audit inserts are additions to the submitLogin service function from T008–T010)
- **Phase 6 (Polish)**: Depends on Phase 5 completion

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 — no dependency on US2 or US3
- **US2 (P1)**: Starts after US1 resolver exists (T006) — extends the same resolver file
- **US3 (P2)**: Starts after US2 service function exists (T008–T010) — adds error-path audit inserts to the same function

### Within Each User Story

- T004 and T005 are parallel (different service functions)
- T006 (resolver) depends on T004 + T005 (service functions must exist to call)
- T007 (Apollo wiring) depends on T006 (resolver must be created first)
- T008 → T009 → T010 are sequential (each step feeds the next within submitLogin)
- T011 depends on T008–T010 (full service function must exist before resolver wires it)
- T012 and T013 are parallel (different rejection paths, same function)
- T014 is a verification of T010's code (can run alongside T012/T013)
- T017 depends on T011 (resolver file and service must exist); adds `refreshSession` as a new independent operation alongside `submitLogin` in the same files

---

## Parallel Execution Examples

### Phase 2 — run together

```
Task T002: Create login.types.ts
Task T003: Create login.schema.ts
```

### Phase 3 (US1) — run together after Phase 2

```
Task T004: Implement loadFacilities() in login.service.ts
Task T005: Implement loadLabAreas() in login.service.ts
```

### Phase 5 (US3) — run together after Phase 4

```
Task T012: Add submit_error audit logs for pre-auth failures in login.service.ts
Task T013: Add submit_error audit log for scope failure in login.service.ts
Task T014: Verify atomic boundary comment in login.service.ts
```

### Phase 6 — run together after Phase 5

```
Task T015: Run tsc --noEmit
Task T016: Start server and verify schema
```

```
Task T020: Create contract.md (FR-015 request/response examples + audit event payloads)
Task T021: Create auth.schema.graphql + extend contract.md with sequence flows and security policy (FR-016)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Install argon2
2. Complete Phase 2: Create types + schema (foundational — blocks US1)
3. Complete Phase 3: US1 — loadFacilities + loadLabAreas
4. **STOP and VALIDATE**: Query both operations in Apollo Sandbox
5. Frontend can now wire real facility and lab area lookups

### Incremental Delivery

1. Setup + Foundational → Shared types and schema ready
2. US1 (Phase 3) → Facility and lab area lookup operational → **Demo to frontend team**
3. US2 (Phase 4) → Full authentication + session creation operational → **Demo login flow**
4. US3 (Phase 5) → Audit trail complete → **Security review ready**
5. Polish (Phase 6) → TypeScript clean + server smoke-tested → **Ready for integration**

---

## Summary

| Phase | Tasks | Story | Parallelizable |
|-------|-------|-------|----------------|
| 1 Setup | T001 | — | No |
| 2 Foundational | T002–T003 | — | T002 ‖ T003 |
| 3 US1 (P1) MVP | T004–T007 | US1 | T004 ‖ T005 |
| 4 US2 (P1) | T008–T011 | US2 | Sequential |
| 4 US2 (P1) | T017 | US2 | After T011 |
| 5 US3 (P2) | T012–T014 | US3 | T012 ‖ T013 ‖ T014 |
| 6 Polish | T015–T016, T020–T021 | — | T015 ‖ T016 ‖ T020 ‖ T021 |

**Total tasks**: 19  
**Tasks for US1**: 4 (T004–T007)  
**Tasks for US2**: 5 (T008–T011, T017)  
**Tasks for US3**: 3 (T012–T014)  
**Parallel opportunities identified**: 5 batches (Phase 2, Phase 3 service, Phase 5, Phase 6 technical, Phase 6 docs)  
**Suggested MVP scope**: Phases 1–3 only (US1 — facility and lab area lookups)
