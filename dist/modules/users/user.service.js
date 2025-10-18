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
const classError_1 = require("../../utils/classError");
const user_validation_1 = require("./user.validation");
const user_model_1 = __importStar(require("../../model/user.model"));
const user_repository_1 = require("../../DB/repositories/user.repository");
const hash_1 = require("../../utils/hash");
const event_1 = require("../../utils/event");
const sendEmail_1 = require("../../service/sendEmail");
const token_1 = require("../../utils/token");
const uuid_1 = require("uuid");
const revok_repository_1 = require("../../DB/repositories/revok.repository");
const revok_Token_1 = __importDefault(require("../../model/revok.Token"));
const google_auth_library_1 = require("google-auth-library");
const s3_config_1 = require("../../utils/s3.config");
const node_util_1 = require("node:util");
const node_stream_1 = require("node:stream");
const post_repository_copy_1 = require("../../DB/repositories/post.repository copy");
const post_model_1 = __importDefault(require("../../model/post.model"));
const sendRequest_model_1 = __importDefault(require("../../model/sendRequest.model"));
const friendRequest_repository_1 = require("../../DB/repositories/friendRequest.repository");
const chat_repository_1 = require("../../DB/repositories/chat.repository");
const chat_model_1 = __importDefault(require("../../model/chat.model"));
const writePipeLine = (0, node_util_1.promisify)(node_stream_1.pipeline);
class UserService {
    _userModel = new user_repository_1.UserRepository(user_model_1.default);
    _revokToken = new revok_repository_1.RevokTokenRepository(revok_Token_1.default);
    _postModel = new post_repository_copy_1.postRepository(post_model_1.default);
    _friendRequestModel = new friendRequest_repository_1.FriendRequestRepository(sendRequest_model_1.default);
    _chatModel = new chat_repository_1.ChatRepository(chat_model_1.default);
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
        const user = await this._userModel.findOne({ email, confirmed: { $exists: true }, provider: user_model_1.ProviderType.system });
        if (!user) {
            throw new classError_1.AppError("user not found or confirmed yet", 405);
        }
        if (!await (0, hash_1.Compare)(password, user?.password)) {
            throw new classError_1.AppError("invalid password", 405);
        }
        if (user.isTwoFAEnabled) {
            const otp = Math.floor(100000 + Math.random() * 900000);
            const hashedOTP = await (0, hash_1.Hash)(String(otp));
            user.loginOtp = hashedOTP;
            user.loginOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);
            await user.save();
            event_1.eventEmitter.emit("sendEmail", { email: user.email, otp });
            return res.status(200).json({ message: "OTP sent to your email, please confirm login" });
        }
        const jwtid = (0, uuid_1.v4)();
        const access_token = await (0, token_1.GenerateToken)({
            payload: { id: user._id, email: user.email },
            signature: user?.role == user_model_1.RoleType.user ? process.env.ACCESS_TOKEN_USER : process.env.ACCESS_TOKEN_ADMIN,
            options: { expiresIn: 60 * 60, jwtid }
        });
        const refresh_token = await (0, token_1.GenerateToken)({
            payload: { id: user._id, email: user.email },
            signature: user?.role == user_model_1.RoleType.user ? process.env.REFRESH_TOKEN_USER : process.env.REFRESH_TOKEN_ADMIN,
            options: { expiresIn: "1y", jwtid }
        });
        return res.status(200).json({ message: "welcome", access_token, refresh_token });
    };
    getProfile = async (req, res, next) => {
        const user = await this._userModel.findOne({ _id: req?.user?._id }, undefined, {
            populate: [{
                    path: "friends"
                }]
        });
        const groups = await this._chatModel.find({
            filter: {
                participants: { $in: [req?.user?._id] },
                group: { $exists: true }
            }
        });
        return res.status(200).json({ message: "success", user: req.user });
    };
    logout = async (req, res, next) => {
        const { flag } = req.body;
        if (flag === user_validation_1.flagType.all) {
            await this._userModel.updateOne({ _id: req.user?._id }, { changCredentials: new Date() });
            return res.status(200).json({ message: "success ,log out from all devices" });
        }
        await this._revokToken.create({
            tokenId: req.decoded?.jti,
            userId: req.user?._id,
            expireAt: new Date(req.decoded?.exp * 1000)
        });
        return res.status(200).json({ message: "success log out from this device" });
    };
    refreshToken = async (req, res, next) => {
        const jwtid = (0, uuid_1.v4)();
        const access_token = await (0, token_1.GenerateToken)({
            payload: { id: req?.user?._id, email: req?.user?.email },
            signature: req?.user?.role == user_model_1.RoleType.user ? process.env.ACCESS_TOKEN_USER : process.env.ACCESS_TOKEN_ADMIN,
            options: { expiresIn: 60 * 60, jwtid }
        });
        const refresh_token = await (0, token_1.GenerateToken)({
            payload: { id: req?.user?._id, email: req?.user?.email },
            signature: req?.user?.role == user_model_1.RoleType.user ? process.env.REFRESH_TOKEN_USER : process.env.REFRESH_TOKEN_ADMIN,
            options: { expiresIn: "1y", jwtid }
        });
        await this._revokToken.create({
            tokenId: req.decoded?.jti,
            userId: req.user?._id,
            expireAt: new Date(req.decoded?.exp * 1000)
        });
        return res.status(200).json({ message: "welcome", access_token, refresh_token });
    };
    loginWithGmail = async (req, res, next) => {
        const { idToken } = req.body;
        const client = new google_auth_library_1.OAuth2Client();
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.WEB_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            return payload;
        }
        const { email, email_verified, picture, name } = await verify();
        let user = await this._userModel.findOne({ email });
        if (!user) {
            user = await this._userModel.create({
                email: email,
                image: picture,
                userName: name,
                confirmed: email_verified,
                provider: user_model_1.ProviderType.google
            });
        }
        if (user?.provider === user_model_1.ProviderType.system) {
            throw new classError_1.AppError("please login on system");
        }
        const jwtid = (0, uuid_1.v4)();
        const access_token = await (0, token_1.GenerateToken)({
            payload: { id: user._id, email: user.email },
            signature: user?.role == user_model_1.RoleType.user ? process.env.ACCESS_TOKEN_USER : process.env.ACCESS_TOKEN_ADMIN,
            options: { expiresIn: 60 * 60, jwtid }
        });
        const refresh_token = await (0, token_1.GenerateToken)({
            payload: { id: user._id, email: user.email },
            signature: user?.role == user_model_1.RoleType.user ? process.env.REFRESH_TOKEN_USER : process.env.REFRESH_TOKEN_ADMIN,
            options: { expiresIn: "1y", jwtid }
        });
        return res.status(200).json({ message: "welcome", access_token, refresh_token });
    };
    forgetPassword = async (req, res, next) => {
        const { email } = req.body;
        const user = await this._userModel.findOne({ email, confirmed: { $exists: true } });
        if (!user) {
            throw new classError_1.AppError("email not exist or already confirmed", 405);
        }
        const otp = await (0, sendEmail_1.GeneratOTP)();
        const hashedOTP = await (0, hash_1.Hash)(String(otp));
        event_1.eventEmitter.emit("forgetPassword", { email, otp });
        await this._userModel.updateOne({ email: user?.email }, { otp: hashedOTP });
        return res.status(200).json({ message: "success send otp" });
    };
    resetPassword = async (req, res, next) => {
        const { email, otp, password, cPassword } = req.body;
        const user = await this._userModel.findOne({ email, otp: { $exists: true } });
        if (!user) {
            throw new classError_1.AppError("email not found", 405);
        }
        if (!await (0, hash_1.Compare)(otp, user?.otp)) {
            throw new classError_1.AppError("invalid otp");
        }
        const hash = await (0, hash_1.Hash)(password);
        await this._userModel.updateOne({ email: user?.email }, { password: hash, $unset: { otp: "" } });
        return res.status(200).json({ message: "success" });
    };
    uploadImage = async (req, res, next) => {
        const { originalname, ContentType } = req.body;
        const { url, Key } = await (0, s3_config_1.createUpliadFilePreSignUrl)({
            originalname,
            ContentType,
            path: `users/${req.user?._id}/coverImage`
        });
        const user = await this._userModel.findOneAndUpdate({
            _id: req.user?._id
        }, {
            profileImage: Key,
            tempProfileImage: req.user?.profileImage
        });
        if (!user) {
            throw new classError_1.AppError("user not found", 404);
        }
        event_1.eventEmitter.emit("UploadProfileImage", { userId: req.user?._id, oldKey: req.user?.profileImage, Key, expiresIn: 60 });
        return res.status(200).json({ message: "success", user, url });
    };
    getfile = async (req, res, next) => {
        const { path } = req.params;
        const { downloadName } = req.query;
        const Key = path.join("/");
        const result = await (0, s3_config_1.getFile)({
            Key
        });
        const stream = result.Body;
        stream.pipe(res);
        res.setHeader("Content-Type", result?.ContentType);
        if (downloadName) {
            res.setHeader("Content-Disposition", `attachment;filename${downloadName || path.join("/").split("/").pop()}`);
        }
        await writePipeLine(stream, res);
        return res.status(200).json({ message: "success", result });
    };
    creatFile = async (req, res, next) => {
        const { path } = req.params;
        const Key = path.join("/");
        const { downloadName } = req.query;
        const url = await (0, s3_config_1.createGetFileSignedUrl)({
            Key,
            downloadName: downloadName ? downloadName : undefined
        });
        return res.status(200).json({ message: "success", url });
    };
    deletefile = async (req, res, next) => {
        const { path } = req.params;
        const Key = path.join("/");
        const url = await (0, s3_config_1.deleteFile)({
            Key,
        });
        return res.status(200).json({ message: "success", url });
    };
    deletefiles = async (req, res, next) => {
        const { path } = req.params;
        const Key = path.join("/");
        const url = await (0, s3_config_1.deleteFiles)({
            urls: [
                "socialmediaApp/users/68cf0c47191f79cdc7fee5ee/545fd7fd-3cdf-4b03-a145-8c0f45f75918_Screenshot 2025-07-27 221230.png"
            ]
        });
        return res.status(200).json({ message: "success", url });
    };
    listfile = async (req, res, next) => {
        let result = await (0, s3_config_1.listFiles)({
            path: "users/68cf0c47191f79cdc7fee5ee"
        });
        if (!result?.Contents) {
            throw new classError_1.AppError("not found", 404);
        }
        result = result?.Contents?.map((item) => item.Key);
        return res.status(200).json({ message: "success", result });
    };
    deleteFolder = async (req, res, next) => {
        let result = await (0, s3_config_1.listFiles)({
            path: "users/68cf0c47191f79cdc7fee5ee"
        });
        if (!result?.Contents) {
            throw new classError_1.AppError("not found", 404);
        }
        result = result?.Contents?.map((item) => item.Key);
        await (0, s3_config_1.deleteFiles)({
            urls: result,
            Quiet: true
        });
        return res.status(200).json({ message: "success", result });
    };
    freezeAccount = async (req, res, next) => {
        const { userId } = req.params;
        if (userId && req.user?.role !== user_model_1.RoleType.admin) {
            throw new classError_1.AppError("unAuthorized", 405);
        }
        const user = await this._userModel.findOneAndUpdate({ _id: userId || req.user?._id, deletedAt: { $exists: false } }, { deletedAt: new Date(), deletedBy: req.user?._id, changCredentials: new Date() });
        if (!user) {
            throw new classError_1.AppError("user not found", 405);
        }
        return res.status(200).json({ message: "success" });
    };
    unfreezeAccount = async (req, res, next) => {
        const { userId } = req.params;
        if (req.user?.role !== user_model_1.RoleType.admin) {
            throw new classError_1.AppError("unAuthorized", 405);
        }
        const user = await this._userModel.findOneAndUpdate({ _id: userId, deletedAt: { xists: false }, deletedBy: { $ne: userId } }, {
            $unset: { deletedAt: "", deletedBy: "" },
            restoredAt: new Date(),
            restoredBy: req.user?._id
        });
        if (!user) {
            throw new classError_1.AppError("user not found", 405);
        }
        return res.status(200).json({ message: "success" });
    };
    updatePassword = async (req, res, next) => {
        const { email, newPassword } = req.body;
        const user = await this._userModel.findOne({ email });
        if (!user) {
            throw new classError_1.AppError("User not found", 404);
        }
        const hashedPassword = await (0, hash_1.Hash)(newPassword);
        await this._userModel.updateOne({ email }, { password: hashedPassword });
        return res.status(200).json({ message: "Password updated successfully" });
    };
    updateEmail = async (req, res, next) => {
        const { oldEmail, newEmail } = req.body;
        const user = await this._userModel.findOne({ email: oldEmail });
        if (!user) {
            throw new classError_1.AppError("User not found", 404);
        }
        const isTaken = await this._userModel.findOne({ email: newEmail });
        if (isTaken) {
            throw new classError_1.AppError("New email is already in use", 409);
        }
        await this._userModel.updateOne({ email: oldEmail }, { email: newEmail, confirmed: false });
        const otp = await (0, sendEmail_1.GeneratOTP)();
        const hashedOTP = await (0, hash_1.Hash)(String(otp));
        await this._userModel.updateOne({ email: newEmail }, { otp: hashedOTP });
        event_1.eventEmitter.emit("updateEmail", { email: newEmail, otp });
        return res.status(200).json({ message: "Email updated successfully" });
    };
    dashBoard = async (req, res, next) => {
        const result = await Promise.all([
            this._userModel.find({ filter: {} }),
            this._postModel.find({ filter: {} }),
        ]);
    };
    sendRequest = async (req, res, next) => {
        const { userId } = req.params;
        const user = await this._userModel.findOne({ _id: userId });
        if (!user) {
            throw new classError_1.AppError("user not found", 404);
        }
        const checkRequest = await this._friendRequestModel.findOne({
            createdBy: { $in: [req.user?._id, userId] },
            sendTo: { $in: [req.user?._id, userId] }
        });
        if (req.user?._id == userId) {
            throw new classError_1.AppError("you can't send requesr to yourself", 400);
        }
        if (checkRequest) {
            throw new classError_1.AppError("request already sent", 400);
        }
        const friendRequest = await this._friendRequestModel.create({
            createdBy: req.user?._id,
            sendTo: userId
        });
        return res.status(200).json({ message: "success", friendRequest });
    };
    acceptRequest = async (req, res, next) => {
        const { requestId } = req.params;
        const checkRequest = await this._friendRequestModel.findOneAndUpdate({
            _id: requestId,
            sendTo: req.user?._id,
            acceptedAt: { $exists: false }
        }, { acceptedAt: new Date() }, { new: true });
        if (!checkRequest) {
            throw new classError_1.AppError("request not found", 400);
        }
        await Promise.all([
            this._userModel.updateOne({ _id: checkRequest.createdBy }, { $push: { friends: checkRequest.sendTo } }),
            this._userModel.updateOne({ _id: checkRequest.sendTo }, { $push: { friends: checkRequest.createdBy } }),
        ]);
        return res.status(200).json({ message: "success" });
    };
}
exports.default = new UserService();
