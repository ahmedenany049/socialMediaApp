"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmEmailSchema = exports.signUpSchema = exports.signInSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_model_1 = require("../../model/user.model");
exports.signInSchema = {
    body: zod_1.default.strictObject({
        email: zod_1.default.string().email(),
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
        otp: zod_1.default.string().regex(/^\d{6$}/).trim(),
    }).required()
};
