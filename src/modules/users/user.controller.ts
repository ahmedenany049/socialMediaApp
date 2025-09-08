import { Router } from "express";
import US from "./user.service"
import { validation } from "../../middleware/validation";
import { signInSchema, signUpSchema } from "./user.validation";
const userRouer = Router()
userRouer.post("/signup",validation(signUpSchema),US.signUp)
userRouer.patch("/confirm",US.confirmEmail)
userRouer.post("/signin",validation(signInSchema),US.signIn)

export default userRouer