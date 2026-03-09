"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiCoreController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_core_service_1 = require("./ai-core.service");
let AiCoreController = class AiCoreController {
    constructor(service) {
        this.service = service;
    }
    async generate(body) {
        return this.service.generateMarketingAssets(body.productName);
    }
    predict(body) {
        return this.service.predictTrend(body);
    }
};
exports.AiCoreController = AiCoreController;
__decorate([
    (0, common_1.Post)('generate-assets'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiCoreController.prototype, "generate", null);
__decorate([
    (0, common_1.Post)('predict-trend'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiCoreController.prototype, "predict", null);
exports.AiCoreController = AiCoreController = __decorate([
    (0, swagger_1.ApiTags)('ai-core'),
    (0, common_1.Controller)('modules/ai-core'),
    __metadata("design:paramtypes", [ai_core_service_1.AiCoreService])
], AiCoreController);
