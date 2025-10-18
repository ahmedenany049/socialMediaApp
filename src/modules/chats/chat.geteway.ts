import { Server, Socket } from "socket.io";
import { ChatEvent } from "./chat.event";

export class chatGeteway {
    private chatEvent :ChatEvent =new ChatEvent()
    constructor(){}

    regester = (socket:Socket,io:Server)=>{
        this.chatEvent.sayHi(socket,io)
        this.chatEvent.sendMessage(socket,io)
        this.chatEvent.join_room(socket,io)
        this.chatEvent.sendGroupMessage(socket,io)
    }
}