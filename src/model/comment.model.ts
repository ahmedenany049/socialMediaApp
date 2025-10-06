import mongoose, { model, models, Types } from "mongoose"
import { Schema } from "mongoose"


export interface IComment{
    content?:string,
    attachments?:string[],
    assetFolderId:string,
    postId:Types.ObjectId,
    createdBy:Schema.Types.ObjectId,
    tags:Schema.Types.ObjectId[],
    likes:Schema.Types.ObjectId[],
    deleteAt?:Date,
    deleteBy?:Schema.Types.ObjectId,
    restoreAt?:Date,
    restoreBy?:Schema.Types.ObjectId
}

const commentSchema =new mongoose.Schema<IComment>({
    content:{type:String,minLength:5,maxLength:10000,required:function(){return this.attachments?.length===0}},
    attachments:[String],
    assetFolderId:String,
    createdBy:{type:Schema.Types.ObjectId,ref:"User",required:true},
    likes:[{type:Schema.Types.ObjectId,ref:"User"}],
    tags:[{type:Schema.Types.ObjectId,ref:"User"}],
    deleteAt:{type:Date},
    postId:{type:mongoose.Schema.Types.ObjectId,ref:"Post",required:true},
    deleteBy:{type:Schema.Types.ObjectId,ref:"User"},
    restoreAt:{type:Date},
    restoreBy:{type:Schema.Types.ObjectId,ref:"User"}
},{
    timestamps:true,
    strictQuery:true
})

commentSchema.pre(["find","findOne","findOneAndDelete","findOneAndUpdate"],async function(next){
    const query = this.getQuery()
    const {paranoid,...rest}=query
    if(paranoid===false){
        this.setQuery({...rest})
    }else{
        this.setQuery({...rest,deletedAt:{$exists:false}})
    }
    next()
})

const commentModdel =models.Post || model("Comment",commentSchema)
export default commentModdel