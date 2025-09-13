import {EventEmitter} from "events"
import { GeneratOTP, sendEmail } from "../service/sendEmail"
import { emailTemplate } from "../service/email.temp"
export const eventEmitter = new EventEmitter()

eventEmitter.on("confirmEmail",async(data)=>{
    const{email,otp}=data
    await sendEmail({to:email,subject:"ConfirmEmail",html:emailTemplate(otp ,"Email Confirmation")})
})
eventEmitter.on("forgetPassword",async(data)=>{
    const{email,otp}=data
    await sendEmail({to:email,subject:"forgetPassword",html:emailTemplate(otp ,"forget password")})
})
