import {  Model } from "mongoose";
import { DbRepository } from "./DB.repository";
import { IChat } from "../../model/chat.model";

export class ChatRepository extends DbRepository<IChat>{
    constructor(protected readonly model:Model<IChat>){
        super(model)
    }
}