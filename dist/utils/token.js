"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSignature = exports.decodedTokenAndFeTchUser = exports.VerifyToken = exports.GenerateToken = exports.TokenType = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const classError_1 = require("./classError");
const user_repository_1 = require("../DB/repositories/user.repository");
const user_model_1 = __importDefault(require("../model/user.model"));
const revok_repository_1 = require("../DB/repositories/revok.repository");
const revok_Token_1 = __importDefault(require("../model/revok.Token"));
var TokenType;
(function (TokenType) {
    TokenType["access"] = "access";
    TokenType["refresh"] = "refresh";
})(TokenType || (exports.TokenType = TokenType = {}));
const _userModdel = new user_repository_1.UserRepository(user_model_1.default);
const _revokToken = new revok_repository_1.RevokTokenRepository(revok_Token_1.default);
const GenerateToken = async ({ payload, signature, options }) => {
    return jsonwebtoken_1.default.sign(payload, signature, options);
};
exports.GenerateToken = GenerateToken;
const VerifyToken = async ({ token, signature }) => {
    return jsonwebtoken_1.default.verify(token, signature);
};
exports.VerifyToken = VerifyToken;
const decodedTokenAndFeTchUser = async (token, signature) => {
    const decoded = await (0, exports.VerifyToken)({ token, signature });
    if (!decoded) {
        throw new classError_1.AppError("invalid token", 400);
    }
    const user = await _userModdel.findOne({ email: decoded.email });
    if (!user) {
        throw new classError_1.AppError("user not found", 400);
    }
    if (!user?.confirmed) {
        throw new classError_1.AppError("please confirmed email first", 400);
    }
    if (await _revokToken.findOne({ tokenId: decoded?.jti })) {
        throw new classError_1.AppError("token has been revoked", 401);
    }
    if (user?.changCredentials?.getTime() > decoded.iat * 1000) {
        throw new classError_1.AppError("token has been revoked", 401);
    }
    return { decoded, user };
};
exports.decodedTokenAndFeTchUser = decodedTokenAndFeTchUser;
const GetSignature = async (prefix, tokenType = TokenType.access) => {
    if (tokenType === TokenType.access) {
        if (prefix === process.env.BEARER_USER) {
            return process.env.ACCESS_TOKEN_USER;
        }
        else if (prefix === process.env.BEARER_ADMIN) {
            return process.env.ACCESS_TOKEN_ADMIN;
        }
        else {
            return null;
        }
    }
    if (tokenType === TokenType.refresh) {
        if (prefix === process.env.BEARER_USER) {
            return process.env.REFRESH_TOKEN_USER;
        }
        else if (prefix === process.env.BEARER_ADMIN) {
            return process.env.REFRESH_TOKEN_ADMIN;
        }
        else {
            return null;
        }
    }
    return null;
};
exports.GetSignature = GetSignature;
