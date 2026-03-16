export const loginSchema = `#graphql

type FacilityOption {
  id: ID!
  code: String!
  name: String!
}

type LabAreaOption {
  id: ID!
  code: String!
  name: String!
}

type SessionState {
  sessionToken: String!
  reauthRequired: Boolean!
  issuedAt: String!
  expiresAt: String!
  facilityId: ID!
  labAreaId: ID!
  workDate: String!
}

input LoginInput {
  username: String!
  password: String!
  facilityId: ID!
  labAreaId: ID!
  workDate: String!
}

type LoginResponse {
  status: String!
  message: String!
  session: SessionState
}

extend type Query {
  loadFacilities: [FacilityOption!]!
  loadLabAreas(facilityId: ID!): [LabAreaOption!]!
  refreshSession(sessionToken: ID!): SessionState
}

extend type Mutation {
  submitLogin(input: LoginInput!): LoginResponse!
}
`;
