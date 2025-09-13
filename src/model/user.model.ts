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
    role?:RoleType,
    otp?:string,
    confirmed:boolean,
    changCredentials?:Date,
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
    age:{type:Number,required:true,min:18},
    phone:{type:String},
    address:{type:String},
    otp:{type:String},
    image:{type:String},
    confirmed:{type:Boolean,default:false},
    changCredentials:{type:Date},
    gender:{type:String,enum:GenderType,required:true},
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