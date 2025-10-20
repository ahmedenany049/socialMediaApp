import z from "zod"
import { GenderType } from "../../model/user.model"
import { Types } from "mongoose"
import { generalRules } from "../../utils/generalRules"

export enum flagType{
    all="all",
    currrent="current"
}

export const signInSchema = {
    body:z.strictObject({
        email:z.email(),
        password:z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    }).required()
}

export const signUpSchema = {
    body:signInSchema.body.extend({
        userName:z.string().min(3).trim(),
        cPassword:z.string(),
        phone:z.string(),
        age:z.number(),
        gender:z.enum([GenderType.male,GenderType.female]),
        address:z.string()
    }).required().superRefine((data,ctx)=>{
        if(data.password!==data.cPassword){
            ctx.addIssue({ code: "custom",path:["cPassword"],message:"password not match"})
        }
    })
}

export const confirmEmailSchema = {
    body:z.strictObject({
        email:z.string().email(),
        otp:z.string().trim().regex(/^\d{6}$/),
    }).required()
}

export const logoutSchema = {
    body:z.strictObject({
        flag:z.enum(flagType)

    }).required()
}

export const loginWithGmailSchema ={
    body:z.strictObject({
        idToken:z.string(),

    }).required()
}

export const forgetPasswordSchema ={
    body:z.strictObject({
        email:z.email(),

    }).required()
}

export const resetPasswordSchema ={
    body:confirmEmailSchema.body.extend({
        password:z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
        cPassword:z.string()
    }).required().superRefine((value,ctx)=>{
        if(value.password!==value.cPassword){
            ctx.addIssue({
                code:"custom",
                path:["cPassword"],
                message:"password not match"
            })
        }
    })
}


export const freezeAccountSchema ={
    params:z.strictObject({
        userId:z.string().optional()
    }).required().refine((value)=>{
        return value?.userId?Types.ObjectId.isValid(value.userId):true
    },{
        message:"userId is required",
        path:["userId"]
    })
}

export const upDatePasswordSchema ={
    body:z.strictObject({
        email:z.email(),
        newPassword:z.string()
    }).required()
}

export const getOneUserSchema =z.strictObject({
    id:generalRules.id
})

export const upDateEmailSchema ={
    body:z.strictObject({
        oldEmail:z.email(),
        newEmail:z.email()
    }).required()
}


export type signUpSchemaType = z.infer<typeof signUpSchema.body>
export type confirmEmailSchemaType = z.infer<typeof confirmEmailSchema.body>
export type signInSchemaType = z.infer<typeof signInSchema.body>
export type logoutSchemaType = z.infer<typeof logoutSchema.body>
export type loginWithGmailSchemaType= z.infer<typeof loginWithGmailSchema.body>
export type forgetPasswordSchemaType= z.infer<typeof forgetPasswordSchema.body>
export type resetPasswordSchemaType= z.infer<typeof resetPasswordSchema.body>
export type freezeAccountSchemaType= z.infer<typeof freezeAccountSchema.params>
export type upDatePasswordSchemaType= z.infer<typeof upDatePasswordSchema.body>
export type upDateEmailSchemaType= z.infer<typeof upDateEmailSchema.body>