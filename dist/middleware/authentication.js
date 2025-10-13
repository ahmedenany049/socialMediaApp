"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authentication = void 0;
const classError_1 = require("../utils/classError");
const token_1 = require("../utils/token");
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
