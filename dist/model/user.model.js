"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderType = exports.RoleType = exports.GenderType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var GenderType;
(function (GenderType) {
    GenderType["male"] = "male";
    GenderType["female"] = "female";
})(GenderType || (exports.GenderType = GenderType = {}));
var RoleType;
(function (RoleType) {
    RoleType["user"] = "user";
    RoleType["admin"] = "admin";
    RoleType["superAdmin"] = "superAdmin";
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
    age: { type: Number, min: 18, required: function () {
            return this.provider === ProviderType.google ? false : true;
        } },
    friends: [{ type: mongoose_1.Types.ObjectId, ref: "User" }],
    phone: { type: String },
    isTwoFAEnabled: { type: Boolean, default: false },
    loginOtp: { type: String },
    loginOtpExpiry: { type: Date },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose_1.Types.ObjectId, ref: "User" },
    restoredAt: { type: Date },
    restoredBy: { type: mongoose_1.Types.ObjectId, ref: "User" },
    profileImage: { type: String },
    tempProfileImage: { type: String },
    address: { type: String },
    otp: { type: String },
    image: { type: String },
    provider: { type: String, enum: ProviderType, default: ProviderType.system },
    confirmed: { type: Boolean },
    changCredentials: { type: Date },
    gender: { type: String, enum: GenderType, required: function () {
            return this.provider === ProviderType.google ? false : true;
        } },
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
