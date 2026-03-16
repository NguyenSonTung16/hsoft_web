# Contract: LIS Login UI Scaffold

## Purpose

This contract documents the boundary between the new frontend login scaffold and the future backend authentication implementation. The current feature remains UI-only, but the shapes below are treated as stable replacement points so the screen does not need redesign when real GraphQL auth is added.

## Frontend Service Methods

### `loadFacilities()`

- Purpose: Populate the `Co so` selector on screen initialization.
- Current behavior: Returns deterministic placeholder facility options.
- Future backend mapping: `facilityOptions` GraphQL query.

### `loadLabAreas(facilityId)`

- Purpose: Populate the `Khu XN` selector after a facility is chosen.
- Current behavior: Returns deterministic placeholder lab-area options scoped to the selected facility.
- Future backend mapping: `labAreaOptions(facilityId)` GraphQL query.

### `submitLogin(payload)`

- Purpose: Submit validated login data and bootstrap the authenticated session state.
- Current behavior: Returns deterministic mock success or failure without calling the backend.
- Future backend mapping: `login(input)` GraphQL mutation.

## Payload and Response Rules

- `username`, `password`, `facilityId`, `labAreaId`, and `workDate` are required.
- `password` is never logged raw at the UI/service boundary.
- Responses must support `success`, structured `errors`, and placeholder session metadata.
- Session metadata must keep `expiresAt` and `reauthRequired` available for future timeout handling.

## Error Handling Expectations

- Missing required fields are blocked in the UI before `submitLogin` is called.
- Empty facility or lab-area datasets are surfaced as deterministic, non-sensitive UI errors.
- Duplicate submission attempts while a request is pending are ignored or blocked.

## Migration Path

1. Add a real auth module under `hoft-web-backend/src/modules/`.
2. Implement the GraphQL schema in `auth.schema.graphql` as backend SDL/types.
3. Replace the placeholder frontend service implementation with a GraphQL-backed adapter that still satisfies `LoginServiceContract`.
4. Keep the same UI state machine and validation rules unless backend requirements materially change.
