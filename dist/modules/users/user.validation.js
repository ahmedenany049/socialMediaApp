"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgetPasswordSchema = exports.loginWithGmailSchema = exports.logoutSchema = exports.confirmEmailSchema = exports.signUpSchema = exports.signInSchema = exports.flagType = void 0;
const zod_1 = __importDefault(require("zod"));
const user_model_1 = require("../../model/user.model");
var flagType;
(function (flagType) {
    flagType["all"] = "all";
    flagType["currrent"] = "current";
})(flagType || (exports.flagType = flagType = {}));
exports.signInSchema = {
    body: zod_1.default.strictObject({
        email: zod_1.default.email(),
        password: zod_1.default.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    }).required()
};
exports.signUpSchema = {
    body: exports.signInSchema.body.extend({
        userName: zod_1.default.string().min(3).trim(),
        cPassword: zod_1.default.string(),
        phone: zod_1.default.string(),
        age: zod_1.default.number(),
        gender: zod_1.default.enum([user_model_1.GenderType.male, user_model_1.GenderType.female]),
        address: zod_1.default.string()
    }).required().superRefine((data, ctx) => {
        if (data.password !== data.cPassword) {
            ctx.addIssue({ code: "custom", path: ["cPassword"], message: "password not match" });
        }
    })
};
exports.confirmEmailSchema = {
    body: zod_1.default.strictObject({
        email: zod_1.default.string().email(),
        otp: zod_1.default.string().trim().regex(/^\d{6}$/),
    }).required()
};
exports.logoutSchema = {
    body: zod_1.default.strictObject({
        flag: zod_1.default.enum(flagType)
    }).required()
};
exports.loginWithGmailSchema = {
    body: zod_1.default.strictObject({
        idToken: zod_1.default.string(),
    }).required()
};
exports.forgetPasswordSchema = {
    body: zod_1.default.strictObject({
        email: zod_1.default.email(),
    }).required()
};
exports.resetPasswordSchema = {
    body: exports.confirmEmailSchema.body.extend({
        password: zod_1.default.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
        cPassword: zod_1.default.string()
    }).required().superRefine((value, ctx) => {
        if (value.password !== value.cPassword) {
            ctx.addIssue({
                code: "custom",
                path: ["cPassword"],
                message: "password not match"
            });
        }
    })
};
