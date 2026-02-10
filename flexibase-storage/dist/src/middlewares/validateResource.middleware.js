"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResource = void 0;
const validateResource = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (e) {
        res.status(400).json({
            isSuccess: false,
            message: "Validation failed",
            errors: e.errors,
        });
    }
};
exports.validateResource = validateResource;
