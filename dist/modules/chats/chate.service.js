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
const mongoose_1 = require("mongoose");
const s3_config_1 = require("../../utils/s3.config");
const uuid_1 = require("uuid");
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
    getChatGroup = async (req, res, next) => {
        const { groupId } = req.params;
        const Chat = await this._chatModel.findOne({
            _id: groupId,
            participants: {
                $in: [req?.user?._id]
            },
            group: { $exists: true }
        }, undefined, {
            populate: [{
                    path: "messages.createdBy"
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
    join_room = async (data, socket, io) => {
        const { roomId } = data;
        const chat = await this._chatModel.findOne({
            roomId,
            participants: {
                $in: [socket.data.user._id]
            },
            group: { $exists: true }
        });
        if (!chat) {
            throw new classError_1.AppError("chat not found", 404);
        }
        socket.join(chat?.roomId);
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
    sendGroupMessage = async (data, socket, io) => {
        const { groupId, content } = data;
        const createdBy = socket?.data?.user?._id;
        const Chat = await this._chatModel.findOneAndUpdate({
            _id: groupId,
            participants: {
                $all: [createdBy]
            },
            group: { $exists: true }
        }, {
            $push: {
                messages: {
                    content,
                    createdBy
                }
            }
        });
        if (!Chat) {
            throw new classError_1.AppError("chat not found", 404);
        }
        io.to(geteway_1.connectionSocket.get(createdBy.toString())).emit("successMessage", { content });
        io.to(Chat.roomId).emit("newMessage", { content, from: socket.data.user, groupId });
    };
    createGroupChat = async (req, res, next) => {
        let { group, groupimage, participants } = req.body;
        const createdBy = req.user?._id;
        const dbParticipants = participants.map((participants) => mongoose_1.Types.ObjectId.createFromHexString(participants));
        const users = await this._userModel.find({
            filter: {
                _id: {
                    $in: participants
                },
                friends: {
                    $in: [createdBy]
                }
            }
        });
        if (users.length !== participants.length) {
            throw new classError_1.AppError("user not found", 405);
        }
        const roomId = group.replaceAll(/\s+/g, "_") + "_" + (0, uuid_1.v4)();
        if (req?.file) {
            groupimage = await (0, s3_config_1.uploadFile)({
                path: `chat/${roomId}`,
                file: req.file
            });
        }
        dbParticipants.push(createdBy);
        const chat = await this._chatModel.create({
            group,
            groupimage,
            participants: dbParticipants,
            createdBy,
            roomId,
            messages: []
        });
        if (!chat) {
            if (groupimage) {
                await (0, s3_config_1.deleteFile)({ Key: groupimage });
            }
            throw new classError_1.AppError("chat not created", 404);
        }
        return res.status(200).json({ message: "success", chat });
    };
}
exports.chatService = chatService;
