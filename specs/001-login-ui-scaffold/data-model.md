# Data Model: LIS Login UI Scaffold

## 1. LoginFormState

Represents the current editable state of the login form and field-level validation results.

| Field | Type | Required | Notes |
|------|------|----------|-------|
| username | string | Yes | Trimmed for validation; displayed as entered |
| password | string | Yes | Masked in UI; never logged raw |
| facilityId | string | Yes | Selected `Co so` value |
| labAreaId | string | Yes | Selected `Khu XN` value dependent on `facilityId` |
| workDate | string | Yes | ISO-like date string for frontend input control |
| touched | Record<string, boolean> | No | Tracks whether a field has been interacted with |
| errors | Record<string, string> | No | Field-specific validation feedback |

Validation rules:

- `username` must be non-empty.
- `password` must be non-empty.
- `facilityId` must match one of the loaded facility options.
- `labAreaId` must match one of the lab-area options available for the selected facility.
- `workDate` must be present and parse as a valid work date accepted by the UI rules.

## 2. FacilityOption

Represents an operating facility (`Co so`) available at login time.

| Field | Type | Required | Notes |
|------|------|----------|-------|
| id | string | Yes | Stable frontend/backend lookup key |
| code | string | Yes | Human-recognizable LIS facility code |
| name | string | Yes | Display label in the UI |
| isActive | boolean | Yes | Allows future filtering without UI redesign |

Relationships:

- One `FacilityOption` can expose many `LabAreaOption` values.

## 3. LabAreaOption

Represents a laboratory area (`Khu XN`) available for a selected facility.

| Field | Type | Required | Notes |
|------|------|----------|-------|
| id | string | Yes | Stable lookup key |
| facilityId | string | Yes | Parent facility reference |
| code | string | Yes | Internal or semi-internal LIS area code |
| name | string | Yes | Display label in the UI |
| isActive | boolean | Yes | Allows future deactivation/filtering |

Relationships:

- Many `LabAreaOption` records belong to one `FacilityOption`.

## 4. LoginRequestDraft

Represents the structured payload passed from UI state to the authentication service boundary.

| Field | Type | Required | Notes |
|------|------|----------|-------|
| username | string | Yes | Sanitized input string |
| password | string | Yes | Sensitive field; excluded from logs |
| facilityId | string | Yes | Selected operating facility |
| labAreaId | string | Yes | Selected laboratory area |
| workDate | string | Yes | Working date used to bootstrap session context |

Validation rules:

- Built only when `LoginFormState` has no blocking validation errors.
- Must not be emitted more than once while submission is pending.

## 5. SessionBootstrapState

Tracks login-attempt lifecycle and future session metadata.

| Field | Type | Required | Notes |
|------|------|----------|-------|
| status | `idle | loading | success | error` | Yes | Primary UI state machine |
| message | string | No | Non-sensitive status or error message |
| sessionToken | string | No | Placeholder only in this phase |
| expiresAt | string | No | Future session-expiration hook |
| reauthRequired | boolean | Yes | Future timeout/re-auth hook |
| lastAttemptAt | string | No | Non-sensitive attempt tracking |

State transitions:

- `idle -> loading`: user submits a valid form.
- `loading -> success`: placeholder auth service returns a success payload.
- `loading -> error`: placeholder auth service returns a failure payload.
- `error -> loading`: user retries with valid data.
- `success -> idle`: reserved for future logout/reset handling.

## 6. LoginAttemptLog

Represents non-sensitive UI/service boundary logging for troubleshooting.

| Field | Type | Required | Notes |
|------|------|----------|-------|
| occurredAt | string | Yes | Timestamp of the attempt or failure |
| eventType | `lookup_load | submit | submit_success | submit_error` | Yes | Categorized event type |
| username | string | No | Optional sanitized identifier if policy allows |
| facilityId | string | No | Context only |
| labAreaId | string | No | Context only |
| errorCode | string | No | Deterministic placeholder error identifier |

Validation rules:

- Must never contain raw password data.
- Must remain on the frontend/service boundary only in this phase.

## Relationship Summary

- `FacilityOption 1 -> many LabAreaOption`
- `LoginFormState -> LoginRequestDraft` when validation passes
- `LoginRequestDraft -> SessionBootstrapState` through the authentication service boundary
- `SessionBootstrapState` and `LoginAttemptLog` capture the login lifecycle without exposing clinical data
