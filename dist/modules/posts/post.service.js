"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const classError_1 = require("../../utils/classError");
const user_model_1 = __importDefault(require("../../model/user.model"));
const user_repository_1 = require("../../DB/repositories/user.repository");
const post_repository_copy_1 = require("../../DB/repositories/post.repository copy");
const post_model_1 = __importDefault(require("../../model/post.model"));
const s3_config_1 = require("../../utils/s3.config");
const uuid_1 = require("uuid");
const post_validation_1 = require("./post.validation");
class UserService {
    _userModel = new user_repository_1.UserRepository(user_model_1.default);
    _postModel = new post_repository_copy_1.postRepository(post_model_1.default);
    constructor() { }
    createPost = async (req, res, next) => {
        if (req?.body?.tags?.length && (await this._userModel.find({ _id: { $in: req?.body?.tags } })).length !== req?.body?.tags?.length) {
            throw new classError_1.AppError("invalid id", 400);
        }
        const assetFolderId = (0, uuid_1.v4)();
        let attachments = [];
        if (req.files?.length) {
            attachments = await (0, s3_config_1.uploadFiles)({
                files: req?.files,
                path: `users/${req?.user?._id}/posts/${assetFolderId}`
            });
        }
        const post = await this._postModel.create({
            ...req.body,
            attachments,
            assetFolderId,
            createdBy: req.user?._id
        });
        if (!post) {
            await (0, s3_config_1.deleteFiles)({ urls: attachments || [] });
            throw new classError_1.AppError("failed to create post", 400);
        }
        return res.status(200).json({ message: "welcom", post });
    };
    likePost = async (req, res, next) => {
        const { postId } = req.params;
        const { action } = req.query;
        let updateQuery = { $addToSet: { likes: req?.user?._id } };
        if (action === post_validation_1.ActionEnum.unlike) {
            updateQuery = { $pull: { likes: req?.user?._id } };
        }
        const post = await this._postModel.findOneAndUpdate({ _id: postId }, updateQuery, { new: true });
        if (!post) {
            throw new classError_1.AppError("failed to like post", 404);
        }
        return res.status(200).json({ message: "welcom", post });
    };
}
exports.default = new UserService();
