import { GraphQLError } from "graphql";

import {
  loadFacilities,
  loadLabAreas,
  refreshSession,
  submitLogin,
} from "./login.service";

interface LoginInputArgs {
  input: {
    username: string;
    password: string;
    facilityId: string;
    labAreaId: string;
    workDate: string;
  };
}

interface LoadLabAreasArgs {
  facilityId: string;
}

interface RefreshSessionArgs {
  sessionToken: string;
}

interface ResolverContext {
  sessionToken?: string;
  sessionId?: string;
  userId?: string;
  roleCodes?: string[];
  facilityScope?: {
    facilityId: string;
    labAreaId: string;
  };
}

const ALLOWED_AUTH_ROLES = new Set([
  "reception_staff",
  "sample_collection_technician",
  "lab_technician",
  "lab_doctor",
  "system_admin",
]);

const ALLOWED_LOGIN_ENTRY_ROLES = new Set([
  "login_entry",
  ...ALLOWED_AUTH_ROLES,
]);

function ensureAuthenticatedContext(context: ResolverContext): void {
  if (!context?.sessionToken || !context?.sessionId || !context?.userId) {
    throw new GraphQLError("Missing or invalid bearer token", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
}

function ensureAllowedRole(
  context: ResolverContext,
  allowedRoles: Set<string>
): void {
  const normalizedRoles = (context.roleCodes ?? []).map((role) =>
    role.trim().toLowerCase()
  );

  if (!normalizedRoles.length) {
    throw new GraphQLError("Missing role context", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  const isAllowed = normalizedRoles.some((role) => allowedRoles.has(role));
  if (!isAllowed) {
    throw new GraphQLError("Role is not authorized", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}

interface LoginResolverDeps {
  loadFacilities: typeof loadFacilities;
  loadLabAreas: typeof loadLabAreas;
  refreshSession: typeof refreshSession;
  submitLogin: typeof submitLogin;
}

const defaultDeps: LoginResolverDeps = {
  loadFacilities,
  loadLabAreas,
  refreshSession,
  submitLogin,
};

export function createLoginResolver(deps: LoginResolverDeps = defaultDeps) {
  return {
    Query: {
      loadFacilities: async (
        _: unknown,
        __: unknown,
        context: ResolverContext
      ) => {
        ensureAllowedRole(context, ALLOWED_LOGIN_ENTRY_ROLES);
        return deps.loadFacilities();
      },
      loadLabAreas: async (
        _: unknown,
        args: LoadLabAreasArgs,
        context: ResolverContext
      ) => {
        ensureAllowedRole(context, ALLOWED_LOGIN_ENTRY_ROLES);

        if (!args?.facilityId?.trim()) {
          throw new GraphQLError("facilityId is required", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        return deps.loadLabAreas(args.facilityId);
      },
      refreshSession: async (
        _: unknown,
        args: RefreshSessionArgs,
        context: ResolverContext
      ) => {
        if (!args?.sessionToken?.trim()) {
          throw new GraphQLError("sessionToken is required", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        ensureAuthenticatedContext(context);
        ensureAllowedRole(context, ALLOWED_AUTH_ROLES);

        if (context.sessionToken !== args.sessionToken) {
          throw new GraphQLError("Missing or invalid bearer token", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        }

        const refreshed = await deps.refreshSession(args.sessionToken);

        if (!refreshed) {
          throw new GraphQLError("Session is invalid or expired", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        }

        return refreshed;
      },
    },

    Mutation: {
      submitLogin: async (
        _: unknown,
        args: LoginInputArgs,
        context: ResolverContext
      ) => {
        ensureAllowedRole(context, ALLOWED_LOGIN_ENTRY_ROLES);

        const input = args?.input;

        if (!input) {
          throw new GraphQLError("input is required", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const requiredFields: Array<keyof LoginInputArgs["input"]> = [
          "username",
          "password",
          "facilityId",
          "labAreaId",
          "workDate",
        ];

        const missingField = requiredFields.find((field) => !input[field]?.trim());

        if (missingField) {
          throw new GraphQLError(`${missingField} is required`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        return deps.submitLogin(input);
      },
    },
  };
}

export const loginResolver = createLoginResolver();
