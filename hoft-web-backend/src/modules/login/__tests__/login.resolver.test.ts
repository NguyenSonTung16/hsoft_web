import assert from "node:assert/strict";
import test from "node:test";

import { GraphQLError } from "graphql";

import { createLoginResolver } from "../login.resolver";
import { SessionState } from "../login.types";

const session: SessionState = {
  sessionToken: "token-1",
  reauthRequired: false,
  issuedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 1000).toISOString(),
  facilityId: "f1",
  labAreaId: "l1",
  workDate: "2026-03-16",
};

test("loadFacilities rejects when role context is missing", async () => {
  const resolver = createLoginResolver({
    loadFacilities: async () => [
      { id: "f1", code: "BV-TW", name: "Central Hospital" },
    ],
    loadLabAreas: async () => [],
    refreshSession: async () => session,
    submitLogin: async () => ({ status: "success", message: "ok", session }),
  });

  await assert.rejects(
    () => resolver.Query.loadFacilities({}, {}, {}),
    (error: unknown) => {
      assert.ok(error instanceof GraphQLError);
      assert.equal(error.extensions?.code, "FORBIDDEN");
      return true;
    }
  );
});

test("loadFacilities returns data when auth and role are valid", async () => {
  const resolver = createLoginResolver({
    loadFacilities: async () => [
      { id: "f1", code: "BV-TW", name: "Central Hospital" },
    ],
    loadLabAreas: async () => [],
    refreshSession: async () => session,
    submitLogin: async () => ({ status: "success", message: "ok", session }),
  });

  const result = await resolver.Query.loadFacilities(
    {},
    {},
    {
      sessionToken: "token-1",
      sessionId: "s1",
      userId: "u1",
      roleCodes: ["lab_technician"],
    }
  );

  assert.equal(result.length, 1);
  assert.equal(result[0].id, "f1");
});

test("loadFacilities returns data for login_entry role", async () => {
  const resolver = createLoginResolver({
    loadFacilities: async () => [
      { id: "f1", code: "BV-TW", name: "Central Hospital" },
    ],
    loadLabAreas: async () => [],
    refreshSession: async () => session,
    submitLogin: async () => ({ status: "success", message: "ok", session }),
  });

  const result = await resolver.Query.loadFacilities(
    {},
    {},
    {
      roleCodes: ["login_entry"],
    }
  );

  assert.equal(result.length, 1);
});

test("loadLabAreas rejects when role context is missing", async () => {
  const resolver = createLoginResolver({
    loadFacilities: async () => [],
    loadLabAreas: async () => [],
    refreshSession: async () => session,
    submitLogin: async () => ({ status: "success", message: "ok", session }),
  });

  await assert.rejects(
    () => resolver.Query.loadLabAreas({}, { facilityId: "f1" }, {}),
    (error: unknown) => {
      assert.ok(error instanceof GraphQLError);
      assert.equal(error.extensions?.code, "FORBIDDEN");
      return true;
    }
  );
});

test("loadLabAreas rejects when facilityId is missing", async () => {
  const resolver = createLoginResolver({
    loadFacilities: async () => [],
    loadLabAreas: async () => [],
    refreshSession: async () => session,
    submitLogin: async () => ({ status: "success", message: "ok", session }),
  });

  await assert.rejects(
    () =>
      resolver.Query.loadLabAreas(
        {},
        { facilityId: "" },
        {
          roleCodes: ["login_entry"],
        }
      ),
    (error: unknown) => {
      assert.ok(error instanceof GraphQLError);
      assert.equal(error.extensions?.code, "BAD_USER_INPUT");
      return true;
    }
  );
});

test("submitLogin rejects when role context is missing", async () => {
  const resolver = createLoginResolver({
    loadFacilities: async () => [],
    loadLabAreas: async () => [],
    refreshSession: async () => session,
    submitLogin: async () => ({ status: "success", message: "ok", session }),
  });

  await assert.rejects(
    () =>
      resolver.Mutation.submitLogin(
        {},
        {
          input: {
            username: "u",
            password: "p",
            facilityId: "f1",
            labAreaId: "l1",
            workDate: "2026-03-16",
          },
        },
        {}
      ),
    (error: unknown) => {
      assert.ok(error instanceof GraphQLError);
      assert.equal(error.extensions?.code, "FORBIDDEN");
      return true;
    }
  );
});

