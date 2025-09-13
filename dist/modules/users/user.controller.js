"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = __importDefault(require("./user.service"));
const validation_1 = require("../../middleware/validation");
const UV = __importStar(require("./user.validation"));
const authentication_1 = require("../../middleware/authentication");
const token_1 = require("../../utils/token");
const userRouer = (0, express_1.Router)();
userRouer.post("/signup", (0, validation_1.validation)(UV.signUpSchema), user_service_1.default.signUp);
userRouer.patch("/confirm", user_service_1.default.confirmEmail);
userRouer.post("/signin", (0, validation_1.validation)(UV.signInSchema), user_service_1.default.signIn);
userRouer.get("/profile", (0, authentication_1.Authentication)(), user_service_1.default.getProfile);
userRouer.post("/logout", (0, authentication_1.Authentication)(), (0, validation_1.validation)(UV.logoutSchema), user_service_1.default.logout);
userRouer.get("/refresh", (0, authentication_1.Authentication)(token_1.TokenType.refresh), user_service_1.default.refreshToken);
userRouer.get("/loginWithGmail", (0, validation_1.validation)(UV.loginWithGmailSchema), user_service_1.default.loginWithGmail);
userRouer.patch("/forgetPassword", (0, validation_1.validation)(UV.forgetPasswordSchema), user_service_1.default.forgetPassword);
userRouer.patch("/resetPassword", (0, validation_1.validation)(UV.resetPasswordSchema), user_service_1.default.resetPassword);
exports.default = userRouer;
