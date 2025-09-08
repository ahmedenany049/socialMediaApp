import {EventEmitter} from "events"
import { GeneratOTP, sendEmail } from "../service/sendEmail"
import { emailTemplate } from "../service/email.temp"
export const eventEmitter = new EventEmitter()

eventEmitter.on("confirmEmail",async(data)=>{
    const{email}=data
    const otp =await GeneratOTP()
    await sendEmail({to:email,subject:"confirmEmail",html:emailTemplate(otp as unknown as string,"Email Confirmation")})
})
