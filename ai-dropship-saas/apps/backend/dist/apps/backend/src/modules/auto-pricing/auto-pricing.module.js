"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoPricingModule = void 0;
const common_1 = require("@nestjs/common");
const auto_pricing_controller_1 = require("./auto-pricing.controller");
const auto_pricing_service_1 = require("./auto-pricing.service");
const pricing_repository_1 = require("./pricing.repository");
let AutoPricingModule = class AutoPricingModule {
};
exports.AutoPricingModule = AutoPricingModule;
exports.AutoPricingModule = AutoPricingModule = __decorate([
    (0, common_1.Module)({
        controllers: [auto_pricing_controller_1.AutoPricingController],
        providers: [auto_pricing_service_1.AutoPricingService, pricing_repository_1.PricingRepository],
        exports: [auto_pricing_service_1.AutoPricingService],
    })
], AutoPricingModule);
