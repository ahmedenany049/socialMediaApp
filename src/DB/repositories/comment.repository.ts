import {  Model } from "mongoose";
import { DbRepository } from "./DB.repository";
import { IComment } from "../../model/comment.model";
export class commentRepository extends DbRepository<IComment>{
    constructor(protected readonly model:Model<IComment>){
        super(model)
    }
}