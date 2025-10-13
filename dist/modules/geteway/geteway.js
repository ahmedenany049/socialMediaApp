"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialzationio = exports.connectionSocket = void 0;
const socket_io_1 = require("socket.io");
const token_1 = require("../../utils/token");
const classError_1 = require("../../utils/classError");
const chat_geteway_1 = require("../chats/chat.geteway");
exports.connectionSocket = new Map();
let io = undefined;
const initialzationio = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*"
        }
    });
    io.use(async (socket, next) => {
        try {
            const { authorization } = socket.handshake.auth;
            const [prefix, token] = authorization.split(" ") || [];
            if (!prefix || !token) {
                return next(new classError_1.AppError("token not exist", 400));
            }
            const signature = await (0, token_1.GetSignature)(prefix);
            if (!signature) {
                return next(new classError_1.AppError("invalid signature", 400));
            }
            const { user, decoded } = await (0, token_1.decodedTokenAndFeTchUser)(token, signature);
            const socketIds = exports.connectionSocket.get(user?._id.toString()) || [];
            socketIds.push(socket.id);
            exports.connectionSocket.set(user._id.toString(), socketIds);
            console.log(exports.connectionSocket);
            socket.data.user = user;
            socket.decoded = decoded;
            next();
        }
        catch (error) {
            next(error);
        }
    });
    const chatGateway = new chat_geteway_1.chatGeteway();
    io.on("connection", (socket) => {
        chatGateway.regester(socket, io);
        console.log(exports.connectionSocket.get(socket?.user?._id?.toString()));
        function removeSocket() {
            let remaningTaps = exports.connectionSocket.get(socket?.user?._id?.toString() || "");
            remaningTaps?.filter((tap) => {
                return tap !== socket.id;
            });
            if (remaningTaps?.length) {
                exports.connectionSocket.set(socket?.user?._id?.toString(), remaningTaps);
            }
            else {
                exports.connectionSocket.delete(socket?.user?._id?.toString());
            }
            io.emit("userdisconnected", { userId: socket?.user?._id?.toString() });
        }
        socket.on("disconnect", () => {
            removeSocket();
        });
    });
};
exports.initialzationio = initialzationio;
