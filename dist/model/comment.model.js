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
const mongoose_1 = __importStar(require("mongoose"));
const mongoose_2 = require("mongoose");
const commentSchema = new mongoose_1.default.Schema({
    content: { type: String, minLength: 5, maxLength: 10000, required: function () { return this.attachments?.length === 0; } },
    attachments: [String],
    assetFolderId: String,
    createdBy: { type: mongoose_2.Schema.Types.ObjectId, ref: "User", required: true },
    likes: [{ type: mongoose_2.Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: mongoose_2.Schema.Types.ObjectId, ref: "User" }],
    deleteAt: { type: Date },
    postId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Post", required: true },
    deleteBy: { type: mongoose_2.Schema.Types.ObjectId, ref: "User" },
    restoreAt: { type: Date },
    restoreBy: { type: mongoose_2.Schema.Types.ObjectId, ref: "User" }
}, {
    timestamps: true,
    strictQuery: true
});
commentSchema.pre(["find", "findOne", "findOneAndDelete", "findOneAndUpdate"], async function (next) {
    const query = this.getQuery();
    const { paranoid, ...rest } = query;
    if (paranoid === false) {
        this.setQuery({ ...rest });
    }
    else {
        this.setQuery({ ...rest, deletedAt: { $exists: false } });
    }
    next();
});
const commentModdel = mongoose_1.models.Post || (0, mongoose_1.model)("Comment", commentSchema);
exports.default = commentModdel;
