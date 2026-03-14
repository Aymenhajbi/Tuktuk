"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorModule = void 0;
const common_1 = require("@nestjs/common");
const ai_core_module_1 = require("../ai-core/ai-core.module");
const auto_pricing_module_1 = require("../auto-pricing/auto-pricing.module");
const winning_engine_module_1 = require("../winning-engine/winning-engine.module");
const orchestrator_controller_1 = require("./orchestrator.controller");
const orchestrator_service_1 = require("./orchestrator.service");
const orchestrator_repository_1 = require("./orchestrator.repository");
let OrchestratorModule = class OrchestratorModule {
};
exports.OrchestratorModule = OrchestratorModule;
exports.OrchestratorModule = OrchestratorModule = __decorate([
    (0, common_1.Module)({
        imports: [winning_engine_module_1.WinningEngineModule, ai_core_module_1.AiCoreModule, auto_pricing_module_1.AutoPricingModule],
        controllers: [orchestrator_controller_1.OrchestratorController],
        providers: [orchestrator_service_1.OrchestratorService, orchestrator_repository_1.OrchestratorRepository],
    })
], OrchestratorModule);
