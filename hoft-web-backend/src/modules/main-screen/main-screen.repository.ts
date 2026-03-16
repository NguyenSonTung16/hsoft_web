import oracledb from "oracledb";

import { getConnection } from "../../database/oracle";
import { logger } from "../../utils/logger";
import {
  PermissionDecisionLogInput,
  WorkflowQueueItem,
  WorkflowStepCode,
  WorkflowStepSummary,
  WorkflowTimeline,
  WorkflowTimelineStep,
} from "./main-screen.types";

interface SessionQueueRow {
  ID: string;
  USER_ID: string;
  STATUS: string;
  ISSUED_AT: Date | string;
  EXPIRES_AT: Date | string;
}

const WORKFLOW_STEPS: WorkflowStepCode[] = [
  "registration",
  "ordering",
  "collection",
  "receipt",
  "analysis",
  "entry",
  "approval",
  "print",
  "payment",
];

function toIso(value: Date | string | undefined): string {
  if (!value) {
    return new Date().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

function deriveSlaState(expiresAt: Date | string): "on_time" | "warning" | "overdue" {
  const expires = new Date(expiresAt).getTime();
  const now = Date.now();
  const diffMs = expires - now;

  if (diffMs <= 0) {
    return "overdue";
  }

  if (diffMs <= 60 * 60 * 1000) {
    return "warning";
  }

  return "on_time";
}

export class MainScreenRepository {
  async getWorkflowStepSummaries(input: {
    userId: string;
    facilityId: string;
    labAreaId: string;
  }): Promise<WorkflowStepSummary[]> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await getConnection();
      const result = await connection.execute<{ SESSION_COUNT: number }>(
        `
          SELECT COUNT(*) AS SESSION_COUNT
          FROM LIS_SESSION
          WHERE USER_ID = :userId
            AND FACILITY_ID = :facilityId
            AND LAB_AREA_ID = :labAreaId
            AND STATUS = 'success'
        `,
        {
          userId: input.userId,
          facilityId: input.facilityId,
          labAreaId: input.labAreaId,
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const sessionCount = Number(
        ((result.rows as { SESSION_COUNT: number }[] | undefined)?.[0]?.SESSION_COUNT ?? 0)
      );
      const updatedAt = new Date().toISOString();

      return WORKFLOW_STEPS.map((stepCode) => ({
        stepCode,
        waitingCount: stepCode === "entry" ? sessionCount : 0,
        inProgressCount: 0,
        overdueCount: 0,
        criticalCount: 0,
        updatedAt,
      }));
    } finally {
      await connection?.close();
    }
  }

  async getWorkflowQueueItems(input: {
    userId: string;
    facilityId: string;
    labAreaId: string;
    roleCode: string;
  }): Promise<WorkflowQueueItem[]> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await getConnection();
      const result = await connection.execute<SessionQueueRow>(
        `
          SELECT ID, USER_ID, STATUS, ISSUED_AT, EXPIRES_AT
          FROM LIS_SESSION
          WHERE USER_ID = :userId
            AND FACILITY_ID = :facilityId
            AND LAB_AREA_ID = :labAreaId
            AND STATUS = 'success'
          ORDER BY ISSUED_AT DESC
        `,
        {
          userId: input.userId,
          facilityId: input.facilityId,
          labAreaId: input.labAreaId,
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const rows = (result.rows as SessionQueueRow[] | undefined) ?? [];

      return rows.map((row) => {
        const slaState = deriveSlaState(row.EXPIRES_AT);

        return {
          itemId: row.ID,
          orderId: row.ID,
          specimenId: row.ID,
          patientId: row.USER_ID,
          patientDisplayName: `User ${row.USER_ID.slice(0, 6)}`,
          currentStep: "entry",
          nextAllowedActions: ["open_work_item", "open_entry_screen"],
          enteredStepAt: toIso(row.ISSUED_AT),
          slaDueAt: toIso(row.EXPIRES_AT),
          slaState,
          priorityLevel: slaState === "overdue" ? "critical" : slaState === "warning" ? "high" : "normal",
          routeTarget: input.roleCode === "lab_doctor" ? "/approval" : "/entry",
        } satisfies WorkflowQueueItem;
      });
    } finally {
      await connection?.close();
    }
  }

  async getWorkflowTimeline(itemId: string): Promise<WorkflowTimeline> {
    const steps: WorkflowTimelineStep[] = WORKFLOW_STEPS.map((stepCode, index) => ({
      stepCode,
      state: stepCode === "entry" ? "in_progress" : index < WORKFLOW_STEPS.indexOf("entry") ? "completed" : "pending",
      occurredAt: index <= WORKFLOW_STEPS.indexOf("entry") ? new Date().toISOString() : undefined,
    }));

    return {
      itemId,
      steps,
    };
  }

  async logPermissionDecision(input: PermissionDecisionLogInput): Promise<void> {
    // Keep this in structured application logs to avoid touching constrained DB log enums.
    logger.info("main_screen.permission_decision", "Permission decision evaluated", {
      actorUserId: input.actorUserId,
      roleCode: input.roleCode,
      facilityId: input.facilityId,
      labAreaId: input.labAreaId,
      actionKey: input.actionKey,
      decision: input.decision,
      reasonCode: input.reasonCode,
    });
  }
}
