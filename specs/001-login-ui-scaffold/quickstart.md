# Quickstart: LIS Login UI Scaffold

## Goal

Run the frontend locally, replace the starter page with the login scaffold, and verify the UI-only authentication flow using placeholder lookup and login services.

## Prerequisites

- Node.js version compatible with the existing Vite 8 and React 19 setup
- npm available in the shell

## Frontend Setup

1. Change to `D:\vscode\hsoft-project\hsoft-web-frontend\hsoft-frontend`.
2. Install dependencies with `npm install` if they are not already present.
3. Start the development server with `npm run dev`.
4. Open the local Vite URL shown in the terminal.

## Expected Feature Behavior

- The application opens directly to a login screen instead of the Vite demo page.
- The screen shows `Username`, `Password`, `Co so`, `Khu XN`, `Ngay lam viec`, and a submit action.
- `Co so` options load from placeholder data when the screen initializes.
- `Khu XN` options refresh when `Co so` changes.
- The submit action stays disabled or blocked until all required fields are valid.
- Submitting valid data moves the UI through `loading` and then deterministic `success` or `error` placeholder states.

## Manual Verification Checklist

1. Confirm all five required inputs render on first load.
2. Confirm password input is masked.
3. Confirm blank or invalid fields show clear validation messages.
4. Confirm changing `Co so` updates `Khu XN` choices.
5. Confirm repeated submit clicks do not create duplicate pending actions.
6. Confirm error messaging never displays the raw password.

## Quality Commands

- Run `npm run build` to verify the TypeScript/Vite build.
- Run `npm run lint` to verify ESLint compliance.

## Integration Handoff Notes

- Replace the placeholder service implementation behind the documented login service interface.
- Map the real backend to the contract files in `specs/001-login-ui-scaffold/contracts/`.
- Introduce automated frontend tests before wiring the real GraphQL authentication flow.
