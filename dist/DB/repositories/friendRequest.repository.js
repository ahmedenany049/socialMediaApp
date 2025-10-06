"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequestRepository = void 0;
const DB_repository_1 = require("./DB.repository");
class FriendRequestRepository extends DB_repository_1.DbRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.FriendRequestRepository = FriendRequestRepository;
