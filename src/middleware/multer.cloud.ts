import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { AppError } from "../utils/classError";
import os from "node:os"
import {v4 as uuid}from"uuid"

export const fileValidation = {
    image:["image/png","image/jpg","image/jpeg"],
    video:["video/mp4"],
    audio:["audio/mpeg","image/mp3"],
    file:["aplication/pdf","aplication/msword"]
}
export enum storageEnum{
    disk="disk",
    cloud="cloud"
}
export const multerCloud =({
    fileTypes=fileValidation.image,
    storeType=storageEnum.cloud,
    maxSize=5
}:{
    fileTypes?:string[],
    storeType?:storageEnum,
    maxSize?:number
})=>{
    const storage = storeType===storageEnum.cloud? multer.memoryStorage():multer.diskStorage({
        destination:os.tmpdir(),
        filename(req:Request,file:Express.Multer.File,cb){
            cb(null,`${uuid()}_${file.originalname}`)
        }
    })
    const fileFilter = (req:Request,file:Express.Multer.File,cb:FileFilterCallback)=>{
        if(fileTypes.includes(file.mimetype)){
            cb(null,true)
        }else{
            return cb(new AppError("invalid file type",400))
        }
    }
    const upLoad = multer({storage,limits:{fileSize:1024*1024*maxSize},fileFilter})
    return upLoad
}