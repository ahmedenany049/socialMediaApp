"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevokTokenRepository = void 0;
const DB_repository_1 = require("./DB.repository");
class RevokTokenRepository extends DB_repository_1.DbRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.RevokTokenRepository = RevokTokenRepository;
