import { HydratedDocument, Model, ProjectionType, RootFilterQuery, UpdateQuery, UpdateWriteOpResult } from "mongoose";
import { AppError } from "../../utils/classError";


export abstract class DbRepository<Tdocument>{
    constructor(protected readonly model:Model<Tdocument>){}
    async create(data:Partial<Tdocument>):Promise<HydratedDocument<Tdocument>>{
        return this.model.create(data)
    }
    async findOne(filter:RootFilterQuery<Tdocument>,select?:ProjectionType<Tdocument>):Promise<HydratedDocument<Tdocument>|null>{
        return this.model.findOne(filter)
    }
    async updateOne(filter:RootFilterQuery<Tdocument>,update:UpdateQuery<Tdocument>):Promise<UpdateWriteOpResult>{
        return await this.model.updateOne(filter,update)
    }
}