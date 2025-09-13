import mongoose, { Types } from "mongoose";
import { boolean, string } from "zod";


export interface IRevokeToken{
    userId:Types.ObjectId,
    tokenId:string,
    expireAt:Date
}

const revokSchema =new mongoose.Schema<IRevokeToken>({
    userId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"User"},
    tokenId:{type:String,required:true},
    expireAt:{type:Date,required:true}
},{
    timestamps:true,
    toObject:{virtuals:true},
    toJSON:{virtuals:true}
})



const RevokTokenModdel =mongoose.models.RevokToken||mongoose.model<IRevokeToken>("RevokToken",revokSchema)
export default RevokTokenModdel