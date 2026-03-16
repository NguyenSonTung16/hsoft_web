# LIS Login Backend Contract

## Operations

### Query: loadFacilities

Request:

```graphql
query LoadFacilities {
  loadFacilities {
    id
    code
    name
  }
}
```

Success response:

```json
{
  "data": {
    "loadFacilities": [
      { "id": "1", "code": "BV-TW", "name": "Central Hospital" },
      { "id": "2", "code": "BV-DA", "name": "Da Nang Hospital" }
    ]
  }
}
```

### Query: loadLabAreas

Request:

```graphql
query LoadLabAreas($facilityId: ID!) {
  loadLabAreas(facilityId: $facilityId) {
    id
    code
    name
  }
}
```

Variables:

```json
{
  "facilityId": "1"
}
```

Success response:

```json
{
  "data": {
    "loadLabAreas": [
      { "id": "11", "code": "HH", "name": "Hematology" },
      { "id": "12", "code": "SH", "name": "Biochemistry" }
    ]
  }
}
```

### Mutation: submitLogin

Request:

```graphql
mutation SubmitLogin($input: LoginInput!) {
  submitLogin(input: $input) {
    status
    message
    session {
      sessionToken
      reauthRequired
      issuedAt
      expiresAt
      facilityId
      labAreaId
      workDate
    }
  }
}
```

Variables:

```json
{
  "input": {
    "username": "labtech01",
    "password": "********",
    "facilityId": "1",
    "labAreaId": "11",
    "workDate": "2026-03-16"
  }
}
```

Success response:

```json
{
  "data": {
    "submitLogin": {
      "status": "success",
      "message": "Login successful",
      "session": {
        "sessionToken": "123e4567-e89b-12d3-a456-426614174000",
        "reauthRequired": false,
        "issuedAt": "2026-03-16T09:30:00.000Z",
        "expiresAt": "2026-03-23T09:30:00.000Z",
        "facilityId": "1",
        "labAreaId": "11",
        "workDate": "2026-03-16"
      }
    }
  }
}
```

Credential failure response:

```json
{
  "data": {
    "submitLogin": {
      "status": "error",
      "message": "Invalid username or password",
      "session": null
    }
  }
}
```

Scope failure response:

```json
{
  "data": {
    "submitLogin": {
      "status": "error",
      "message": "Unauthorized facility or lab area access",
      "session": null
    }
  }
}
```

Database error response:

```json
{
  "data": {
    "submitLogin": {
      "status": "error",
      "message": "Database error",
      "session": null
    }
  }
}
```

### Query: refreshSession

Request:

```graphql
query RefreshSession($sessionToken: ID!) {
  refreshSession(sessionToken: $sessionToken) {
    sessionToken
    reauthRequired
    issuedAt
    expiresAt
    facilityId
    labAreaId
    workDate
  }
}
```

Variables:

```json
{
  "sessionToken": "123e4567-e89b-12d3-a456-426614174000"
}
```

Success response:

```json
{
  "data": {
    "refreshSession": {
      "sessionToken": "123e4567-e89b-12d3-a456-426614174000",
      "reauthRequired": false,
      "issuedAt": "2026-03-16T09:30:00.000Z",
      "expiresAt": "2026-03-23T10:15:00.000Z",
      "facilityId": "1",
      "labAreaId": "11",
      "workDate": "2026-03-16"
    }
  }
}
```

Expired/invalid session response:

```json
{
  "errors": [
    {
      "message": "Session is invalid or expired",
      "extensions": { "code": "UNAUTHENTICATED" }
    }
  ],
  "data": { "refreshSession": null }
}
```

## Audit Event Payloads

### submit_success (LIS_LOGIN_ATTEMPT_LOG)

```json
{
  "EVENT_TYPE": "submit_success",
  "USERNAME": "labtech01",
  "FACILITY_ID": "1",
  "LAB_AREA_ID": "11",
  "SESSION_ID": 2001,
  "ERROR_CODE": null,
  "OCCURRED_AT": "2026-03-16T09:30:00.000Z"
}
```

### submit_error (LIS_LOGIN_ATTEMPT_LOG)

```json
{
  "EVENT_TYPE": "submit_error",
  "USERNAME": "labtech01",
  "FACILITY_ID": "1",
  "LAB_AREA_ID": "11",
  "SESSION_ID": null,
  "ERROR_CODE": "INVALID_PASSWORD",
  "OCCURRED_AT": "2026-03-16T09:31:00.000Z"
}
```

## Sequence Flows

### Login lookup flow

1. Client queries `loadFacilities`.
2. Resolver calls service.
3. Service reads active facilities from `LIS_FACILITY` and returns ordered list.
4. Client selects facility and queries `loadLabAreas(facilityId)`.
5. Service reads active lab areas by facility from `LIS_LAB_AREA`.

### Login submit flow

1. Client sends `submitLogin(input)` with username, password, facility/lab context, workDate.
2. Service reads user account from `LIS_USER_ACCOUNT`.
3. Service validates Argon2id password and lockout state.
4. Service checks scope in `LIS_USER_SCOPE`.
5. On success, service performs one atomic transaction:
   - insert `LIS_SESSION`
   - insert `LIS_LOGIN_ATTEMPT_LOG` with `submit_success`
   - reset `FAILED_ATTEMPTS` and update `LAST_LOGIN_AT`
6. On pre-auth rejection paths, service writes `submit_error` audit as best effort.

### Session refresh flow

1. Client sends `refreshSession(sessionToken)` on authenticated activity.
2. Service checks active, non-expired session in `LIS_SESSION`.
3. Service updates `EXPIRES_AT` to now + 7 days.
4. Service returns refreshed `SessionState`.

## Security Policy

- Password verification uses Argon2id only.
- Credential failure message is always `Invalid username or password` to prevent user enumeration.
- Account is locked when `FAILED_ATTEMPTS >= 5` and requires admin unlock.
- Session validity uses a 7-day sliding policy via `refreshSession`.
- Audit logging is best effort for `submit_error` paths.
- Plaintext passwords are never stored and are not written to audit logs.
