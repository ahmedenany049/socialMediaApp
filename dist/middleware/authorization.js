"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizatinGQL = exports.Authorizatin = void 0;
const classError_1 = require("../utils/classError");
const graphql_1 = require("graphql");
const Authorizatin = ({ accessRoles = [] }) => {
    return (req, res, next) => {
        if (!accessRoles.includes(req.user?.role)) {
            throw new classError_1.AppError("unAuthorized");
        }
        next();
    };
};
exports.Authorizatin = Authorizatin;
const AuthorizatinGQL = ({ accessRoles = [], role }) => {
    if (!accessRoles.includes(role)) {
        throw new graphql_1.GraphQLError("unAuthorized", { extensions: { code: "UNAUTHORIZED", statusCode: 404 } });
    }
    return true;
};
exports.AuthorizatinGQL = AuthorizatinGQL;
