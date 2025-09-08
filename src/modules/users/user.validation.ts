import z from "zod"
import { GenderType } from "../../model/user.model"


export const signInSchema = {
    body:z.strictObject({
        email:z.string().email(),
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
        otp:z.string().regex(/^\d{6$}/).trim(),

    }).required()
}

export type signUpSchemaType = z.infer<typeof signUpSchema.body>
export type confirmEmailSchemaType = z.infer<typeof confirmEmailSchema.body>
export type signInSchemaType = z.infer<typeof signInSchema.body>