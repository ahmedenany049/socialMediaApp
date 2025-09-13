import { Model } from "mongoose";
import { DbRepository } from "./DB.repository";
import { IRevokeToken } from "../../model/revok.Token";

export class RevokTokenRepository extends DbRepository<IRevokeToken>{
    constructor(protected readonly model:Model<IRevokeToken>){
        super(model)
    }
}