import * as z from "zod"
import mongoose from "mongoose"

export const generalRules = {
    id:z.string().refine((value)=>{
        return mongoose.Types.ObjectId.isValid(value)
    },{message:"invalid user id"}),
    email:z.email(),
    password:z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    otp:z.string().trim().regex(/^\d{6}$/),
    file:z.object({
        fieldname:z.string(),
        originalname:z.string(),
        encoding:z.string(),
        mimetype:z.string(),
        buffer:z.instanceof(Buffer).optional(),
        path:z.string().optional(),
        size:z.number().optional()
    })
}