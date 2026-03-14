"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinningEngineModule = void 0;
const common_1 = require("@nestjs/common");
const winning_engine_controller_1 = require("./winning-engine.controller");
const winning_engine_service_1 = require("./winning-engine.service");
const winning_repository_1 = require("./winning.repository");
let WinningEngineModule = class WinningEngineModule {
};
exports.WinningEngineModule = WinningEngineModule;
exports.WinningEngineModule = WinningEngineModule = __decorate([
    (0, common_1.Module)({
        controllers: [winning_engine_controller_1.WinningEngineController],
        providers: [winning_engine_service_1.WinningEngineService, winning_repository_1.WinningRepository],
        exports: [winning_engine_service_1.WinningEngineService],
    })
], WinningEngineModule);
