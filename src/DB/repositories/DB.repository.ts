import { DeleteResult, HydratedDocument, Model, ProjectionType, QueryOptions, RootFilterQuery, UpdateQuery, UpdateWriteOpResult } from "mongoose";


export abstract class DbRepository<Tdocument>{
    constructor(protected readonly model:Model<Tdocument>){}
    async create(data:Partial<Tdocument>):Promise<HydratedDocument<Tdocument>>{
        return this.model.create(data)
    }
    async findOne(filter:RootFilterQuery<Tdocument>,select?:ProjectionType<Tdocument>, options?: QueryOptions<Tdocument>):Promise<HydratedDocument<Tdocument>|null>{
        return this.model.findOne(filter,select,options)
    }
    async find({filter,select,options}:{filter:RootFilterQuery<Tdocument>,select?:ProjectionType<Tdocument>,options?:QueryOptions<Tdocument>}):Promise<HydratedDocument<Tdocument>[]>{
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
    async paginate({filter,select,options,query}:{
        filter:RootFilterQuery<Tdocument>,
        query:{page:number,limit:number},
        select?:ProjectionType<Tdocument>,
        options?:QueryOptions<Tdocument>}){
        let {page,limit}=query    
        if(page<0)page =1
        page =page*1 || 1
        const skip = (page-1)*limit
        const finalOptions ={
            ...options,
            skip,
            limit
        }
        const count = await this.model.countDocuments({deletedAt:{$exists:false}})
        const numberOfPages = Math.ceil(count /limit)
        const docs =await this.model.find(filter,select,finalOptions)
        return {docs,curentPage:page,countDocuments:count,numberOfPages}
    }
}