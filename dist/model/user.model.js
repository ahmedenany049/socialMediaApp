"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderType = exports.RoleType = exports.GenderType = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
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
var ProviderType;
(function (ProviderType) {
    ProviderType["system"] = "system";
    ProviderType["google"] = "google";
})(ProviderType || (exports.ProviderType = ProviderType = {}));
const userSchema = new mongoose_1.default.Schema({
    fName: { type: String, required: true, minLength: 3, maxLength: 10, trim: true },
    lName: { type: String, minLength: 3, required: true, maxLength: 10, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, trim: true, required: function () {
            return this.provider === ProviderType.google ? false : true;
        } },
    age: { type: Number, required: true, min: 18 },
    phone: { type: String },
    address: { type: String },
    otp: { type: String },
    image: { type: String },
    confirmed: { type: Boolean, default: false },
    changCredentials: { type: Date },
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
