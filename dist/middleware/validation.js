"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationGQL = exports.validation = void 0;
const classError_1 = require("../utils/classError");
const graphql_1 = require("graphql");
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
const validationGQL = async (schema, args) => {
    const validationError = [];
    const result = schema.safeParse(args);
    if (!result.success) {
        validationError.push(result.error);
    }
    if (validationError.length) {
        throw new graphql_1.GraphQLError("validation error", { extensions: { code: "VALIDATION_ERROR", statusCode: 404, errors: JSON.parse(validationError) } });
    }
};
exports.validationGQL = validationGQL;
