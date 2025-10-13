import { NextFunction, Request, Response } from "express"
import { AppError } from "../../utils/classError"
import { ChatRepository } from "../../DB/repositories/chat.repository"
import chatModel from "../../model/chat.model"
import { Server, Socket } from "socket.io"
import { UserRepository } from "../../DB/repositories/user.repository"
import userModdel from "../../model/user.model"
import { connectionSocket } from "../geteway/geteway"

export class chatService {
    private _chatModel = new ChatRepository(chatModel)
    private _userModel = new UserRepository(userModdel)
    constructor(){}

    getChat = async (req:Request,res:Response,next:NextFunction)=>{
        const{userId}=req.params
        const Chat = await this._chatModel.findOne({
            participants:{
                $all:[userId,req?.user?._id]
            },
            group:{$exists:false}
        },undefined,{
            populate:[{
                path:"participants"
            }]
        })
        if(!Chat){
            throw new AppError("chat not found",404);
            
        }
        return res.status(200).json({message:"success",Chat})
    }

    sayHi = (data:any,socket:Socket,io:Server)=>{
        console.log(data);
    }

    sendMessage = async(data:any,socket:Socket,io:Server)=>{
        const {chatId,sendTo,content}=data
        const createdBy = socket?.data?.user?._id
        const user = await this._userModel.findOne({
            _id:sendTo,
            friends:{$in:[createdBy]}
        })
        const Chat = await this._chatModel.findOneAndUpdate({
            participants:{
                $all:[createdBy,sendTo]
            },
            group:{$exists:false}
        },{
            $push:{
                messages:{
                    content,
                    createdBy
                }
            }
        })
        if(!Chat){
            const newChat = await this._chatModel.create({
                participants:[createdBy,sendTo],
                createdBy,
                messages:[{
                    content,
                    createdBy
                }]
            })
            if(!newChat){
                throw new AppError("chat not found",404);
            }
        }
        if(!user){
            throw new AppError("user not found",404);
        }
        io.to(connectionSocket.get(createdBy.toString())!).emit("successMessage",{content})
        io.to(connectionSocket.get(sendTo.toString())!).emit("newMessage",{content,from:socket.data.user})
    }
}