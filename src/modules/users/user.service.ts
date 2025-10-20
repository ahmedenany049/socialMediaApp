import { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/classError";
import { confirmEmailSchemaType, flagType, forgetPasswordSchemaType, freezeAccountSchemaType, getOneUserSchema, loginWithGmailSchemaType,logoutSchemaType, resetPasswordSchemaType, signInSchemaType, signUpSchemaType, upDateEmailSchemaType, upDatePasswordSchemaType } from "./user.validation";
import userModdel, { ProviderType, RoleType } from "../../model/user.model";
import { UserRepository } from "../../DB/repositories/user.repository";
import { Compare, Hash } from "../../utils/hash";
import { eventEmitter } from "../../utils/event";
import { GeneratOTP } from "../../service/sendEmail";
import { GenerateToken } from "../../utils/token";
import { v4 as uuidv4 } from "uuid";
import { RevokTokenRepository } from "../../DB/repositories/revok.repository";
import RevokTokenModdel from "../../model/revok.Token";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { createGetFileSignedUrl, createUpliadFilePreSignUrl, deleteFile, deleteFiles, getFile, listFiles } from "../../utils/s3.config";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import {  ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";
import { postRepository } from "../../DB/repositories/post.repository copy";
import PostModdel from "../../model/post.model";
import FriendRequestModdel from "../../model/sendRequest.model";
import { FriendRequestRepository } from "../../DB/repositories/friendRequest.repository";
import { Types } from "mongoose";
import { ChatRepository } from "../../DB/repositories/chat.repository";
import chatModel from "../../model/chat.model";
import { GraphQLError } from "graphql";
import { AuthenticationGQL } from "../../middleware/authentication";
import { AuthorizatinGQL } from "../../middleware/authorization";
import { validationGQL } from "../../middleware/validation";
const writePipeLine =promisify(pipeline)

class UserService {
    private _userModel =new UserRepository(userModdel)
    private _revokToken =new RevokTokenRepository(RevokTokenModdel)
    private _postModel =new postRepository(PostModdel)
    private _friendRequestModel =new FriendRequestRepository(FriendRequestModdel)
    private _chatModel = new ChatRepository(chatModel)
    
    
    constructor(){}

    //========================================================================
    signUp = async(req:Request,res:Response,next:NextFunction)=>{

        let{userName,email,password,cPassword,gender,address,age,phone}:signUpSchemaType=req.body
        if(await this._userModel.findOne({email})){
            throw new AppError("email already exist",405)
        }

        const hash = await Hash(password)
        const otp = await GeneratOTP()
        const hashedOTP =await Hash(String(otp))

        const user=await this._userModel.creatOneUser({userName,email,otp:hashedOTP,password:hash,gender,address,age,phone})

        eventEmitter.emit("confirmEmail",{email,otp})

        return res.status(200).json({message:"welcom",user})
    }

    //==========================================================================
    confirmEmail = async(req:Request,res:Response,next:NextFunction)=>{
        const{email,otp}:confirmEmailSchemaType=req.body
        const user =await this._userModel.findOne({email,confirmed:{$exists:false}})
        if(!user){
            throw new AppError("email not exist or already confirmed",405)
        }
        if(!await Compare(otp,user?.otp!)){
            throw new AppError("invalid Otp",405)
        }
        await this._userModel.updateOne({email:user?.email},{confirmed:true,$unset:{otp:""}})
        return res.status(200).json({message:"confirmed.."})
    }

    //===========================================================================
    signIn=async(req:Request,res:Response,next:NextFunction)=>{
        const{email,password}:signInSchemaType=req.body
        const user =await this._userModel.findOne({email,confirmed:{$exists:true},provider:ProviderType.system})
        if(!user){
            throw new AppError("user not found or confirmed yet",405)
        }
        if(!await Compare(password,user?.password!)){
            throw new AppError("invalid password",405)
        }
        if (user.isTwoFAEnabled) {
        const otp = Math.floor(100000 + Math.random() * 900000);
        const hashedOTP = await Hash(String(otp));
        user.loginOtp = hashedOTP;
        user.loginOtpExpiry = new Date(Date.now() + 5 * 60 * 1000); 
        await user.save();
        eventEmitter.emit("sendEmail", { email: user.email, otp });
        return res.status(200).json({ message: "OTP sent to your email, please confirm login" });}
        //////////////////////////////////////////////////
        const jwtid = uuidv4()
        const access_token =await GenerateToken({
            payload:{id:user._id,email:user.email},
            signature:user?.role==RoleType.user?process.env.ACCESS_TOKEN_USER!:process.env.ACCESS_TOKEN_ADMIN!,
            options:{expiresIn:60*60,jwtid}})
        
        const refresh_token=await GenerateToken({
            payload:{id:user._id,email:user.email},
            signature:user?.role==RoleType.user?process.env.REFRESH_TOKEN_USER!:process.env.REFRESH_TOKEN_ADMIN!,
            options:{expiresIn:"1y",jwtid}})
        return res.status(200).json({message:"welcome",access_token,refresh_token})
    }

    //===========================================================================
    getProfile=async(req:Request,res:Response,next:NextFunction)=>{
        const user = await this._userModel.findOne({_id:req?.user?._id},undefined,{
            populate:[{
                path:"friends"
            }]
        })
        const groups = await this._chatModel.find({
            filter:{
                participants:{$in:[req?.user?._id]},
                group:{$exists:true}
            }
        })
        return res.status(200).json({message:"success",user:req.user})
    }

    //=======================================================
    logout=async(req:Request,res:Response,next:NextFunction)=>{
        const {flag}:logoutSchemaType=req.body
        if(flag===flagType.all){
            await this._userModel.updateOne({_id:req.user?._id},{changCredentials:new Date()})
            return res.status(200).json({message:"success ,log out from all devices"})
        }
        await this._revokToken.create({
            tokenId:req.decoded?.jti!,
            userId:req.user?._id!,
            expireAt:new Date(req.decoded?.exp!*1000)
        })
        return res.status(200).json({message:"success log out from this device"})
    }

    //=======================================================================
    refreshToken=async(req:Request,res:Response,next:NextFunction)=>{
        const jwtid = uuidv4()
        const access_token =await GenerateToken({
            payload:{id:req?.user?._id,email:req?.user?.email},
            signature:req?.user?.role==RoleType.user?process.env.ACCESS_TOKEN_USER!:process.env.ACCESS_TOKEN_ADMIN!,
            options:{expiresIn:60*60,jwtid}})
        
        const refresh_token=await GenerateToken({
            payload:{id:req?.user?._id,email:req?.user?.email},
            signature:req?.user?.role==RoleType.user?process.env.REFRESH_TOKEN_USER!:process.env.REFRESH_TOKEN_ADMIN!,
            options:{expiresIn:"1y",jwtid}})
            await this._revokToken.create({
                tokenId:req.decoded?.jti!,
                userId:req.user?._id!,
                expireAt:new Date(req.decoded?.exp!*1000)
        })
        return res.status(200).json({message:"welcome",access_token,refresh_token})
    }

    //======================================================================
    loginWithGmail=async(req:Request,res:Response,next:NextFunction)=>{
        const { idToken}:loginWithGmailSchemaType=req.body
        const client = new OAuth2Client();
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.WEB_CLIENT_ID!,
            });
            const payload = ticket.getPayload();
            return payload
        }
        const {email,email_verified,picture,name}= await verify() as TokenPayload
        // //check email
        let user =await this._userModel.findOne({email})
        if(!user){
            user = await this._userModel.create({
                email:email!,
                image:picture!,
                userName:name!,
                confirmed:email_verified!,
                provider:ProviderType.google
            })
        }

        if(user?.provider===ProviderType.system){
            throw new AppError("please login on system");
            
        }

        const jwtid = uuidv4()
        const access_token =await GenerateToken({
            payload:{id:user._id,email:user.email},
            signature:user?.role==RoleType.user?process.env.ACCESS_TOKEN_USER!:process.env.ACCESS_TOKEN_ADMIN!,
            options:{expiresIn:60*60,jwtid}})
        
        const refresh_token=await GenerateToken({
            payload:{id:user._id,email:user.email},
            signature:user?.role==RoleType.user?process.env.REFRESH_TOKEN_USER!:process.env.REFRESH_TOKEN_ADMIN!,
            options:{expiresIn:"1y",jwtid}})
        return res.status(200).json({message:"welcome",access_token,refresh_token})
    }

    //=====================================================================
    forgetPassword=async(req:Request,res:Response,next:NextFunction)=>{
        const {email}:forgetPasswordSchemaType=req.body
        const user =await this._userModel.findOne({email,confirmed:{$exists:true}})
        if(!user){
            throw new AppError("email not exist or already confirmed",405)
        }
        const otp =await GeneratOTP()
        const hashedOTP =await Hash(String(otp))    
        eventEmitter.emit("forgetPassword",{email,otp})
        await this._userModel.updateOne({email:user?.email},{otp:hashedOTP})
        return res.status(200).json({message:"success send otp"})
    }

    //======================================================================
    resetPassword=async(req:Request,res:Response,next:NextFunction)=>{
        const {email,otp,password,cPassword}:resetPasswordSchemaType=req.body
        const user =await this._userModel.findOne({email,otp:{$exists:true}})
        if(!user){
            throw new AppError("email not found",405)
        }
        if(!await Compare(otp,user?.otp!)){
            throw new AppError("invalid otp");
        }
        const hash =await Hash(password)
        await this._userModel.updateOne({email:user?.email},{password:hash,$unset:{otp:""}})
        return res.status(200).json({message:"success"})
    }

    //====================================================================
    uploadImage=async(req:Request,res:Response,next:NextFunction)=>{
        // const Key = await uploadFiles({
        //     files:req.files as Express.Multer.File[],
        //     path:`users/${req.user?._id}`,
        //     storeType:storageEnum.cloud
        // })
        const{originalname,ContentType}=req.body
        const {url,Key} =await createUpliadFilePreSignUrl({
            originalname,
            ContentType,
            path:`users/${req.user?._id}/coverImage`
        })
        const user = await this._userModel.findOneAndUpdate({
            _id:req.user?._id
        },{
            profileImage:Key,
            tempProfileImage:req.user?.profileImage
        })
        if(!user){
            throw new AppError("user not found",404)
        }
        eventEmitter.emit("UploadProfileImage",{userId:req.user?._id,oldKey:req.user?.profileImage,Key,expiresIn:60})
        return res.status(200).json({message:"success",user,url})
    }

    //=====================================================================
    getfile= async(req:Request,res:Response,next:NextFunction)=>{
        const{path}=req.params as unknown as {path:string[]}
        const{downloadName}=req.query as {downloadName:string}
        const Key= path.join("/")
        const result = await getFile({
            Key
        })
        const stream= result.Body as NodeJS.ReadableStream
        stream.pipe(res)
        res.setHeader("Content-Type",result?.ContentType!)
        if(downloadName){
            res.setHeader("Content-Disposition",`attachment;filename${downloadName ||path.join("/").split("/").pop()}`)
        }
        await writePipeLine(stream,res)
        return res.status(200).json({message:"success",result})
    }

    //===================================================================
    creatFile= async(req:Request,res:Response,next:NextFunction)=>{
        const{path}=req.params as unknown as {path:string[]}
        const Key= path.join("/")
        const{downloadName}=req.query as {downloadName:string}
        const url = await createGetFileSignedUrl({
            Key,
            downloadName:downloadName?downloadName:undefined
        })
        return res.status(200).json({message:"success",url})
    }

    //======================================================================
    deletefile= async(req:Request,res:Response,next:NextFunction)=>{
        const{path}=req.params as unknown as {path:string[]}
        const Key= path.join("/")
        const url = await deleteFile({
            Key,
        })
        return res.status(200).json({message:"success",url})
    }
    
    //====================================================================
    deletefiles= async(req:Request,res:Response,next:NextFunction)=>{
        const{path}=req.params as unknown as {path:string[]}
        const Key= path.join("/")
        const url = await deleteFiles({
            urls:[
                "socialmediaApp/users/68cf0c47191f79cdc7fee5ee/545fd7fd-3cdf-4b03-a145-8c0f45f75918_Screenshot 2025-07-27 221230.png"
            ]
        })
        return res.status(200).json({message:"success",url})
    }

    //=====================================================================
    listfile=async(req:Request,res:Response,next:NextFunction)=>{
        let result = await listFiles({
            path:"users/68cf0c47191f79cdc7fee5ee"
        })
        if(!result?.Contents){
            throw new AppError("not found",404)
        }
        result =result?.Contents?.map((item)=>item.Key) as unknown as ListObjectsV2CommandOutput
        return res.status(200).json({message:"success",result})
    }

    //=====================================================================
    deleteFolder=async(req:Request,res:Response,next:NextFunction)=>{
        let result = await listFiles({
            path:"users/68cf0c47191f79cdc7fee5ee"
        })
        if(!result?.Contents){
            throw new AppError("not found",404)
        }
        result =result?.Contents?.map((item)=>item.Key) as unknown as ListObjectsV2CommandOutput
        await deleteFiles({
            urls:result as unknown as string[],
            Quiet:true
        })
        return res.status(200).json({message:"success",result})
    }

    //=====================================================================
    freezeAccount=async(req:Request,res:Response,next:NextFunction)=>{
        const{userId}:freezeAccountSchemaType=req.params as freezeAccountSchemaType
        if(userId&&req.user?.role!==RoleType.admin){
            throw new AppError("unAuthorized",405)
        }
        const user = await this._userModel.findOneAndUpdate({_id:userId||req.user?._id,deletedAt:{$exists:false}},
            {deletedAt:new Date(),deletedBy:req.user?._id,changCredentials:new Date()})
        if(!user){
            throw new AppError("user not found",405)
        }
        return res.status(200).json({message:"success"})
    }

    //=====================================================================
    unfreezeAccount=async(req:Request,res:Response,next:NextFunction)=>{
        const{userId}:freezeAccountSchemaType=req.params as freezeAccountSchemaType
        if(req.user?.role!==RoleType.admin){
            throw new AppError("unAuthorized",405)
        }
        const user = await this._userModel.findOneAndUpdate({_id:userId,deletedAt:{xists:false},deletedBy:{$ne:userId}},{
            $unset:{deletedAt:"",deletedBy:""},
            restoredAt:new Date(),
            restoredBy:req.user?._id
        })
        if(!user){
            throw new AppError("user not found",405)
        }
        return res.status(200).json({message:"success"})
    }

    //=======================================================================
    updatePassword = async (req: Request, res: Response, next: NextFunction) => {
        const { email, newPassword }: upDatePasswordSchemaType = req.body
        const user = await this._userModel.findOne({ email })
        if (!user) {
            throw new AppError("User not found", 404)
        }
        const hashedPassword = await Hash(newPassword)
        await this._userModel.updateOne({ email},{password: hashedPassword })
            return res.status(200).json({ message: "Password updated successfully" })
    }

    //======================================================================
    updateEmail = async (req: Request, res: Response, next: NextFunction) => {
        const { oldEmail, newEmail }:upDateEmailSchemaType = req.body
        const user = await this._userModel.findOne({ email: oldEmail })
        if (!user) {
            throw new AppError("User not found", 404)
        }
        const isTaken = await this._userModel.findOne({ email: newEmail })
        if (isTaken) {
            throw new AppError("New email is already in use", 409)
        }
        await this._userModel.updateOne(
            { email: oldEmail },
            { email: newEmail, confirmed: false }
        );
        const otp = await GeneratOTP();
        const hashedOTP = await Hash(String(otp))
        await this._userModel.updateOne(
            { email: newEmail },
            { otp: hashedOTP }
        );
        eventEmitter.emit("updateEmail", { email: newEmail, otp })
        return res.status(200).json({ message: "Email updated successfully" })
    }

    //=========================================================================
    dashBoard = async (req: Request, res: Response, next: NextFunction)=>{
        const result = await Promise.all([
            this._userModel.find({filter:{}}),
            this._postModel.find({filter:{}}),
        ])
    }

    //===================================================================
    sendRequest = async (req: Request, res: Response, next: NextFunction)=>{
        const {userId}=req.params
        const user = await this._userModel.findOne({_id:userId})
        if(!user){
            throw new AppError("user not found",404)
        }
        const checkRequest = await this._friendRequestModel.findOne({
            createdBy:{$in:[req.user?._id,userId]},
            sendTo:{$in:[req.user?._id,userId]}
        })
        if(req.user?._id==userId){
            throw new AppError("you can't send requesr to yourself",400)
        }
        if(checkRequest){
            throw new AppError("request already sent",400)
        }
        const friendRequest = await this._friendRequestModel.create({
            createdBy:req.user?._id as unknown as Types.ObjectId,
            sendTo:userId as unknown as Types.ObjectId
        }) 
        return res.status(200).json({ message: "success",friendRequest })
    }

    //========================================================================
    acceptRequest = async (req: Request, res: Response, next: NextFunction)=>{
        const {requestId}=req.params
        const checkRequest = await this._friendRequestModel.findOneAndUpdate({
            _id:requestId,
            sendTo:req.user?._id,
            acceptedAt:{$exists:false}
        },{acceptedAt:new Date()},{new:true})
        if(!checkRequest){
            throw new AppError("request not found",400)
        }
        await Promise.all([
            this._userModel.updateOne({_id:checkRequest.createdBy},{$push:{friends:checkRequest.sendTo}}),
            this._userModel.updateOne({_id:checkRequest.sendTo},{$push:{friends:checkRequest.createdBy}}),
        ])
        return res.status(200).json({ message: "success" })
    }

    //============================================================GraphQL===================================================
    getOneUser =async(parent:any,args:{id:string},context:any)=>{
        const {user}=await AuthenticationGQL(context.req.headers.authorization)
        await validationGQL<typeof args>(getOneUserSchema,args)
        await AuthorizatinGQL({accessRoles:[RoleType.admin,RoleType.superAdmin],role:user.role!})
        const userExist = await this._userModel.findOne({_id:Types.ObjectId.createFromHexString(args.id)})
        if(!userExist){
            throw new GraphQLError("user not found",{extensions:{statusCode:401}});
        }
        return userExist
    }
    //===================================================
    createUser =async (parent:any,args:any)=>{
        const {fName,lName,age,email,password,gender}=args
        const user = await this._userModel.findOne({email})
        if(user){
            throw new GraphQLError("user already exist",{extensions:{statusCode:404}});
        }
        const hashedPassword = await Hash(password)
        const newUser = await this._userModel.create({fName,lName,age,email,password:hashedPassword,gender})
        return newUser
    }
}
export default new UserService()
