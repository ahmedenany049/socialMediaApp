import { config } from "dotenv"
import path from "path"
import { resolve } from "path"
import express, {  NextFunction, Request, Response } from "express"
import cors from "cors"
import helmet from "helmet"
import {rateLimit} from "express-rate-limit"
import { AppError } from "./utils/classError"
import userRouer from "./modules/users/user.controller"
import connectionDB from "./DB/connectionDB"
import postRouer from "./modules/posts/post.controller"

config({path:resolve("./config/.env")})
const app :express.Application=express()
const port:string|number =process.env.PORT||5000

const limiter = rateLimit({
    windowMs:5*60*1000,
    limit:10,
    message:{
        error:"game over........"
    },
    statusCode:429,
    legacyHeaders:false
})

const bootStrap = async()=>{
    app.use(express.json())
    app.use(cors())
    app.use(helmet())
    app.use(limiter)
    app.use("/users",userRouer)
    app.use("/posts",postRouer)
    await connectionDB()

    app.use("{/*demo}",(req:Request,res:Response,next:NextFunction)=>{
        throw new AppError(`invalid url ${req.originalUrl}`,404)
    })
    app.use((err: AppError,req:Request,res:Response,next:NextFunction)=>{
        return res.status(err.statusCode as unknown as number||500).json({message:err.message,stack:err.stack})
    })

    app.listen(port,()=>{
        console.log(`server is running on port ${port}!`);
    })
}

export default bootStrap
