import { GraphQLError } from "graphql";

import { createMainScreenService, mainScreenService } from "./main-screen.service";

interface ResolverContext {
  sessionToken?: string;
}

interface MainScreenActionArgs {
  input: {
    itemId: string;
    actionKey: string;
  };
}

interface TimelineArgs {
  itemId: string;
}

interface ResolverDeps {
  service: ReturnType<typeof createMainScreenService>;
}

const defaultDeps: ResolverDeps = {
  service: mainScreenService,
};

function ensureSessionToken(context: ResolverContext): string {
  if (!context?.sessionToken?.trim()) {
    throw new GraphQLError("Missing or invalid bearer token", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  return context.sessionToken;
}

export function createMainScreenResolver(deps: ResolverDeps = defaultDeps) {
  return {
    Query: {
      getMainScreenPayload: async (
        _: unknown,
        __: unknown,
        context: ResolverContext
      ) => {
        const sessionToken = ensureSessionToken(context);
        return deps.service.getMainScreenPayload(sessionToken);
      },
      getWorkflowTimeline: async (
        _: unknown,
        args: TimelineArgs,
        context: ResolverContext
      ) => {
        if (!args?.itemId?.trim()) {
          throw new GraphQLError("itemId is required", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const sessionToken = ensureSessionToken(context);
        return deps.service.getWorkflowTimeline(args.itemId, sessionToken);
      },
    },
    Mutation: {
      evaluateMainScreenAction: async (
        _: unknown,
        args: MainScreenActionArgs,
        context: ResolverContext
      ) => {
        if (!args?.input?.itemId?.trim() || !args?.input?.actionKey?.trim()) {
          throw new GraphQLError("itemId and actionKey are required", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const sessionToken = ensureSessionToken(context);
        return deps.service.evaluateMainScreenAction(args.input, sessionToken);
      },
    },
  };
}

export const mainScreenResolver = createMainScreenResolver();
