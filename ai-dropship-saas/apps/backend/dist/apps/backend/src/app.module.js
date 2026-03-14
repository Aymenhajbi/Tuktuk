"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const winning_engine_module_1 = require("./modules/winning-engine/winning-engine.module");
const competitor_intelligence_module_1 = require("./modules/competitor-intelligence/competitor-intelligence.module");
const tiktok_analyzer_module_1 = require("./modules/tiktok-analyzer/tiktok-analyzer.module");
const ai_core_module_1 = require("./modules/ai-core/ai-core.module");
const auto_pricing_module_1 = require("./modules/auto-pricing/auto-pricing.module");
const prisma_module_1 = require("./prisma/prisma.module");
const realtime_gateway_1 = require("./websocket/realtime.gateway");
const queue_module_1 = require("./queue/queue.module");
const orchestrator_module_1 = require("./modules/orchestrator/orchestrator.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            queue_module_1.QueueModule,
            winning_engine_module_1.WinningEngineModule,
            competitor_intelligence_module_1.CompetitorIntelligenceModule,
            tiktok_analyzer_module_1.TiktokAnalyzerModule,
            ai_core_module_1.AiCoreModule,
            auto_pricing_module_1.AutoPricingModule,
            orchestrator_module_1.OrchestratorModule,
        ],
        providers: [realtime_gateway_1.RealtimeGateway],
    })
], AppModule);
