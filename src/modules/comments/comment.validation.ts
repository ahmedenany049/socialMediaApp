import * as z from "zod"
import { generalRules } from "../../utils/generalRules"

export const createCommentSchema ={
    params:z.strictObject({
        postId:generalRules.id
    }),
    body:z.strictObject({
        content:z.string().min(5).max(10000).optional(),
        attachments:z.array(generalRules.file).min(1).max(2).optional(),
        tags:z.array(generalRules.id).refine((value)=>{
            return new Set(value).size===value.length
        },{message:"Duplicate tags"}).optional()
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

//export type createCommentSchemaType = z.infer<typeof createCommentSchema.body> 
