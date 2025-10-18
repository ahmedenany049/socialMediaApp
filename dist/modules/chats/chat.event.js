"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatEvent = void 0;
const chate_service_1 = require("./chate.service");
class ChatEvent {
    _chatService = new chate_service_1.chatService();
    constructor() { }
    sayHi = (socket, io) => {
        return socket.on("sayHi", (data) => {
            this._chatService.sayHi(data, socket, io);
        });
    };
    sendMessage = (socket, io) => {
        return socket.on("sendMessage", (data) => {
            this._chatService.sendMessage(data, socket, io);
        });
    };
    join_room = (socket, io) => {
        return socket.on("join_room", (data) => {
            this._chatService.join_room(data, socket, io);
        });
    };
    sendGroupMessage = (socket, io) => {
        return socket.on("sendGroupMessage", (data) => {
            this._chatService.sendGroupMessage(data, socket, io);
        });
    };
}
exports.ChatEvent = ChatEvent;
