//import { getEntities } from "../services/entityService";

export const entitResolver = {
  Query: {
    entities: async () => {
      //return getEntities();
    },

    entityFeaturesByEntityId: async (
      _: any,
      args: { entity_id: string }
    ) => {
     //return getEntityFeaturesByEntityId(args.entity_id);
    },
  },

  Mutation: {
    createEntity: async (
      _: any,
      args: { name: string }
    ) => {
      //return createEntity(args.name);
    },

    updateEntity: async (
      _: any,
      args: { id: string; name: string }
    ) => {
      //return updateEntity(args.id, args.name);
    },

    deleteEntity: async (
      _: any,
      args: { id: string }
    ) => {
      //return deleteEntity(args.id);
    },
  },
};