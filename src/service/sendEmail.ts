import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export const sendEmail =async (mailOptions:Mail.Options)=>{

    const transporter = nodemailer.createTransport({
        service:"gmail",
        port: 465,
        secure: true, 
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD},
    });

    
        const info = await transporter.sendMail({
        from: `"socialMediaApp" <${ process.env.EMAIL}>`,
        ...mailOptions
    });
        
    console.log("Message sent:", info.messageId);
}

export const GeneratOTP=()=>{
    return Math.floor(Math.random()*(999999-100000+1)+100000)
}