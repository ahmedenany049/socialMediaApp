import { HydratedDocument } from "mongoose"
import { Socket } from "socket.io"
import { IUser } from "../../model/user.model"
import { JwtPayload } from "jsonwebtoken"

export interface socketWithUser extends Socket {
    user?:Partial<HydratedDocument<IUser>>
    decoded?:JwtPayload
}
