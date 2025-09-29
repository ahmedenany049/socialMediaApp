"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const classError_1 = require("../utils/classError");
const validation = (schema) => {
    return (req, res, next) => {
        const validationError = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            if (req.file) {
                req.body.attachments == req.file;
            }
            if (req?.files) {
                req.body.attachments == req.files;
            }
            const result = schema[key].safeParse(req[key]);
            if (!result.success) {
                validationError.push(result.error);
            }
        }
        if (validationError.length) {
            throw new classError_1.AppError(JSON.parse(validationError), 400);
        }
        next();
    };
};
exports.validation = validation;
