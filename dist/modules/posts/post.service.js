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
const post_model_1 = __importStar(require("../../model/post.model"));
const s3_config_1 = require("../../utils/s3.config");
const uuid_1 = require("uuid");
const post_validation_1 = require("./post.validation");
class UserService {
    _userModel = new user_repository_1.UserRepository(user_model_1.default);
    _postModel = new post_repository_copy_1.postRepository(post_model_1.default);
    constructor() { }
    createPost = async (req, res, next) => {
        if (req?.body?.tags?.length && (await this._userModel.find({ filter: { _id: { $in: req?.body?.tags } } })).length !== req?.body?.tags?.length) {
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
        const post = await this._postModel.findOneAndUpdate({ _id: postId,
            $or: [
                { availability: post_model_1.AvailabilityEnum.public },
                { availability: post_model_1.AvailabilityEnum.private, createdBy: req.user?._id },
                { availability: post_model_1.AvailabilityEnum.friends, createdBy: { $in: { ...req.user?.friends || req.user?._id } } }
            ]
        }, updateQuery, { new: true });
        if (!post) {
            throw new classError_1.AppError("failed to like post", 404);
        }
        return res.status(200).json({ message: "welcom", post });
    };
    updatePost = async (req, res, next) => {
        const { postId } = req.params;
        const post = await this._postModel.findOne({ _id: postId });
        if (!post) {
            throw new classError_1.AppError("failed to update post or not authrized", 404);
        }
        if (req?.body?.content) {
            post.content == req.body.content;
        }
        if (req?.body?.availability) {
            post.availability == req.body.availability;
        }
        if (req?.body?.allowcomments) {
            post.allowcomments = req.body.allowcomments;
        }
        if (req?.files?.length) {
            await (0, s3_config_1.deleteFiles)({ urls: post.attachments || [] });
            post.attachments = await (0, s3_config_1.uploadFiles)({
                files: req?.files,
                path: `users/${req?.user?._id}/posts/${post.assetFolderId}`
            });
        }
        if (req?.body?.tags?.length) {
            if (req?.body?.tags?.length && (await this._userModel.find({ filter: { _id: { $in: req?.body?.tags } } })).length !== req?.body?.tags?.length) {
                throw new classError_1.AppError("invalid your id", 400);
            }
            post.tags = req.body.tags;
        }
        await post.save();
        return res.status(200).json({ message: "welcom", post });
    };
    getPosts = async (req, res, next) => {
        let { page = 1, limit = 5 } = req.query;
        const { curentPage, docs, countDocuments, numberOfPages } = await this._postModel.paginate({ filter: {}, query: { page, limit } });
        return res.status(200).json({ message: "welcom", curentPage, numberOfPages, countDocuments, posts: docs });
    };
}
exports.default = new UserService();
