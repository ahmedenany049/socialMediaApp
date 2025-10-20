import { NextFunction, Request, Response } from "express";
import { RoleType } from "../model/user.model";
import { AppError } from "../utils/classError";
import { GraphQLError } from "graphql";

export const Authorizatin= ({accessRoles=[]}:{accessRoles:RoleType[]})=>{
    return(req:Request,res:Response,next:NextFunction)=>{
        if(!accessRoles.includes(req.user?.role!)){
            throw new AppError("unAuthorized");
            
        }
        next()
    }
}
export const AuthorizatinGQL= ({accessRoles=[],role}:{accessRoles:RoleType[],role:RoleType})=>{
        if(!accessRoles.includes(role)){
            throw new GraphQLError("unAuthorized",{extensions:{code:"UNAUTHORIZED",statusCode:404}});            
        }
        return true
    }
