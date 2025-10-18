import { Router } from "express";
import { chatService } from "./chate.service";
import { Authentication } from "../../middleware/authentication";
import { fileValidation, multerCloud, storageEnum } from "../../middleware/multer.cloud";


const CS = new chatService()
const chatRouter = Router({mergeParams:true})

chatRouter.get("/",Authentication(),CS.getChat)
chatRouter.get("/group/:group",Authentication(),CS.getChatGroup)

chatRouter.post("/group",Authentication(),
    multerCloud({fileTypes:fileValidation.image,storeType:storageEnum.cloud}).single("attachment"),
    CS.createGroupChat)

export default chatRouter    