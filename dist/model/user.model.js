"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleType = exports.GenderType = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
var GenderType;
(function (GenderType) {
    GenderType["male"] = "male";
    GenderType["female"] = "female";
})(GenderType || (exports.GenderType = GenderType = {}));
var RoleType;
(function (RoleType) {
    RoleType["user"] = "user";
    RoleType["admin"] = "admin";
})(RoleType || (exports.RoleType = RoleType = {}));
const userSchema = new mongoose_1.default.Schema({
    fName: { type: String, required: true, minLength: 3, maxLength: 10, trim: true },
    lName: { type: String, minLength: 3, required: true, maxLength: 10, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minLength: 6 },
    age: { type: Number, required: true, min: 18 },
    phone: { type: String },
    address: { type: String },
    otp: { type: zod_1.string },
    gender: { type: String, enum: GenderType, required: true },
    role: { type: String, enum: RoleType, default: RoleType.user },
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
userSchema.virtual("userName").set(function (value) {
    const [fName, lName] = value.split(" ");
    this.set({ fName, lName });
}).get(function () {
    return this.fName + " " + this.lName;
});
const userModdel = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
exports.default = userModdel;
