import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { json } from "body-parser";

import {
  AuthContextDataAccess,
  GraphQLAuthContext,
  OracleAuthContextAdapter,
} from "../database/auth-context.adapter";
import { entitySchema } from "../modules/entity/example.schema";
import { entitResolver } from "../modules/entity/example.resolver";
import { loginSchema } from "../modules/login/login.schema";
import { loginResolver } from "../modules/login/login.resolver";
import { logger } from "../utils/logger";

export const typeDefs = [
  entitySchema,
  loginSchema
];

export const resolvers = [
  entitResolver,
  loginResolver
];

interface ContextBuilderDeps {
  authContextDataAccess: AuthContextDataAccess;
  securityLogger: {
    warn: (event: string, message: string, details?: Record<string, unknown>) => void;
    error: (event: string, message: string, details?: Record<string, unknown>) => void;
  };
}

export function extractBearerToken(authorization?: string): string | undefined {
  if (!authorization) {
    return undefined;
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token?.trim()) {
    return undefined;
  }

  return token.trim();
}

export function createGraphQLContextBuilder(
  deps: ContextBuilderDeps = {
    authContextDataAccess: new OracleAuthContextAdapter(),
    securityLogger: logger,
  }
) {
  return async ({ req }: { req: { headers: Record<string, string | string[] | undefined> } }): Promise<GraphQLAuthContext> => {
    const authHeader = req.headers.authorization;
    const roleHeader = req.headers["x-role-codes"];
    const authToken = extractBearerToken(
      Array.isArray(authHeader) ? authHeader[0] : authHeader
    );

    if (roleHeader) {
      deps.securityLogger.warn(
        "security.role_header_ignored",
        "Client-provided x-role-codes header was ignored",
        { hasRoleHeader: true }
      );
    }

    if (!authToken) {
      return { roleCodes: ["login_entry"] };
    }

    try {
      const resolved = await deps.authContextDataAccess.resolveServerAuthContext(authToken);

      if (!resolved.sessionId || !resolved.userId || !(resolved.roleCodes?.length ?? 0)) {
        // Treat invalid/expired tokens as login entry context for pre-auth operations.
        return { roleCodes: ["login_entry"] };
      }

      return resolved;
    } catch (error) {
      deps.securityLogger.error(
        "security.context_resolution_failed",
        "Failed to resolve auth context from server-side data",
        {
          error: error instanceof Error ? error.message : String(error),
        }
      );
      return { roleCodes: ["login_entry"] };
    }
  };
}

export async function setupApolloGraphQL(app: any) {

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    "/graphql",
    json(),
    expressMiddleware(server, {
      context: createGraphQLContextBuilder(),
    })
  );
}