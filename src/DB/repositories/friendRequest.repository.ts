import {  Model } from "mongoose";
import { DbRepository } from "./DB.repository";
import { IFriendRequest } from "../../model/sendRequest.model";

export class FriendRequestRepository extends DbRepository<IFriendRequest>{
    constructor(protected readonly model:Model<IFriendRequest>){
        super(model)
    }
}