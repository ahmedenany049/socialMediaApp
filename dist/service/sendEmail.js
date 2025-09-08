"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratOTP = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (mailOptions) => {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        },
    });
    const info = await transporter.sendMail({
        from: `"socialMediaApp" <${process.env.EMAIL}>`,
        ...mailOptions
    });
    console.log("Message sent:", info.messageId);
};
exports.sendEmail = sendEmail;
const GeneratOTP = () => {
    return Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
};
exports.GeneratOTP = GeneratOTP;
