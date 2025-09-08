"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = __importDefault(require("./user.service"));
const validation_1 = require("../../middleware/validation");
const user_validation_1 = require("./user.validation");
const userRouer = (0, express_1.Router)();
userRouer.post("/signup", (0, validation_1.validation)(user_validation_1.signUpSchema), user_service_1.default.signUp);
userRouer.patch("/confirm", user_service_1.default.confirmEmail);
userRouer.post("/signin", (0, validation_1.validation)(user_validation_1.signInSchema), user_service_1.default.signIn);
exports.default = userRouer;
