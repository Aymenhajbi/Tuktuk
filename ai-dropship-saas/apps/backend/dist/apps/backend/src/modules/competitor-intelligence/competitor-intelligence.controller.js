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
exports.CompetitorIntelligenceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const competitor_intelligence_service_1 = require("./competitor-intelligence.service");
let CompetitorIntelligenceController = class CompetitorIntelligenceController {
    constructor(service) {
        this.service = service;
    }
    async scan(storeUrl) {
        const snapshot = await this.service.collectSnapshot(storeUrl);
        const indexed = await this.service.indexToElasticsearch(snapshot);
        return { snapshot, indexed };
    }
};
exports.CompetitorIntelligenceController = CompetitorIntelligenceController;
__decorate([
    (0, common_1.Get)('scan'),
    __param(0, (0, common_1.Query)('storeUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompetitorIntelligenceController.prototype, "scan", null);
exports.CompetitorIntelligenceController = CompetitorIntelligenceController = __decorate([
    (0, swagger_1.ApiTags)('competitor-intelligence'),
    (0, common_1.Controller)('modules/competitor-intelligence'),
    __metadata("design:paramtypes", [competitor_intelligence_service_1.CompetitorIntelligenceService])
], CompetitorIntelligenceController);
