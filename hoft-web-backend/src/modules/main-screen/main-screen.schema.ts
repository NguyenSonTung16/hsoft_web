export const mainScreenSchema = `#graphql
  type WorkflowStepSummary {
    stepCode: String!
    waitingCount: Int!
    inProgressCount: Int!
    overdueCount: Int!
    criticalCount: Int
    updatedAt: String!
  }

  type WorkflowQueueItem {
    itemId: ID!
    orderId: ID!
    specimenId: ID
    patientId: ID!
    patientDisplayName: String
    currentStep: String!
    nextAllowedActions: [String!]!
    enteredStepAt: String!
    slaDueAt: String
    slaState: String!
    priorityLevel: String!
    routeTarget: String!
  }

  type WorkflowTimelineStep {
    stepCode: String!
    state: String!
    occurredAt: String
  }

  type WorkflowTimeline {
    itemId: ID!
    steps: [WorkflowTimelineStep!]!
    blockedStepCode: String
    blockedReason: String
  }

  type MainScreenContext {
    facilityId: ID!
    labAreaId: ID!
    workDate: String!
    roleCode: String!
    isContextValid: Boolean!
    invalidReason: String
  }

  type MainScreenPayload {
    context: MainScreenContext!
    summaries: [WorkflowStepSummary!]!
    queue: [WorkflowQueueItem!]!
  }

  type MainScreenActionDecision {
    allowed: Boolean!
    reasonCode: String
    reasonMessage: String
  }

  input MainScreenActionInput {
    itemId: ID!
    actionKey: String!
  }

  extend type Query {
    getMainScreenPayload: MainScreenPayload!
    getWorkflowTimeline(itemId: ID!): WorkflowTimeline!
  }

  extend type Mutation {
    evaluateMainScreenAction(input: MainScreenActionInput!): MainScreenActionDecision!
  }
`;
