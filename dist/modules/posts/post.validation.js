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
exports.likePostSchema = exports.ActionEnum = exports.createPostSchema = void 0;
const z = __importStar(require("zod"));
const post_model_1 = require("../../model/post.model");
const generalRules_1 = require("../../utils/generalRules");
exports.createPostSchema = {
    body: z.strictObject({
        content: z.string().min(5).max(10000).optional(),
        attachments: z.array(generalRules_1.generalRules.file).min(1).max(2).optional(),
        assetFolderId: z.string().optional(),
        allowcomments: z.enum(post_model_1.AllowCommentEnum).default(post_model_1.AllowCommentEnum.allow).optional(),
        availability: z.enum(post_model_1.AvailabilityEnum).default(post_model_1.AvailabilityEnum.public).optional(),
        tags: z.array(generalRules_1.generalRules.id).refine((value) => {
            return new Set(value).size === value.length;
        }, { message: "Duplicate tags" })
    }).superRefine((data, ctx) => {
        if (!data.content && !data.attachments?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "content or empty you are must enter content at least"
            });
        }
    })
};
var ActionEnum;
(function (ActionEnum) {
    ActionEnum["like"] = "like";
    ActionEnum["unlike"] = "unlike";
})(ActionEnum || (exports.ActionEnum = ActionEnum = {}));
exports.likePostSchema = {
    params: z.strictObject({
        postId: generalRules_1.generalRules.id
    }),
    query: z.strictObject({
        action: z.enum(ActionEnum).default(ActionEnum.like)
    })
};
