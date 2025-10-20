"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.likePostArgs = void 0;
const graphql_1 = require("graphql");
exports.likePostArgs = {
    postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    userId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
};
