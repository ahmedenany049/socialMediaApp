import { DeleteResult, HydratedDocument, Model, ProjectionType, QueryOptions, RootFilterQuery, UpdateQuery, UpdateWriteOpResult } from "mongoose";


export abstract class DbRepository<Tdocument>{
    constructor(protected readonly model:Model<Tdocument>){}
    async create(data:Partial<Tdocument>):Promise<HydratedDocument<Tdocument>>{
        return this.model.create(data)
    }
    async findOne(filter:RootFilterQuery<Tdocument>,select?:ProjectionType<Tdocument>):Promise<HydratedDocument<Tdocument>|null>{
        return this.model.findOne(filter)
    }
    async find(filter:RootFilterQuery<Tdocument>,select?:ProjectionType<Tdocument>,options?:QueryOptions<Tdocument>):Promise<HydratedDocument<Tdocument>[]>{
        return this.model.find(filter,select,options)
    }
    async updateOne(filter:RootFilterQuery<Tdocument>,update:UpdateQuery<Tdocument>):Promise<UpdateWriteOpResult>{
        return await this.model.updateOne(filter,update)
    }
    async findOneAndUpdate(filter:RootFilterQuery<Tdocument>,update:UpdateQuery<Tdocument>,options:QueryOptions<Tdocument>|null ={new:true}):Promise<HydratedDocument<Tdocument>|null>{
        return await this.model.findOneAndUpdate(filter,update,options)
    }
    async deleteOne(filter:RootFilterQuery<Tdocument>):Promise<DeleteResult>{
        return await this.model.deleteOne(filter)
    }
}