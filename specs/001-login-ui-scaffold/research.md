# Research: LIS Login UI Scaffold

## Decision 1: Use manual browser verification plus build/lint for this phase

- Decision: Validate the UI scaffold with `npm run build`, `npm run lint`, and manual browser walkthroughs against the spec instead of introducing a test framework in the same feature.
- Rationale: The frontend currently has no test dependencies or test script, and this feature is explicitly UI-only with placeholder services. Adding Vitest and React Testing Library here would expand scope beyond the requested scaffold.
- Alternatives considered: Add Vitest now. Rejected because the repository does not yet include test tooling and the immediate requirement is to produce the screen and replaceable service boundaries, not establish the full testing stack.

## Decision 2: Keep the login flow inside the existing app root with feature-local modules

- Decision: Replace the Vite starter content in `App.tsx`, keep the app single-screen for now, and add login-specific code under `src/features/login`.
- Rationale: The current frontend has no router, no global auth state, and no existing page structure. A feature-local module tree keeps the implementation organized without introducing routing or state-management dependencies prematurely.
- Alternatives considered: Add React Router and a dedicated pages layout now. Rejected because there are no protected routes yet and the user asked for UI-first scaffolding only.

## Decision 3: Treat this feature as Manual LIS mode

- Decision: Model the login screen as the entry surface for Manual LIS operation and keep analyzer integration entirely out of scope.
- Rationale: Constitution 3.3.0 formally supports manual and analyzer-integrated operation. The login feature is upstream of any analyzer workflow and should not hard-code device assumptions.
- Alternatives considered: Prepare device-aware login/session bootstrapping. Rejected because analyzer-specific requirements do not apply before authentication and would add unnecessary complexity.

## Decision 4: Define both frontend service contracts and future GraphQL contracts

- Decision: Create a small contract set containing a future GraphQL schema sketch, a TypeScript service interface, and a human-readable contract guide.
- Rationale: The frontend needs replaceable method boundaries now, while the backend currently has no auth module. Documenting both sides reduces redesign risk when GraphQL auth is added later.
- Alternatives considered: Document only TypeScript interfaces. Rejected because the backend already follows Apollo GraphQL patterns, so capturing the likely GraphQL shape now improves handoff quality.

## Decision 5: Include session-expiration and re-auth placeholders in the UI state model

- Decision: Add placeholder session metadata such as expiry time and re-auth requirement to the frontend state contract even though it is not yet enforced visually.
- Rationale: The constitution requires session expiration and re-authentication hooks for protected operations. Adding the fields now prevents a state-model rewrite when backend auth arrives.
- Alternatives considered: Limit the model to a simple success/error flag. Rejected because it would force structural changes during backend integration.
