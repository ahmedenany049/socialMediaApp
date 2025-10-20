import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/classError";
import { decodedTokenAndFeTchUser, GetSignature, TokenType } from "../utils/token";
import { GraphQLError } from "graphql";



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
export const AuthenticationGQL = async(authorization:string,tokenType:TokenType=TokenType.access)=>{
        if (!authorization) {
            throw new AppError("Authorization header is missing", 400);
        }
        const[prefix,token]=authorization.split(" ")||[]
        if(!prefix||!token){
            throw new GraphQLError("token not exist",{extensions:{
                code:"TOKEN_NOT_FOUND",
                http:{status:404}
            }})
        }
        const signature = await GetSignature(prefix,tokenType)
        if(!signature){
            throw new GraphQLError("invalid signature",{extensions:{
                code:"INVALID_SIGNATURE",
                http:{status:404}
            }})
        }
        const {user,decoded}=await decodedTokenAndFeTchUser(token,signature)
        if(!decoded){
            throw new GraphQLError("invalid token",{extensions:{
                code:"INVALID_TOKEN",
                http:{status:404}
            }})
        }
        return {user,decoded}
    }

