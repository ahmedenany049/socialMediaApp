import { Server, Socket } from "socket.io";
import { socketWithUser } from "../geteway/geteway.interface";
import { chatService } from "./chate.service";

export class ChatEvent {
    private _chatService :chatService = new chatService()
    constructor(){}

    sayHi = (socket:Socket,io:Server)=>{
        return socket.on("sayHi",(data)=>{
            this._chatService.sayHi(data,socket,io)
        })
    }
    sendMessage = (socket:Socket,io:Server)=>{
            return socket.on("sendMessage",(data)=>{
                this._chatService.sendMessage(data,socket,io)
        })
    }
}