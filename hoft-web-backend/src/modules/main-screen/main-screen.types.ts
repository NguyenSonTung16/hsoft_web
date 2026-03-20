export type WorkflowStepCode =
  | "registration"
  | "ordering"
  | "collection"
  | "receipt"
  | "analysis"
  | "entry"
  | "approval"
  | "print"
  | "payment";

export interface MainScreenContext {
  sessionToken: string;
  userId: string;
  roleCode: string;
  facilityId: string;
  labAreaId: string;
  facilityName?: string;
  labAreaName?: string;
  workDate: string;
  isContextValid: boolean;
  invalidReason?: string;
}

export interface WorkflowStepSummary {
  stepCode: WorkflowStepCode;
  waitingCount: number;
  inProgressCount: number;
  overdueCount: number;
  criticalCount?: number;
  updatedAt: string;
}

export interface WorkflowQueueItem {
  itemId: string;
  orderId: string;
  specimenId?: string;
  patientId: string;
  patientDisplayName?: string;
  currentStep: WorkflowStepCode;
  nextAllowedActions: string[];
  enteredStepAt: string;
  slaDueAt?: string;
  slaState: "on_time" | "warning" | "overdue";
  priorityLevel: "normal" | "high" | "critical";
  routeTarget: string;
}

export interface WorkflowTimelineStep {
  stepCode: WorkflowStepCode;
  state: "pending" | "in_progress" | "completed" | "blocked";
  occurredAt?: string;
}

export interface WorkflowTimeline {
  itemId: string;
  steps: WorkflowTimelineStep[];
  blockedStepCode?: WorkflowStepCode;
  blockedReason?: string;
}

export interface MainScreenPayload {
  context: MainScreenContext;
  summaries: WorkflowStepSummary[];
  queue: WorkflowQueueItem[];
}

export interface MainScreenActionDecision {
  allowed: boolean;
  reasonCode?: string;
  reasonMessage?: string;
}

export interface PermissionDecisionLogInput {
  actorUserId: string;
  roleCode: string;
  facilityId: string;
  labAreaId: string;
  actionKey: string;
  decision: "allow" | "deny";
  reasonCode?: string;
}
