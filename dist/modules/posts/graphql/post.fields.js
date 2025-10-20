"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const post_types_1 = require("./post.types");
const post_service_1 = __importDefault(require("../post.service"));
const post_args_1 = require("./post.args");
class postFields {
    constructor() { }
    query = () => {
        return {
            getPosts: {
                type: new graphql_1.GraphQLList(post_types_1.postType),
                resolve: post_service_1.default.getPostsGQL
            }
        };
    };
    mutation = () => {
        return { createUser: {
                type: post_types_1.postType,
                args: post_args_1.likePostArgs,
                resolve: post_service_1.default.likePostQL
            } };
    };
}
exports.default = new postFields();
