"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const prisma_exception_filter_1 = require("./common/filters/prisma-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new prisma_exception_filter_1.PrismaExceptionFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('AI Dropship SaaS API')
        .setDescription('API-first platform for winning product automation')
        .setVersion('1.0.0')
        .build();
    const doc = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, doc);
    await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
