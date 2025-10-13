"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatGeteway = void 0;
const chat_event_1 = require("./chat.event");
class chatGeteway {
    chatEvent = new chat_event_1.ChatEvent();
    constructor() { }
    regester = (socket, io) => {
        this.chatEvent.sayHi(socket, io);
        this.chatEvent.sendMessage(socket, io);
    };
}
exports.chatGeteway = chatGeteway;
