"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationGQL = exports.Authentication = void 0;
const classError_1 = require("../utils/classError");
const token_1 = require("../utils/token");
const graphql_1 = require("graphql");
const Authentication = (tokenType = token_1.TokenType.access) => {
    return async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization) {
            throw new classError_1.AppError("Authorization header is missing", 400);
        }
        const [prefix, token] = authorization.split(" ") || [];
        if (!prefix || !token) {
            throw new classError_1.AppError("token not exist", 400);
        }
        const signature = await (0, token_1.GetSignature)(prefix, tokenType);
        if (!signature) {
            throw new classError_1.AppError("invalid signature", 400);
        }
        const { user, decoded } = await (0, token_1.decodedTokenAndFeTchUser)(token, signature);
        if (!decoded) {
            throw new classError_1.AppError("invalid token", 400);
        }
        req.user = user;
        req.decoded = decoded;
        return next();
    };
};
exports.Authentication = Authentication;
const AuthenticationGQL = async (authorization, tokenType = token_1.TokenType.access) => {
    if (!authorization) {
        throw new classError_1.AppError("Authorization header is missing", 400);
    }
    const [prefix, token] = authorization.split(" ") || [];
    if (!prefix || !token) {
        throw new graphql_1.GraphQLError("token not exist", { extensions: {
                code: "TOKEN_NOT_FOUND",
                http: { status: 404 }
            } });
    }
    const signature = await (0, token_1.GetSignature)(prefix, tokenType);
    if (!signature) {
        throw new graphql_1.GraphQLError("invalid signature", { extensions: {
                code: "INVALID_SIGNATURE",
                http: { status: 404 }
            } });
    }
    const { user, decoded } = await (0, token_1.decodedTokenAndFeTchUser)(token, signature);
    if (!decoded) {
        throw new graphql_1.GraphQLError("invalid token", { extensions: {
                code: "INVALID_TOKEN",
                http: { status: 404 }
            } });
    }
    return { user, decoded };
};
exports.AuthenticationGQL = AuthenticationGQL;
