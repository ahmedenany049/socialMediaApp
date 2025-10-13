import mongoose, { model, models, Schema, Types } from "mongoose";

export interface IMessage{
    content:string,
    createdBy:Types.ObjectId,
    createdAt?:Date,
    updatedAt?:Date
}

export interface IChat{
    participants:Types.ObjectId[],
    createdBy:Types.ObjectId,
    messages:IMessage[]

    group?:string,
    groupimage?:string,
    roomId?:string
}

const messagesSchema = new Schema<IMessage>({
    content:{type:String,required:true},
    createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"}
})

const chatSchema = new Schema<IChat>({
    participants:[{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}],
    createdBy:{type:mongoose.Schema.Types.ObjectId},
    messages:[messagesSchema]
},{
    timestamps:true
})
const chatModel = models.Chat || model("Chat",chatSchema)
export default chatModel

