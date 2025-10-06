import { Router } from "express";
import CS from "./comment.service"
import { validation } from "../../middleware/validation";
import * as CV from "./comment.validation";
import { Authentication } from "../../middleware/authentication";
import { fileValidation, multerCloud } from "../../middleware/multer.cloud";
const commentRouer = Router({mergeParams:true})

commentRouer.post("/",Authentication()
    ,multerCloud({fileTypes:fileValidation.image} ).array("attachments"),
    validation(CV.createCommentSchema)
    ,CS.createcomment)

export default commentRouer