import { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/classError";
import userModdel from "../../model/user.model";
import { UserRepository } from "../../DB/repositories/user.repository";
import { postRepository } from "../../DB/repositories/post.repository copy";
import PostModdel, { IPost } from "../../model/post.model";
import {  deleteFiles, uploadFiles } from "../../utils/s3.config";
import { v4 as uuidv4 } from "uuid";
import { ActionEnum, likePostSchemaType, unlikeType } from "./post.validation";
import { UpdateQuery } from "mongoose";

class UserService {
    private _userModel =new UserRepository(userModdel)
    private _postModel =new postRepository(PostModdel)
    constructor(){}

    //========================================================================
    createPost = async(req:Request,res:Response,next:NextFunction)=>{
        if(req?.body?.tags?.length && (await this._userModel.find({_id:{$in:req?.body?.tags}})).length!==req?.body?.tags?.length){
            throw new AppError("invalid id",400)
        }
        const assetFolderId =uuidv4()
        let attachments :string[]=[]
        if(req.files?.length){
            attachments = await uploadFiles({
                files:req?.files as unknown as Express.Multer.File[],
                path:`users/${req?.user?._id}/posts/${assetFolderId}`
            })
        }
        const post = await this._postModel.create({
            ...req.body,
            attachments,
            assetFolderId,
            createdBy:req.user?._id
        })
        if(!post){
            await deleteFiles({urls:attachments||[]})
            throw new AppError("failed to create post",400)
        }
        return res.status(200).json({message:"welcom",post})
    }
    
    //======================================================================
    likePost= async(req:Request,res:Response,next:NextFunction)=>{
        const {postId}:likePostSchemaType = req.params as likePostSchemaType
        const{action}:unlikeType=req.query as unlikeType
        let updateQuery:UpdateQuery<IPost>= {$addToSet:{likes:req?.user?._id}}
        if(action===ActionEnum.unlike){
            //const post = await this._postModel.findOneAndUpdate({_id:postId},{...updateQuery},{new:true})
            updateQuery = {$pull:{likes:req?.user?._id}}
        }
        const post = await this._postModel.findOneAndUpdate({_id:postId},updateQuery,{new:true})
        if(!post){
            throw new AppError("failed to like post",404);
        }
        return res.status(200).json({message:"welcom",post})
    }
}
export default new UserService()
