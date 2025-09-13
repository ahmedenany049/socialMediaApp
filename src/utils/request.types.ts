import { JwtPayload } from "jsonwebtoken";
import { IUser } from "../model/user.model";
import { HydratedDocument } from "mongoose";

declare module "express-serve-static-core"{
    export interface  Request{
        user?:HydratedDocument<IUser>,
        decoded?:JwtPayload
    }
}