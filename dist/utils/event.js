"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventEmitter = void 0;
const events_1 = require("events");
const sendEmail_1 = require("../service/sendEmail");
const email_temp_1 = require("../service/email.temp");
exports.eventEmitter = new events_1.EventEmitter();
exports.eventEmitter.on("confirmEmail", async (data) => {
    const { email } = data;
    const otp = await (0, sendEmail_1.GeneratOTP)();
    await (0, sendEmail_1.sendEmail)({ to: email, subject: "confirmEmail", html: (0, email_temp_1.emailTemplate)(otp, "Email Confirmation") });
});
