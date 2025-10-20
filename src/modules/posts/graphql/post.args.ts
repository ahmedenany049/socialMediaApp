import { GraphQLID, GraphQLNonNull } from "graphql";

export const likePostArgs = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    userId: { type: new GraphQLNonNull(GraphQLID) },
};
