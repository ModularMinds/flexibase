"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("./config/env");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const storage_routes_1 = require("./routes/storage.routes");
const errorHandler_middleware_1 = require("./middlewares/errorHandler.middleware");
const logger_1 = require("./config/logger");
const env_1 = require("./config/env");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_config_1 = require("./config/swagger.config");
const app = (0, express_1.default)();
exports.app = app;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use("/api/storage", storage_routes_1.storageRouter);
// Service check
app.get("/api/storage/service-check", (_, res) => {
    res.json({ isServiceAvailable: true });
});
// Swagger
// Swagger
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_config_1.swaggerSpec));
// Error Handler
app.use(errorHandler_middleware_1.errorHandler);
const port = env_1.env.PORT;
if (require.main === module) {
    app.listen(port, () => {
        logger_1.logger.info(`FlexiBase-Storage service started successfully on port ${port}`);
    });
}
