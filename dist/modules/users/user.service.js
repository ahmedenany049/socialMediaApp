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
Object.defineProperty(exports, "__esModule", { value: true });
const classError_1 = require("../../utils/classError");
const user_model_1 = __importStar(require("../../model/user.model"));
const user_repository_1 = require("../../DB/repositories/user.repository");
const hash_1 = require("../../utils/hash");
const event_1 = require("../../utils/event");
const sendEmail_1 = require("../../service/sendEmail");
const token_1 = require("../../utils/token");
class UserService {
    _userModel = new user_repository_1.UserRepository(user_model_1.default);
    constructor() { }
    signUp = async (req, res, next) => {
        let { userName, email, password, cPassword, gender, address, age, phone } = req.body;
        if (await this._userModel.findOne({ email })) {
            throw new classError_1.AppError("email already exist", 405);
        }
        const hash = await (0, hash_1.Hash)(password);
        const otp = await (0, sendEmail_1.GeneratOTP)();
        const hashedOTP = await (0, hash_1.Hash)(String(otp));
        const user = await this._userModel.creatOneUser({ userName, email, otp: hashedOTP, password: hash, gender, address, age, phone });
        event_1.eventEmitter.emit("confirmEmail", { email, otp });
        return res.status(200).json({ message: "welcom", user });
    };
    confirmEmail = async (req, res, next) => {
        const { email, otp } = req.body;
        const user = await this._userModel.findOne({ email, confirmed: { $exists: false } });
        if (!user) {
            throw new classError_1.AppError("email not exist or already confirmed", 405);
        }
        if (!await (0, hash_1.Compare)(otp, user?.otp)) {
            throw new classError_1.AppError("invalid Otp", 405);
        }
        await this._userModel.updateOne({ email: user?.email }, { confirmed: true, $unset: { otp: "" } });
        return res.status(200).json({ message: "confirmed.." });
    };
    signIn = async (req, res, next) => {
        const { email, password } = req.body;
        const user = await this._userModel.findOne({ email });
        if (!user) {
            throw new classError_1.AppError("user not found or confirmed yet", 405);
        }
        if (!await (0, hash_1.Compare)(password, user?.password)) {
            throw new classError_1.AppError("invalid password", 405);
        }
        const access_token = await (0, token_1.GenerateToken)({
            payload: { id: user._id, email: user.email },
            signature: user?.role == user_model_1.RoleType.user ? process.env.ACCESS_TOKEN_USER : process.env.ACCESS_TOKEN_ADMIN,
            options: { expiresIn: 60 * 60, }
        });
        const refresh_token = await (0, token_1.GenerateToken)({
            payload: { id: user._id, email: user.email },
            signature: user?.role == user_model_1.RoleType.user ? process.env.REFRESH_TOKEN_USER : process.env.REFRESH_TOKEN_ADMIN,
            options: { expiresIn: "1y", }
        });
        return res.status(200).json({ message: "welcome", access_token, refresh_token });
    };
}
exports.default = new UserService();
