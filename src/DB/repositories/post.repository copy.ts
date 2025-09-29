import {  Model } from "mongoose";
import { DbRepository } from "./DB.repository";
import { IPost } from "../../model/post.model";

export class postRepository extends DbRepository<IPost>{
    constructor(protected readonly model:Model<IPost>){
        super(model)
    }
}