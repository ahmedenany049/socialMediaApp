import { NextFunction, Request, Response } from "express";
import { RoleType } from "../model/user.model";
import { AppError } from "../utils/classError";

export const Authorizatin= ({accessRoles=[]}:{accessRoles:RoleType[]})=>{
    return(req:Request,res:Response,next:NextFunction)=>{
        if(!accessRoles.includes(req.user?.role!)){
            throw new AppError("unAuthorized");
            
        }
        next()
    }
}