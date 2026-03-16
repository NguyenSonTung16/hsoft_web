import assert from "node:assert/strict";
import test from "node:test";

import { createGraphQLContextBuilder, extractBearerToken } from "../index";

test("extractBearerToken returns undefined for invalid auth header", () => {
  assert.equal(extractBearerToken(undefined), undefined);
  assert.equal(extractBearerToken("Basic abc"), undefined);
  assert.equal(extractBearerToken("Bearer   "), undefined);
});

test("extractBearerToken returns token for bearer auth header", () => {
  assert.equal(extractBearerToken("Bearer token-1"), "token-1");
});

test("context builder resolves context from data-access adapter", async () => {
  let capturedToken: string | undefined;

  const contextBuilder = createGraphQLContextBuilder({
    authContextDataAccess: {
      resolveServerAuthContext: async (sessionToken?: string) => {
        capturedToken = sessionToken;
        return {
          sessionToken: "token-1",
          sessionId: "s1",
          userId: "u1",
          roleCodes: ["lab_technician"],
          facilityScope: { facilityId: "f1", labAreaId: "l1" },
        };
      },
    },
    securityLogger: {
      warn: () => undefined,
      error: () => undefined,
    },
  });

  const context = await contextBuilder({
    req: {
      headers: {
        authorization: "Bearer token-1",
      },
    },
  });

  assert.equal(capturedToken, "token-1");
  assert.equal(context.userId, "u1");
  assert.deepEqual(context.roleCodes, ["lab_technician"]);
});

test("context builder ignores client role header and logs warning", async () => {
  let warned = false;

  const contextBuilder = createGraphQLContextBuilder({
    authContextDataAccess: {
      resolveServerAuthContext: async () => ({ roleCodes: [] }),
    },
    securityLogger: {
      warn: (event) => {
        if (event === "security.role_header_ignored") {
          warned = true;
        }
      },
      error: () => undefined,
    },
  });

  await contextBuilder({
    req: {
      headers: {
        authorization: "Bearer token-1",
        "x-role-codes": "system_admin",
      },
    },
  });

  assert.equal(warned, true);
});

test("context builder returns login_entry role when bearer token is missing", async () => {
  const contextBuilder = createGraphQLContextBuilder({
    authContextDataAccess: {
      resolveServerAuthContext: async () => ({ roleCodes: [] }),
    },
    securityLogger: {
      warn: () => undefined,
      error: () => undefined,
    },
  });

  const context = await contextBuilder({
    req: {
      headers: {},
    },
  });

  assert.deepEqual(context, { roleCodes: ["login_entry"] });
});

test("context builder returns login_entry role when token is invalid", async () => {
  const contextBuilder = createGraphQLContextBuilder({
    authContextDataAccess: {
      resolveServerAuthContext: async () => ({ roleCodes: [] }),
    },
    securityLogger: {
      warn: () => undefined,
      error: () => undefined,
    },
  });

  const context = await contextBuilder({
    req: {
      headers: {
        authorization: "Bearer stale-token",
      },
    },
  });

  assert.deepEqual(context, { roleCodes: ["login_entry"] });
});

test("context builder returns login_entry role when adapter throws", async () => {
  let errored = false;

  const contextBuilder = createGraphQLContextBuilder({
    authContextDataAccess: {
      resolveServerAuthContext: async () => {
        throw new Error("DB down");
      },
    },
    securityLogger: {
      warn: () => undefined,
      error: (event) => {
        if (event === "security.context_resolution_failed") {
          errored = true;
        }
      },
    },
  });

  const context = await contextBuilder({
    req: {
      headers: {
        authorization: "Bearer token-1",
      },
    },
  });

  assert.equal(errored, true);
  assert.deepEqual(context, { roleCodes: ["login_entry"] });
});
