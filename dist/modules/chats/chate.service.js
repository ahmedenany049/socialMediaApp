"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = void 0;
const classError_1 = require("../../utils/classError");
const chat_repository_1 = require("../../DB/repositories/chat.repository");
const chat_model_1 = __importDefault(require("../../model/chat.model"));
const user_repository_1 = require("../../DB/repositories/user.repository");
const user_model_1 = __importDefault(require("../../model/user.model"));
const geteway_1 = require("../geteway/geteway");
class chatService {
    _chatModel = new chat_repository_1.ChatRepository(chat_model_1.default);
    _userModel = new user_repository_1.UserRepository(user_model_1.default);
    constructor() { }
    getChat = async (req, res, next) => {
        const { userId } = req.params;
        const Chat = await this._chatModel.findOne({
            participants: {
                $all: [userId, req?.user?._id]
            },
            group: { $exists: false }
        }, undefined, {
            populate: [{
                    path: "participants"
                }]
        });
        if (!Chat) {
            throw new classError_1.AppError("chat not found", 404);
        }
        return res.status(200).json({ message: "success", Chat });
    };
    sayHi = (data, socket, io) => {
        console.log(data);
    };
    sendMessage = async (data, socket, io) => {
        const { chatId, sendTo, content } = data;
        const createdBy = socket?.data?.user?._id;
        const user = await this._userModel.findOne({
            _id: sendTo,
            friends: { $in: [createdBy] }
        });
        const Chat = await this._chatModel.findOneAndUpdate({
            participants: {
                $all: [createdBy, sendTo]
            },
            group: { $exists: false }
        }, {
            $push: {
                messages: {
                    content,
                    createdBy
                }
            }
        });
        if (!Chat) {
            const newChat = await this._chatModel.create({
                participants: [createdBy, sendTo],
                createdBy,
                messages: [{
                        content,
                        createdBy
                    }]
            });
            if (!newChat) {
                throw new classError_1.AppError("chat not found", 404);
            }
        }
        if (!user) {
            throw new classError_1.AppError("user not found", 404);
        }
        io.to(geteway_1.connectionSocket.get(createdBy.toString())).emit("successMessage", { content });
        io.to(geteway_1.connectionSocket.get(sendTo.toString())).emit("newMessage", { content, from: socket.data.user });
    };
}
exports.chatService = chatService;
