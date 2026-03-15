import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { json } from "body-parser";

import { entitySchema } from "../modules/entity/example.schema";
import { entitResolver } from "../modules/entity/example.resolver";

export const typeDefs = [
  entitySchema
];

export const resolvers = [
  entitResolver
];

export async function setupApolloGraphQL(app: any) {

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    "/graphql",
    json(),
    expressMiddleware(server)
  );
}