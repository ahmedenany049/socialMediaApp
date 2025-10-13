import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/classError";
import { decodedTokenAndFeTchUser, GetSignature, TokenType } from "../utils/token";



export const Authentication = (tokenType:TokenType=TokenType.access)=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        const{authorization}=req.headers
        if (!authorization) {
            throw new AppError("Authorization header is missing", 400);
        }
        const[prefix,token]=authorization.split(" ")||[]
        if(!prefix||!token){
            throw new AppError("token not exist",400)
        }
        const signature = await GetSignature(prefix,tokenType)
        if(!signature){
            throw new AppError("invalid signature",400);
        }
        const {user,decoded} =await decodedTokenAndFeTchUser(token,signature)
        if(!decoded){
            throw new AppError("invalid token",400);
        }
        req.user=user;
        req.decoded=decoded;
        return next()
    }
}
