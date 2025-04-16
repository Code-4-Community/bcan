"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const serverless_express_1 = require("@vendia/serverless-express"); // NEW
let cachedHandler;
const handler = async (event, context) => {
    // first invocation: boot Nest and create handler
    if (!cachedHandler) {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        await app.init();
        cachedHandler = (0, serverless_express_1.configure)({
            app: app.getHttpAdapter().getInstance(),
            // optional: logLevel: 'info',
        });
    }
    // Vendia adapter understands both 1.0 and 2.0 events
    return cachedHandler(event, context, () => console.log('healthy'));
};
exports.handler = handler;
