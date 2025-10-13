"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbRepository = void 0;
class DbRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        return this.model.create(data);
    }
    async findOne(filter, select, options) {
        return this.model.findOne(filter, select, options);
    }
    async find({ filter, select, options }) {
        return this.model.find(filter, select, options);
    }
    async updateOne(filter, update) {
        return await this.model.updateOne(filter, update);
    }
    async findOneAndUpdate(filter, update, options = { new: true }) {
        return await this.model.findOneAndUpdate(filter, update, options);
    }
    async deleteOne(filter) {
        return await this.model.deleteOne(filter);
    }
    async paginate({ filter, select, options, query }) {
        let { page, limit } = query;
        if (page < 0)
            page = 1;
        page = page * 1 || 1;
        const skip = (page - 1) * limit;
        const finalOptions = {
            ...options,
            skip,
            limit
        };
        const count = await this.model.countDocuments({ deletedAt: { $exists: false } });
        const numberOfPages = Math.ceil(count / limit);
        const docs = await this.model.find(filter, select, finalOptions);
        return { docs, curentPage: page, countDocuments: count, numberOfPages };
    }
}
exports.DbRepository = DbRepository;
