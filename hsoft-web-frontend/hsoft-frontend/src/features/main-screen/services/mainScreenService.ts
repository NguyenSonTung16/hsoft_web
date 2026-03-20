import { getGraphQLEndpoint } from "../../../shared/graphqlEndpoint";

export interface MainScreenContextDto {
  facilityId: string;
  labAreaId: string;
  facilityName?: string;
  labAreaName?: string;
  workDate: string;
  roleCode: string;
  isContextValid: boolean;
  invalidReason?: string;
}

export interface WorkflowStepSummaryDto {
  stepCode: string;
  waitingCount: number;
  inProgressCount: number;
  overdueCount: number;
  criticalCount?: number;
  updatedAt: string;
}

export interface WorkflowQueueItemDto {
  itemId: string;
  orderId: string;
  specimenId?: string;
  patientId: string;
  patientDisplayName?: string;
  currentStep: string;
  nextAllowedActions: string[];
  enteredStepAt: string;
  slaDueAt?: string;
  slaState: "on_time" | "warning" | "overdue";
  priorityLevel: "normal" | "high" | "critical";
  routeTarget: string;
}

export interface WorkflowTimelineStepDto {
  stepCode: string;
  state: "pending" | "in_progress" | "completed" | "blocked";
  occurredAt?: string;
}

export interface WorkflowTimelineDto {
  itemId: string;
  steps: WorkflowTimelineStepDto[];
  blockedStepCode?: string;
  blockedReason?: string;
}

export interface MainScreenPayloadDto {
  context: MainScreenContextDto;
  summaries: WorkflowStepSummaryDto[];
  queue: WorkflowQueueItemDto[];
}

export interface MainScreenActionDecisionDto {
  allowed: boolean;
  reasonCode?: string;
  reasonMessage?: string;
}

interface GraphQLErrorItem {
  message?: string;
  extensions?: {
    code?: string;
  };
}

async function requestGraphQL<TData>(
  sessionToken: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<TData> {
  const response = await fetch(getGraphQLEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    let detail = "";

    try {
      const errorBody = (await response.json()) as {
        errors?: GraphQLErrorItem[];
      };

      detail = errorBody.errors?.[0]?.message || "";
    } catch {
      try {
        detail = await response.text();
      } catch {
        detail = "";
      }
    }

    throw new Error(detail || `HTTP_${response.status}`);
  }

  const result = (await response.json()) as {
    data?: TData;
    errors?: GraphQLErrorItem[];
  };

  if (result.errors?.length) {
    throw new Error(result.errors[0]?.message || "GRAPHQL_ERROR");
  }

  if (!result.data) {
    throw new Error("EMPTY_GRAPHQL_DATA");
  }

  return result.data;
}

export interface MainScreenService {
  getMainScreenPayload(sessionToken: string): Promise<MainScreenPayloadDto>;
  getWorkflowTimeline(sessionToken: string, itemId: string): Promise<WorkflowTimelineDto>;
  evaluateAction(
    sessionToken: string,
    input: { itemId: string; actionKey: string }
  ): Promise<MainScreenActionDecisionDto>;
}

class GraphQLMainScreenService implements MainScreenService {
  async getMainScreenPayload(sessionToken: string): Promise<MainScreenPayloadDto> {
    const data = await requestGraphQL<{ getMainScreenPayload: MainScreenPayloadDto }>(
      sessionToken,
      `
        query GetMainScreenPayload {
          getMainScreenPayload {
            context {
              facilityId
              labAreaId
              facilityName
              labAreaName
              workDate
              roleCode
              isContextValid
              invalidReason
            }
            summaries {
              stepCode
              waitingCount
              inProgressCount
              overdueCount
              criticalCount
              updatedAt
            }
            queue {
              itemId
              orderId
              specimenId
              patientId
              patientDisplayName
              currentStep
              nextAllowedActions
              enteredStepAt
              slaDueAt
              slaState
              priorityLevel
              routeTarget
            }
          }
        }
      `
    );

    return data.getMainScreenPayload;
  }

  async getWorkflowTimeline(sessionToken: string, itemId: string): Promise<WorkflowTimelineDto> {
    const data = await requestGraphQL<{ getWorkflowTimeline: WorkflowTimelineDto }>(
      sessionToken,
      `
        query GetWorkflowTimeline($itemId: ID!) {
          getWorkflowTimeline(itemId: $itemId) {
            itemId
            blockedStepCode
            blockedReason
            steps {
              stepCode
              state
              occurredAt
            }
          }
        }
      `,
      { itemId }
    );

    return data.getWorkflowTimeline;
  }

  async evaluateAction(
    sessionToken: string,
    input: { itemId: string; actionKey: string }
  ): Promise<MainScreenActionDecisionDto> {
    const data = await requestGraphQL<{ evaluateMainScreenAction: MainScreenActionDecisionDto }>(
      sessionToken,
      `
        mutation EvaluateMainScreenAction($input: MainScreenActionInput!) {
          evaluateMainScreenAction(input: $input) {
            allowed
            reasonCode
            reasonMessage
          }
        }
      `,
      { input }
    );

    return data.evaluateMainScreenAction;
  }
}

export const mainScreenService: MainScreenService = new GraphQLMainScreenService();
