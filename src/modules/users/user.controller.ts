import { Router } from "express";
import US from "./user.service"
import { validation } from "../../middleware/validation";
import * as UV from "./user.validation";
import { Authentication } from "../../middleware/authentication";
import { TokenType } from "../../utils/token";
import { fileValidation, multerCloud } from "../../middleware/multer.cloud";
import { Authorizatin } from "../../middleware/authorization";
import { RoleType } from "../../model/user.model";
const userRouer = Router()
userRouer.post("/signup",validation(UV.signUpSchema),US.signUp)
userRouer.patch("/confirm",US.confirmEmail)
userRouer.post("/signin",validation(UV.signInSchema),US.signIn)
userRouer.get("/profile",Authentication(),US.getProfile)
userRouer.post("/logout",Authentication(),validation(UV.logoutSchema),US.logout)
userRouer.get("/refresh",Authentication(TokenType.refresh),US.refreshToken)
userRouer.get("/loginWithGmail",validation(UV.loginWithGmailSchema),US.loginWithGmail)
userRouer.patch("/forgetPassword",validation(UV.forgetPasswordSchema),US.forgetPassword)
userRouer.patch("/resetPassword",validation(UV.resetPasswordSchema),US.resetPassword)
userRouer.post("/uploadImage",Authentication()
    // ,multerCloud({fileTypes:fileValidation.image} ).array("files")
    ,US.uploadImage)
userRouer.get("/upload/*path",US.getfile)
userRouer.get("/upload/pre-signed/*path",US.creatFile)
userRouer.get("/upload/delete1/*path",US.deletefile)
userRouer.get("/upload/delete2/*path",US.deletefiles)
userRouer.get("/upload/",US.listfile)
userRouer.get("/upload/",US.deleteFolder)
userRouer.delete("/freeze{/:userId}",Authentication(),validation(UV.freezeAccountSchema),US.freezeAccount)
userRouer.patch("/unfreeze/:userId",Authentication(),US.unfreezeAccount)
userRouer.patch("/updatePassword",Authentication(),US.updatePassword)
userRouer.patch("/updateEmail",Authentication(),US.updateEmail)
userRouer.get("/dashboard",Authentication(),Authorizatin({accessRoles:[RoleType.admin,RoleType.superAdmin]}),US.dashBoard)
userRouer.post("/sendRequest/:userId",Authentication(),US.sendRequest)
userRouer.patch("/acceptRequest/:requestId",Authentication(),US.acceptRequest)
export default userRouer