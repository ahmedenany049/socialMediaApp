import mongoose, { model, models, Types } from "mongoose"
import { Schema } from "mongoose"


export enum AllowCommentEnum{
    allow="allow",
    deny="deny"
}
export enum AvailabilityEnum{
    public="public",
    private="private",
    friends="friends"
}

export interface IPost{
    content?:string,
    attachments?:string[],
    assetFolderId:string,
    createdBy:Schema.Types.ObjectId,
    tags:Schema.Types.ObjectId[],
    likes:Schema.Types.ObjectId[],
    allowcomments:AllowCommentEnum,
    availability:AvailabilityEnum,
    deleteAt?:Date,
    deleteBy?:Schema.Types.ObjectId,
    restoreAt?:Date,
    restoreBy?:Schema.Types.ObjectId
}

const PostSchema =new mongoose.Schema<IPost>({
    content:{type:String,minLength:5,maxLength:10000,required:function(){return this.attachments?.length===0}},
    attachments:[String],
    assetFolderId:String,
    createdBy:{type:Schema.Types.ObjectId,ref:"User",required:true},
    likes:[{type:Schema.Types.ObjectId,ref:"User"}],
    tags:[{type:Schema.Types.ObjectId,ref:"User"}],
    allowcomments:{type:String,enum:AllowCommentEnum,default:AllowCommentEnum.allow},
    availability:{type:String,enum:AvailabilityEnum,default:AvailabilityEnum.public},
    deleteAt:{type:Date},
    deleteBy:{type:Schema.Types.ObjectId,ref:"User"},
    restoreAt:{type:Date},
    restoreBy:{type:Schema.Types.ObjectId,ref:"User"}
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})



const PostModdel =models.Post || model("Post",PostSchema)
export default PostModdel