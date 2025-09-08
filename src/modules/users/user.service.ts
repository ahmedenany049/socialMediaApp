import { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/classError";
import { confirmEmailSchemaType, signUpSchemaType } from "./user.validation";
import userModdel, { RoleType } from "../../model/user.model";
import { UserRepository } from "../../DB/repositories/user.repository";
import { Compare, Hash } from "../../utils/hash";
import { eventEmitter } from "../../utils/event";
import { GeneratOTP } from "../../service/sendEmail";
import { GenerateToken } from "../../utils/token";
class UserService {
    private _userModel =new UserRepository(userModdel)
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
        const{email,password}=req.body
        const user =await this._userModel.findOne({email})
        if(!user){
            throw new AppError("user not found or confirmed yet",405)
        }
        if(!await Compare(password,user?.password!)){
            throw new AppError("invalid password",405)
        }
                const access_token =await GenerateToken({
            payload:{id:user._id,email:user.email},
            signature:user?.role==RoleType.user?process.env.ACCESS_TOKEN_USER!:process.env.ACCESS_TOKEN_ADMIN!,
            options:{expiresIn:60*60,}})
        
        const refresh_token=await GenerateToken({
            payload:{id:user._id,email:user.email},
            signature:user?.role==RoleType.user?process.env.REFRESH_TOKEN_USER!:process.env.REFRESH_TOKEN_ADMIN!,
            options:{expiresIn:"1y",}})
        return res.status(200).json({message:"welcome",access_token,refresh_token})
    }
}
export default new UserService()
