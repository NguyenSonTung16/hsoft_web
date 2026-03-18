/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";

import { validateLoginForm } from "../useLoginForm";
import type { LoginFormState } from "../../types/login.types";

function buildForm(overrides: Partial<LoginFormState> = {}): LoginFormState {
  return {
    username: "",
    password: "",
    facilityId: "",
    labAreaId: "",
    workDate: "",
    touched: {},
    errors: {},
    ...overrides,
  };
}

test("validateLoginForm returns required-field errors", () => {
  const errors = validateLoginForm(buildForm());

  assert.ok(errors.username);
  assert.ok(errors.password);
  assert.ok(errors.facilityId);
  assert.ok(errors.labAreaId);
  assert.ok(errors.workDate);
});

test("validateLoginForm returns empty error map for valid input", () => {
  const errors = validateLoginForm(
    buildForm({
      username: "demo",
      password: "secret",
      facilityId: "f1",
      labAreaId: "l1",
      workDate: "2026-03-18",
    })
  );

  assert.deepEqual(errors, {});
});
