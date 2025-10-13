
import { Server, Socket } from "socket.io"
import { decodedTokenAndFeTchUser, GetSignature } from "../../utils/token"
import { AppError } from "../../utils/classError"
import { Server as HttpServer} from "http"
import { socketWithUser } from "./geteway.interface"
import { chatGeteway } from "../chats/chat.geteway"
export const connectionSocket = new Map<string,string[]>() 
let io :Server |undefined = undefined

export const initialzationio = (httpServer:HttpServer)=>{
    const io =new Server(httpServer,{
        cors:{
            origin:"*"
        }
    })

    io.use(async(socket:socketWithUser,next)=>{
        try {
            const{authorization}=socket.handshake.auth
            const[prefix,token]=authorization.split(" ")||[]
            if(!prefix||!token){
                return  next(new AppError("token not exist",400))
            }
            const signature = await GetSignature(prefix)
            if(!signature){
                return next(new AppError("invalid signature",400));
            }
            const {user,decoded} =await decodedTokenAndFeTchUser(token,signature)
            const socketIds = connectionSocket.get(user?._id.toString())||[]
            socketIds.push(socket.id)
            connectionSocket.set(user._id.toString(),socketIds)
            console.log(connectionSocket);
            socket.data.user =user
            socket.decoded=decoded
            next()
        } catch (error:any) {
            next(error)
        }
    })

    const chatGateway:chatGeteway = new chatGeteway()
    io.on("connection",(socket:socketWithUser)=>{
        chatGateway.regester(socket,io)
        console.log(connectionSocket.get(socket?.user?._id?.toString()!));

        function removeSocket (){
            let remaningTaps = connectionSocket.get(socket?.user?._id?.toString()||"")
            remaningTaps?.filter((tap)=>{
                return tap !==socket.id
            })
            if(remaningTaps?.length){
                connectionSocket.set(socket?.user?._id?.toString()!,remaningTaps)
            }else{
                connectionSocket.delete(socket?.user?._id?.toString()!)
            }
            io.emit("userdisconnected",{userId:socket?.user?._id?.toString()!})
        }    
        socket.on("disconnect",()=>{
            removeSocket()
        })
    })
}