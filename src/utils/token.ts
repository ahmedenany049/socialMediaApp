import jwt, { JwtPayload } from "jsonwebtoken"
import { AppError } from "./classError"
import { UserRepository } from "../DB/repositories/user.repository"
import userModdel from "../model/user.model"
import { RevokTokenRepository } from "../DB/repositories/revok.repository"
import RevokTokenModdel from "../model/revok.Token"

export enum TokenType{
    access="access",
    refresh="refresh"
}
const _userModdel =new UserRepository(userModdel)
const  _revokToken =new RevokTokenRepository(RevokTokenModdel)

export const GenerateToken =async ({payload,signature,options}:{
    payload:Object,
    signature:string,
    options:jwt.SignOptions
}):Promise<string>=>{
    return  jwt.sign(payload,signature,options)
}

export const VerifyToken= async({token,signature}:{
    token:string,
    signature:string

}):Promise<JwtPayload>=>{
    return  jwt.verify(token,signature) as JwtPayload
}

export const decodedTokenAndFeTchUser = async(token:string,signature:string)=>{
    const decoded =await VerifyToken({token,signature})
    if(!decoded){
        throw new AppError("invalid token",400)
    }
    const user = await _userModdel.findOne({email:decoded.email})
    if(!user){
        throw new AppError("user not found",400)
    }
    if(!user?.confirmed){
        throw new AppError("please confirmed email first",400)
    }
    if(await _revokToken.findOne({tokenId:decoded?.jti})){
        throw new AppError("token has been revoked",401);
    }
    if(user?.changCredentials?.getTime()!>decoded.iat!*1000){
        throw new AppError("token has been revoked",401)
    }
    return{decoded,user}
}

export const GetSignature=async(tokenType:TokenType,prefix:string)=>{
    if(tokenType===TokenType.access){
        if(prefix === process.env.BEARER_USER){
            return process.env.ACCESS_TOKEN_USER;
        }else if(prefix===process.env.BEARER_ADMIN){
            return process.env.ACCESS_TOKEN_ADMIN
        }else{
            return null
        }
    }
    if(tokenType===TokenType.refresh){
        if(prefix === process.env.BEARER_USER){
            return process.env.REFRESH_TOKEN_USER
        }else if(prefix === process.env.BEARER_ADMIN){
            return process.env.REFRESH_TOKEN_ADMIN
        }else {
            return null
        }
    }
    return null
}
