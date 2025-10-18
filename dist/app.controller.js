"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const classError_1 = require("./utils/classError");
const user_controller_1 = __importDefault(require("./modules/users/user.controller"));
const connectionDB_1 = __importDefault(require("./DB/connectionDB"));
const post_controller_1 = __importDefault(require("./modules/posts/post.controller"));
const geteway_1 = require("./modules/geteway/geteway");
const chat_controller_1 = __importDefault(require("./modules/chats/chat.controller"));
(0, dotenv_1.config)({ path: (0, path_1.resolve)("./config/.env") });
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 5 * 60 * 1000,
    limit: 10,
    message: {
        error: "game over........"
    },
    statusCode: 429,
    legacyHeaders: false
});
const bootStrap = async () => {
    app.use(express_1.default.json());
    app.use((0, cors_1.default)());
    app.use((0, helmet_1.default)());
    app.use(limiter);
    app.use("/users", user_controller_1.default);
    app.use("/posts", post_controller_1.default);
    app.use("/chat", chat_controller_1.default);
    await (0, connectionDB_1.default)();
    app.use("{/*demo}", (req, res, next) => {
        throw new classError_1.AppError(`invalid url ${req.originalUrl}`, 404);
    });
    app.use((err, req, res, next) => {
        return res.status(err.statusCode || 500).json({ message: err.message, stack: err.stack });
    });
    const httpServer = app.listen(port, () => {
        console.log(`server is running on port ${port}!`);
    });
    (0, geteway_1.initialzationio)(httpServer);
};
exports.default = bootStrap;
