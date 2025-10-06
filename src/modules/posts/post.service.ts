import { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/classError";
import userModdel from "../../model/user.model";
import { UserRepository } from "../../DB/repositories/user.repository";
import { postRepository } from "../../DB/repositories/post.repository copy";
import PostModdel, { AvailabilityEnum, IPost } from "../../model/post.model";
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
        if(req?.body?.tags?.length && (await this._userModel.find({filter:{_id:{$in:req?.body?.tags}}})).length!==req?.body?.tags?.length){
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
            updateQuery = {$pull:{likes:req?.user?._id}}
        }
        const post = await this._postModel.findOneAndUpdate(
            {_id:postId,
                $or:[
                    {availability:AvailabilityEnum.public},
                    {availability:AvailabilityEnum.private,createdBy:req.user?._id},
                    {availability:AvailabilityEnum.friends,createdBy:{$in:{...req.user?.friends||req.user?._id}}}
                ]    
            },
            updateQuery,
            {new:true})
        if(!post){
            throw new AppError("failed to like post",404);
        }
        return res.status(200).json({message:"welcom",post})
    }

    //========================================================================
    updatePost= async(req:Request,res:Response,next:NextFunction)=>{
        const {postId}:likePostSchemaType = req.params as likePostSchemaType
        const post = await this._postModel.findOne(
            {_id:postId})
        if(!post){
            throw new AppError("failed to update post or not authrized",404);
        }
        if(req?.body?.content){
            post.content==req.body.content
        }
        if(req?.body?.availability){
            post.availability==req.body.availability
        }
        if(req?.body?.allowcomments){
            post.allowcomments=req.body.allowcomments
        }
        if(req?.files?.length){
            await deleteFiles({urls:post.attachments||[]})
            post.attachments =await uploadFiles({
                files:req?.files as unknown as Express.Multer.File[],
                path:`users/${req?.user?._id}/posts/${post.assetFolderId}`
            })
        }
        if(req?.body?.tags?.length){
            if(req?.body?.tags?.length && (await this._userModel.find({filter:{_id:{$in:req?.body?.tags}}})).length!==req?.body?.tags?.length){
                throw new AppError("invalid your id",400)
            }
            post.tags=req.body.tags
        }
        await post.save()
        return res.status(200).json({message:"welcom",post})
    }

    //==========================================================================
    getPosts= async(req:Request,res:Response,next:NextFunction)=>{
        let {page=1,limit=5}=req.query as unknown as {page:number,limit:number}
        const {curentPage,docs,countDocuments,numberOfPages} = await this._postModel.paginate({filter:{},query:{page,limit}})
        return res.status(200).json({message:"welcom",curentPage,numberOfPages,countDocuments,posts:docs})
    }
}
export default new UserService()
