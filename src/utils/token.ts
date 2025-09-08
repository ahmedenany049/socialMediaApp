import jwt, { JwtPayload } from "jsonwebtoken"

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