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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoPricingService = void 0;
const common_1 = require("@nestjs/common");
const pricing_repository_1 = require("./pricing.repository");
let AutoPricingService = class AutoPricingService {
    constructor(repository) {
        this.repository = repository;
    }
    async optimize(input) {
        const floorPrice = input.cost / (1 - input.targetMarginPct / 100);
        const recommendedPrice = Number(Math.max(floorPrice, input.marketAverage * 0.98).toFixed(2));
        const grossMargin = Number((recommendedPrice - input.cost).toFixed(2));
        const simulatedRoas = Number((recommendedPrice / Math.max(input.estimatedCpa, 1)).toFixed(2));
        await this.repository.createCampaignSimulation({
            data: {
                productRef: 'auto-pricing',
                expectedCpa: input.estimatedCpa,
                expectedRoas: simulatedRoas,
                expectedMargin: grossMargin,
                budget: 100,
            },
        });
        return {
            recommendedPrice,
            grossMargin,
            simulatedRoas,
            alert: simulatedRoas < 1.5 ? 'UNDERPERFORMING_RISK' : null,
        };
    }
};
exports.AutoPricingService = AutoPricingService;
exports.AutoPricingService = AutoPricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pricing_repository_1.PricingRepository])
], AutoPricingService);
