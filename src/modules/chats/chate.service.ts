import { NextFunction, Request, Response } from "express"
import { AppError } from "../../utils/classError"
import { ChatRepository } from "../../DB/repositories/chat.repository"
import chatModel from "../../model/chat.model"
import { Server, Socket } from "socket.io"
import { UserRepository } from "../../DB/repositories/user.repository"
import userModdel from "../../model/user.model"
import { connectionSocket } from "../geteway/geteway"
import { Types } from "mongoose"
import { deleteFile, uploadFile } from "../../utils/s3.config"
import { v4 as uuidv4 } from "uuid";

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

    getChatGroup = async (req:Request,res:Response,next:NextFunction)=>{
        const{groupId}=req.params
        const Chat = await this._chatModel.findOne({
            _id:groupId,
            participants:{
                $in:[req?.user?._id]
            },
            group:{$exists:true}
        },undefined,{
            populate:[{
                path:"messages.createdBy"
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

    join_room = async(data:any,socket:Socket,io:Server)=>{
        const {roomId} = data
        const chat = await this._chatModel.findOne({
            roomId,
            participants:{
                $in:[socket.data.user._id]
            },
            group:{$exists:true}
        })
        if(!chat){
            throw new AppError("chat not found",404);
        }
        socket.join(chat?.roomId!)
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
    sendGroupMessage = async(data:any,socket:Socket,io:Server)=>{
        const {groupId,content}=data
        const createdBy = socket?.data?.user?._id

        const Chat = await this._chatModel.findOneAndUpdate({
            _id:groupId,
            participants:{
                $all:[createdBy]
            },
            group:{$exists:true}
        },{
            $push:{
                messages:{
                    content,
                    createdBy
                }
            }
        })
            if(!Chat){
                throw new AppError("chat not found",404);
            }
        io.to(connectionSocket.get(createdBy.toString())!).emit("successMessage",{content})
        io.to(Chat.roomId!).emit("newMessage",{content,from:socket.data.user,groupId})
    }

    createGroupChat=async (req:Request,res:Response,next:NextFunction)=>{
        let {group,groupimage,participants}=req.body
        const createdBy = req.user?._id as Types.ObjectId 
        const dbParticipants = participants.map((participants:string)=> Types.ObjectId.createFromHexString(participants))
        const users= await this._userModel.find({
            filter:{
                _id:{
                    $in:participants
                },
                friends:{
                    $in:[createdBy]
                }
            }
        })
        if(users.length!==participants.length){
            throw new AppError("user not found",405);
        }
        const roomId = group.replaceAll(/\s+/g,"_")+"_"+uuidv4()
        if(req?.file){
            groupimage = await uploadFile({
                path:`chat/${roomId}`,
                file:req.file as Express.Multer.File
            })
        }
        dbParticipants.push(createdBy)
        const chat = await this._chatModel.create({
            group,
            groupimage,
            participants:dbParticipants,
            createdBy,
            roomId,
            messages:[]
        })
        if(!chat){
            if(groupimage){
                await deleteFile({Key:groupimage})
            }
            throw new AppError("chat not created",404);
        }
        return res.status(200).json({message:"success",chat})
    }
}