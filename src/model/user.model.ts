import mongoose, { Types } from "mongoose";

export enum GenderType {
    male="male",
    female="female"
}
export enum RoleType {
    user="user",
    admin="admin"
}
export enum ProviderType{
    system="system",
    google="google"
}
export interface IUser{
    _id:Types.ObjectId,
    fName:string,
    lName:string,
    userName?:string,
    email:string,
    password:string,
    age:number,
    image?:string,
    provider:ProviderType,
    phone?:string,
    address?:string,
    gender:GenderType,
    profileImage?:string,
    tempProfileImage?:string,
    role?:RoleType,
    otp?:string,
    deletedAt?:Date,
    deletedBy?:Types.ObjectId,
    restoredAt?:Date,
    restoredBy?:Types.ObjectId,
    confirmed?:boolean,
    isTwoFAEnabled?:boolean,
    changCredentials?:Date,
    loginOtp?:string,
    loginOtpExpiry?:Date,
    createdAt:Date,
    updatedAt:Date
}

const userSchema =new mongoose.Schema<IUser>({
    fName:{type:String,required:true,minLength:3,maxLength:10,trim:true},
    lName:{type:String,minLength:3,required:true,maxLength:10,trim:true},
    email:{type:String,required:true,unique:true,trim:true},
    password:{type:String,trim:true,required:function(){
        return this.provider===ProviderType.google?false:true
    }},
    age:{type:Number,min:18,required:function(){
        return this.provider===ProviderType.google?false:true
    }},
    phone:{type:String},
    isTwoFAEnabled: { type: Boolean, default: false },
    loginOtp: { type: String },                       
    loginOtpExpiry: { type: Date },
    deletedAt:{type:Date},
    deletedBy:{type:Types.ObjectId,ref:"User"},
    restoredAt:{type:Date},
    restoredBy:{type:Types.ObjectId,ref:"User"},
    profileImage:{type:String},
    tempProfileImage:{type:String},
    address:{type:String},
    otp:{type:String},
    image:{type:String},
    provider:{type:String,enum:ProviderType,default:ProviderType.system},
    confirmed:{type:Boolean},
    changCredentials:{type:Date},
    gender:{type:String,enum:GenderType,required:function(){
        return this.provider===ProviderType.google?false:true
    }},
    role:{type:String,enum:RoleType,default:RoleType.user},
},{
    timestamps:true,
    toObject:{virtuals:true},
    toJSON:{virtuals:true}
})

userSchema.virtual("userName").set(function(value){
    const[fName,lName]=value.split(" ")
    this.set({fName,lName})
}).get(function(){
    return this.fName + " " +this.lName
})

const userModdel =mongoose.models.User||mongoose.model<IUser>("User",userSchema)
export default userModdel