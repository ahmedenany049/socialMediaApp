import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { AppError } from "../utils/classError";
import { GraphQLError } from "graphql";

type requestType= keyof Request
type schemaType =Partial<Record<requestType,ZodType>>

export const validation = (schema:schemaType)=>{
    return (req:Request,res:Response,next:NextFunction)=>{
        const validationError = []
        for (const key of Object.keys(schema) as requestType[]) {
            if(!schema[key])continue
            if(req.file){
                req.body.attachments == req.file
            }
            if(req?.files){                
                req.body.attachments==req.files
            }
            const result = schema[key].safeParse(req[key])
            if(!result.success){
                validationError.push(result.error)
            }
        }
        if (validationError.length){
                throw new AppError(JSON.parse(validationError as unknown as string),400);
        }
        next()
    }
}


export const validationGQL =async <T>(schema:ZodType,args:T)=>{
    const validationError = []
    const result = schema.safeParse(args)
    if(!result.success){
        validationError.push(result.error)
    }
    if (validationError.length){
            throw new GraphQLError("validation error",{extensions:{code:"VALIDATION_ERROR",statusCode:404,errors:JSON.parse(validationError as unknown as string)}});            
    }        
}
