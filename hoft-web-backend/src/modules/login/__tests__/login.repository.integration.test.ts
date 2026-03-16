import assert from "node:assert/strict";
import test from "node:test";

import { LoginRepository } from "../login.repository";

const runIntegration = process.env.RUN_ORACLE_INTEGRATION_TESTS === "true";

test(
  "repository can load facilities from Oracle",
  { skip: !runIntegration },
  async () => {
    const repository = new LoginRepository();
    const facilities = await repository.loadFacilities();

    assert.ok(Array.isArray(facilities));
    for (const row of facilities) {
      assert.ok(typeof row.ID === "string");
      assert.ok(typeof row.CODE === "string");
      assert.ok(typeof row.NAME === "string");
    }
  }
);
