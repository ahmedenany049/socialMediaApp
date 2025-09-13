import { Router } from "express";
import US from "./user.service"
import { validation } from "../../middleware/validation";
import * as UV from "./user.validation";
import { Authentication } from "../../middleware/authentication";
import { TokenType } from "../../utils/token";
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

export default userRouer