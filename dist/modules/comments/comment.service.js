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
const user_model_1 = __importDefault(require("../../model/user.model"));
const user_repository_1 = require("../../DB/repositories/user.repository");
const post_repository_copy_1 = require("../../DB/repositories/post.repository copy");
const uuid_1 = require("uuid");
const post_model_1 = __importStar(require("../../model/post.model"));
const comment_model_1 = __importDefault(require("../../model/comment.model"));
const comment_repository_1 = require("../../DB/repositories/comment.repository");
const s3_config_1 = require("../../utils/s3.config");
class UserService {
    _userModel = new user_repository_1.UserRepository(user_model_1.default);
    _postModel = new post_repository_copy_1.postRepository(post_model_1.default);
    _commentModel = new comment_repository_1.commentRepository(comment_model_1.default);
    constructor() { }
    createcomment = async (req, res, next) => {
        const { postId } = req.params;
        let { content, tags, attachments } = req.body;
        const post = await this._postModel.findOne({
            _id: postId,
            AllowComment: post_model_1.AllowCommentEnum.allow,
        });
        if (!post) {
            return next(new classError_1.AppError("post not found or you ar not authorized", 404));
        }
        if (tags?.length && (await this._userModel.find({ filter: { _id: { $in: tags } } })).length !== tags.length) {
            return next(new classError_1.AppError("some tags are not valid", 404));
        }
        const assetFolderId = (0, uuid_1.v4)();
        if (attachments?.length) {
            attachments = await (0, s3_config_1.uploadFiles)({
                files: req?.files,
                path: `users/${req?.user?._id}/posts/${post?.assetFolderId}/comments/${assetFolderId}`
            });
        }
        const comment = await this._commentModel.create({
            content,
            tags,
            attachments,
            assetFolderId,
            postId: postId,
        });
        if (!comment) {
            await (0, s3_config_1.deleteFiles)({
                urls: attachments || []
            });
        }
        return res.status(200).json({ message: "created", comment });
    };
}
exports.default = new UserService();
