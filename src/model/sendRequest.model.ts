import mongoose, { model, models, Types } from "mongoose"
import { Schema } from "mongoose"


export interface IFriendRequest{
    createdBy:Types.ObjectId,
    sendTo?:Types.ObjectId,
    acceptedAt?:Date,
}

const FriendRequestSchema =new mongoose.Schema<IFriendRequest>({
    acceptedAt:{type:Date},
    createdBy:{type:Schema.Types.ObjectId,ref:"User",required:true},
    sendTo:{type:Schema.Types.ObjectId,ref:"User",required:true}
},{
    timestamps:true,
    strictQuery:true
})

FriendRequestSchema.pre(["find","findOne","findOneAndDelete","findOneAndUpdate"],async function(next){
    const query = this.getQuery()
    const {paranoid,...rest}=query
    if(paranoid===false){
        this.setQuery({...rest,deletedAt:{$exists:true}})
    }else{
        this.setQuery({...rest,deletedAt:{$exists:false}})
    }
    next()
})

const FriendRequestModdel =models.FriendRequest || model("FriendRequest",FriendRequestSchema)
export default FriendRequestModdel