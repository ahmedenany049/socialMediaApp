import { HydratedDocument, Model } from "mongoose";
import { IUser } from "../../model/user.model";
import { DbRepository } from "./DB.repository";
import { AppError } from "../../utils/classError";

export class UserRepository extends DbRepository<IUser>{
    constructor(protected readonly model:Model<IUser>){
        super(model)
    }
    async creatOneUser(data:Partial<IUser>):Promise<HydratedDocument<IUser>>{
        const user:HydratedDocument<IUser> = await this.create(data)
        if(!user){
            throw new AppError("fail to creat",405)
        
        }
        return user
    }
}