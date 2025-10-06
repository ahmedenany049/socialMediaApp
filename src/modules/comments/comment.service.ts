import { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/classError";
import userModdel from "../../model/user.model";
import { UserRepository } from "../../DB/repositories/user.repository";
import { postRepository } from "../../DB/repositories/post.repository copy";
import { v4 as uuidv4 } from "uuid";
import PostModdel, { AllowCommentEnum } from "../../model/post.model";
import commentModdel from "../../model/comment.model";
import { commentRepository } from "../../DB/repositories/comment.repository";
import { deleteFiles, uploadFiles } from "../../utils/s3.config";
import { Types } from "mongoose";

class UserService {
    private _userModel =new UserRepository(userModdel)
    private _postModel =new postRepository(PostModdel)
    private _commentModel =new commentRepository(commentModdel)
    constructor(){}

    //========================================================================
    createcomment = async(req:Request,res:Response,next:NextFunction)=>{
        const {postId}= req.params
        let{content,tags,attachments}=req.body
        const post= await this._postModel.findOne({
            _id:postId,
            AllowComment:AllowCommentEnum.allow,
            //$or:AvailabilityPost(req)
        })
        if(!post){
            return next(new AppError("post not found or you ar not authorized",404))
        }
        if(tags?.length&&(await this._userModel.find({filter:{_id:{$in:tags}}})).length!==tags.length){
            return next(new AppError("some tags are not valid",404))
        }
        const assetFolderId =uuidv4()
        if(attachments?.length){
            attachments = await uploadFiles({
            files:req?.files as unknown as Express.Multer.File[],
            path:`users/${req?.user?._id}/posts/${post?.assetFolderId}/comments/${assetFolderId}`
            })
        }
        const comment = await this._commentModel.create({
            content,
            tags,
            attachments,
            assetFolderId,
            postId:postId as unknown as Types.ObjectId,
        })
        if(!comment){
            await deleteFiles({
                urls:attachments||[]
            })
        }
        return res.status(200).json({message:"created",comment})
    }
}
export default new UserService()
