"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const DB_repository_1 = require("./DB.repository");
const classError_1 = require("../../utils/classError");
class UserRepository extends DB_repository_1.DbRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
    async creatOneUser(data) {
        const user = await this.create(data);
        if (!user) {
            throw new classError_1.AppError("fail to creat", 405);
        }
        return user;
    }
}
exports.UserRepository = UserRepository;