test("submitLogin rejects when input is missing", async () => {
  const resolver = createLoginResolver({
    loadFacilities: async () => [],
    loadLabAreas: async () => [],
    refreshSession: async () => session,
    submitLogin: async () => ({ status: "success", message: "ok", session }),
  });

  await assert.rejects(
    () =>
      resolver.Mutation.submitLogin(
        {},
        {} as unknown as { input: never },
        {
          roleCodes: ["login_entry"],
        }
      ),
    (error: unknown) => {
      assert.ok(error instanceof GraphQLError);
      assert.equal(error.extensions?.code, "BAD_USER_INPUT");
      return true;
    }
  );
});

test("submitLogin forwards valid payload to service dependency", async () => {
  let called = false;

  const resolver = createLoginResolver({
    loadFacilities: async () => [],
    loadLabAreas: async () => [],
    refreshSession: async () => session,
    submitLogin: async (input) => {
      called = true;
      assert.equal(input.username, "u");
      return { status: "success", message: "ok", session };
    },
  });

  const result = await resolver.Mutation.submitLogin(
    {},
    {
      input: {
        username: "u",
        password: "p",
        facilityId: "f1",
        labAreaId: "l1",
        workDate: "2026-03-16",
      },
    },
    {
      roleCodes: ["login_entry"],
    }
  );

  assert.equal(called, true);
  assert.equal(result.status, "success");
});

test("refreshSession rejects when bearer token is missing", async () => {
  const resolver = createLoginResolver({
    loadFacilities: async () => [],
    loadLabAreas: async () => [],
    refreshSession: async () => session,
    submitLogin: async () => ({ status: "success", message: "ok", session }),
  });

  await assert.rejects(
    () => resolver.Query.refreshSession({}, { sessionToken: "token-1" }, {}),
    (error: unknown) => {
      assert.ok(error instanceof GraphQLError);
      assert.equal(error.extensions?.code, "UNAUTHENTICATED");
      return true;
    }
  );
});

test("refreshSession rejects when role context is missing", async () => {
  const resolver = createLoginResolver({
    loadFacilities: async () => [],
    loadLabAreas: async () => [],
    refreshSession: async () => session,
    submitLogin: async () => ({ status: "success", message: "ok", session }),
  });

  await assert.rejects(
    () =>
      resolver.Query.refreshSession(
        {},
        { sessionToken: "token-1" },
        { sessionToken: "token-1", sessionId: "s1", userId: "u1" }
      ),
    (error: unknown) => {
      assert.ok(error instanceof GraphQLError);
      assert.equal(error.extensions?.code, "FORBIDDEN");
      return true;
    }
  );
});

test("refreshSession rejects when role is unauthorized", async () => {
  const resolver = createLoginResolver({
    loadFacilities: async () => [],
    loadLabAreas: async () => [],
    refreshSession: async () => session,
    submitLogin: async () => ({ status: "success", message: "ok", session }),
  });

  await assert.rejects(
    () =>
      resolver.Query.refreshSession(
        {},
        { sessionToken: "token-1" },
        {
          sessionToken: "token-1",
          sessionId: "s1",
          userId: "u1",
          roleCodes: ["guest"],
        }
      ),
    (error: unknown) => {
      assert.ok(error instanceof GraphQLError);
      assert.equal(error.extensions?.code, "FORBIDDEN");
      return true;
    }
  );
});

test("refreshSession rejects when token and bearer mismatch", async () => {
  const resolver = createLoginResolver({
    loadFacilities: async () => [],
    loadLabAreas: async () => [],
    refreshSession: async () => session,
    submitLogin: async () => ({ status: "success", message: "ok", session }),
  });

  await assert.rejects(
    () =>
      resolver.Query.refreshSession(
        {},
        { sessionToken: "token-1" },
        {
          sessionToken: "token-2",
          sessionId: "s2",
          userId: "u1",
          roleCodes: ["lab_technician"],
        }
      ),
    (error: unknown) => {
      assert.ok(error instanceof GraphQLError);
      assert.equal(error.extensions?.code, "UNAUTHENTICATED");
      return true;
    }
  );
});

test("refreshSession returns session when bearer token matches", async () => {
  const resolver = createLoginResolver({
    loadFacilities: async () => [],
    loadLabAreas: async () => [],
    refreshSession: async () => session,
    submitLogin: async () => ({ status: "success", message: "ok", session }),
  });

  const result = await resolver.Query.refreshSession(
    {},
    { sessionToken: "token-1" },
    {
      sessionToken: "token-1",
      sessionId: "s1",
      userId: "u1",
      roleCodes: ["lab_technician"],
    }
  );

  assert.equal(result.sessionToken, "token-1");
});
