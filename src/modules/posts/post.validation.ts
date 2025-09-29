import * as z from "zod"
import { AllowCommentEnum, AvailabilityEnum } from "../../model/post.model"
import { generalRules } from "../../utils/generalRules"

export const createPostSchema ={
    body:z.strictObject({
        content:z.string().min(5).max(10000).optional(),
        attachments:z.array(generalRules.file).min(1).max(2).optional(),
        assetFolderId:z.string().optional(),
        allowcomments:z.enum(AllowCommentEnum).default(AllowCommentEnum.allow).optional(),
        availability:z.enum(AvailabilityEnum).default(AvailabilityEnum.public).optional(),
        tags:z.array(generalRules.id).refine((value)=>{
            return new Set(value).size===value.length
        },{message:"Duplicate tags"})
    }).superRefine((data,ctx)=>{
        if(!data.content&&!data.attachments?.length){
            ctx.addIssue({
                code:"custom",
                path:["content"],
                message:"content or empty you are must enter content at least"
            })
        }
    })
}

export enum ActionEnum{
    like="like",
    unlike="unlike"
}
export const likePostSchema = {
    params:z.strictObject({
        postId:generalRules.id
    }),
    query:z.strictObject({
        action:z.enum(ActionEnum).default(ActionEnum.like)
    })
} 
export type likePostSchemaType = z.infer<typeof likePostSchema.params> 
export type unlikeType = z.infer<typeof likePostSchema.query> 