import { HydratedDocument, Model } from "mongoose";
import { IUser } from "../../model/user.model";
import { DbRepository } from "./DB.repository";
import { AppError } from "../../utils/classError";
import { IComment } from "../../model/comment.model";

export class commentRepository extends DbRepository<IComment>{
    constructor(protected readonly model:Model<IComment>){
        super(model)
    }
}