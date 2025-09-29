import { Router } from "express";
import PS from "./post.service"
import { validation } from "../../middleware/validation";
import * as PV from "./post.validation";
import { Authentication } from "../../middleware/authentication";
import { fileValidation, multerCloud } from "../../middleware/multer.cloud";
const postRouer = Router()

postRouer.post("/createpost",Authentication(),
multerCloud({fileTypes:fileValidation.image}).array("attachments"),
validation(PV.createPostSchema),PS.createPost)

postRouer.patch("/:postId",Authentication(),validation(PV.likePostSchema),PS.likePost)
export default postRouer