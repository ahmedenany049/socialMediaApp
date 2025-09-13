import z from "zod"
import { GenderType } from "../../model/user.model"

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

export type signUpSchemaType = z.infer<typeof signUpSchema.body>
export type confirmEmailSchemaType = z.infer<typeof confirmEmailSchema.body>
export type signInSchemaType = z.infer<typeof signInSchema.body>
export type logoutSchemaType = z.infer<typeof logoutSchema.body>
export type loginWithGmailSchemaType= z.infer<typeof loginWithGmailSchema.body>
export type forgetPasswordSchemaType= z.infer<typeof forgetPasswordSchema.body>
export type resetPasswordSchemaType= z.infer<typeof resetPasswordSchema.body>