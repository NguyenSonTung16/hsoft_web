export const entitySchema  = `#graphql

"""
===== TYPE DEFINITIONS =====
"""

type Entity {
  id: ID!
  name: String!
}

type EntityFeature {
  id: ID!
  entityId: ID!
  featureItem: String
}

"""
===== INPUT TYPES =====
"""

input CreateEntityInput {
  name: String!
}

input UpdateEntityInput {
  id: ID!
  name: String!
}

"""
===== QUERY =====
"""

type Query {
  entities: [Entity!]!
  entityFeaturesByEntityId(entityId: ID!): [EntityFeature!]!
}

"""
===== MUTATION =====
"""

type Mutation {
  createEntity(input: CreateEntityInput!): Entity!
  updateEntity(input: UpdateEntityInput!): Entity!
  deleteEntity(id: ID!): Boolean!
}
`;