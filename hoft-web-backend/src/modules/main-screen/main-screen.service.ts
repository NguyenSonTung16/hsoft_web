import { GraphQLError } from "graphql";

import {
  AuthContextDataAccess,
  OracleAuthContextAdapter,
} from "../../database/auth-context.adapter";
import {
  MainScreenActionDecision,
  MainScreenPayload,
  WorkflowQueueItem,
  WorkflowTimeline,
} from "./main-screen.types";
import { MainScreenRepository } from "./main-screen.repository";

const ROLE_MENU_PROFILE: Record<string, { menuItems: string[]; quickActions: string[] }> = {
  reception_staff: {
    menuItems: ["registration", "ordering", "main_queue"],
    quickActions: ["open_registration", "open_ordering", "open_work_item"],
  },
  sample_collection_technician: {
    menuItems: ["collection", "receipt", "main_queue"],
    quickActions: ["open_collection", "open_receipt", "open_work_item"],
  },
  lab_technician: {
    menuItems: ["analysis", "entry", "main_queue"],
    quickActions: ["open_analysis", "open_entry_screen", "open_work_item"],
  },
  lab_doctor: {
    menuItems: ["approval", "print", "main_queue"],
    quickActions: ["open_approval", "open_print", "open_work_item"],
  },
  system_admin: {
    menuItems: ["registration", "ordering", "collection", "receipt", "analysis", "entry", "approval", "print", "payment", "main_queue"],
    quickActions: ["open_work_item", "open_registration", "open_ordering", "open_collection", "open_receipt", "open_analysis", "open_entry_screen", "open_approval", "open_print", "open_payment"],
  },
};

interface ServiceDeps {
  repository: MainScreenRepository;
  authContextDataAccess: AuthContextDataAccess;
}

interface ValidMainScreenContext {
  sessionToken: string;
  userId: string;
  roleCode: string;
  facilityScope: {
    facilityId: string;
    labAreaId: string;
    facilityName?: string;
    labAreaName?: string;
  };
}

const defaultDeps: ServiceDeps = {
  repository: new MainScreenRepository(),
  authContextDataAccess: new OracleAuthContextAdapter(),
};

function comparePriority(a: WorkflowQueueItem, b: WorkflowQueueItem): number {
  const weight: Record<WorkflowQueueItem["priorityLevel"], number> = {
    critical: 0,
    high: 1,
    normal: 2,
  };

  if (weight[a.priorityLevel] !== weight[b.priorityLevel]) {
    return weight[a.priorityLevel] - weight[b.priorityLevel];
  }

  if (a.slaState !== b.slaState) {
    const slaWeight: Record<WorkflowQueueItem["slaState"], number> = {
      overdue: 0,
      warning: 1,
      on_time: 2,
    };
    return slaWeight[a.slaState] - slaWeight[b.slaState];
  }

  return new Date(a.enteredStepAt).getTime() - new Date(b.enteredStepAt).getTime();
}

function normalizeRoles(roleCodes?: string[]): string[] {
  return (roleCodes ?? []).map((role) => role.trim().toLowerCase());
}

function resolveRoleCodeOrThrow(normalizedRoles: string[]): string {
  if (normalizedRoles.length !== 1) {
    throw new GraphQLError("User role assignment is invalid", {
      extensions: { code: "FORBIDDEN", reasonCode: "ROLE_INCONSISTENT" },
    });
  }

  const roleCode = normalizedRoles[0];
  if (!ROLE_MENU_PROFILE[roleCode]) {
    throw new GraphQLError("Role is not supported for main screen", {
      extensions: { code: "FORBIDDEN", reasonCode: "ROLE_NOT_ALLOWED" },
    });
  }

  return roleCode;
}

async function resolveValidMainScreenContext(
  deps: ServiceDeps,
  sessionToken?: string
): Promise<ValidMainScreenContext> {
  const resolved = await deps.authContextDataAccess.resolveMainScreenContext(sessionToken);

  if (!resolved.isContextValid || !resolved.userId || !resolved.facilityScope) {
    throw new GraphQLError(resolved.invalidReason || "Invalid active context", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const roleCode = resolveRoleCodeOrThrow(normalizeRoles(resolved.roleCodes));

  return {
    sessionToken: resolved.sessionToken || "",
    userId: resolved.userId,
    roleCode,
    facilityScope: resolved.facilityScope,
  };
}

export function createMainScreenService(deps: ServiceDeps = defaultDeps) {
  return {
    async getMainScreenPayload(sessionToken?: string): Promise<MainScreenPayload> {
      const resolved = await resolveValidMainScreenContext(deps, sessionToken);

      const summaries = await deps.repository.getWorkflowStepSummaries({
        userId: resolved.userId,
        facilityId: resolved.facilityScope.facilityId,
        labAreaId: resolved.facilityScope.labAreaId,
      });

      const queue = await deps.repository.getWorkflowQueueItems({
        userId: resolved.userId,
        facilityId: resolved.facilityScope.facilityId,
        labAreaId: resolved.facilityScope.labAreaId,
        roleCode: resolved.roleCode,
      });

      queue.sort(comparePriority);

      return {
        context: {
          sessionToken: resolved.sessionToken || "",
          userId: resolved.userId,
          roleCode: resolved.roleCode,
          facilityId: resolved.facilityScope.facilityId,
          labAreaId: resolved.facilityScope.labAreaId,
          facilityName: resolved.facilityScope.facilityName,
          labAreaName: resolved.facilityScope.labAreaName,
          workDate: new Date().toISOString().slice(0, 10),
          isContextValid: true,
        },
        summaries,
        queue,
      };
    },

    async getWorkflowTimeline(itemId: string, sessionToken?: string): Promise<WorkflowTimeline> {
      await resolveValidMainScreenContext(deps, sessionToken);

      return deps.repository.getWorkflowTimeline(itemId);
    },

    async evaluateMainScreenAction(
      input: { itemId: string; actionKey: string },
      sessionToken?: string
    ): Promise<MainScreenActionDecision> {
      const resolved = await deps.authContextDataAccess.resolveMainScreenContext(sessionToken);

      if (!resolved.isContextValid || !resolved.userId || !resolved.facilityScope) {
        return {
          allowed: false,
          reasonCode: "INVALID_CONTEXT",
          reasonMessage: resolved.invalidReason || "Active context is invalid",
        };
      }

      const normalizedRoles = normalizeRoles(resolved.roleCodes);
      const roleCode = normalizedRoles[0] || "";
      const profile = ROLE_MENU_PROFILE[roleCode];

      const allowed = !!profile?.quickActions?.includes(input.actionKey);
      const decision: MainScreenActionDecision = allowed
        ? { allowed: true }
        : {
            allowed: false,
            reasonCode: "ACTION_NOT_PERMITTED",
            reasonMessage: "Action is not permitted for current role",
          };

      await deps.repository.logPermissionDecision({
        actorUserId: resolved.userId,
        roleCode,
        facilityId: resolved.facilityScope.facilityId,
        labAreaId: resolved.facilityScope.labAreaId,
        actionKey: input.actionKey,
        decision: allowed ? "allow" : "deny",
        reasonCode: decision.reasonCode,
      });

      return decision;
    },
  };
}

export const mainScreenService = createMainScreenService();
