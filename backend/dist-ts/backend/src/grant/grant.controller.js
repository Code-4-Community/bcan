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
exports.GrantController = void 0;
const common_1 = require("@nestjs/common");
const grant_service_1 = require("./grant.service");
const create_grant_dto_1 = require("./dto/create-grant.dto");
let GrantController = class GrantController {
    constructor(grantService) {
        this.grantService = grantService;
    }
    async getAllGrants() {
        return await this.grantService.getAllGrants();
    }
    async getGrantById(GrantId) {
        return await this.grantService.getGrantById(parseInt(GrantId, 10));
    }
    async archive(grantIds) {
        return await this.grantService.unarchiveGrants(grantIds);
    }
    async unarchive(grantIds) {
        return await this.grantService.unarchiveGrants(grantIds);
    }
    async addGrant(grant) {
        return await this.grantService.addGrant(grant);
    }
    async saveGrant(grantData) {
        return await this.grantService.updateGrant(grantData);
    }
};
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GrantController.prototype, "getAllGrants", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GrantController.prototype, "getGrantById", null);
__decorate([
    (0, common_1.Put)('archive'),
    __param(0, (0, common_1.Body)('grantIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], GrantController.prototype, "archive", null);
__decorate([
    (0, common_1.Put)('unarchive'),
    __param(0, (0, common_1.Body)('grantIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], GrantController.prototype, "unarchive", null);
__decorate([
    (0, common_1.Post)('new-grant'),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_grant_dto_1.CreateGrantDto]),
    __metadata("design:returntype", Promise)
], GrantController.prototype, "addGrant", null);
__decorate([
    (0, common_1.Put)('save'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GrantController.prototype, "saveGrant", null);
GrantController = __decorate([
    (0, common_1.Controller)('grant'),
    __metadata("design:paramtypes", [grant_service_1.GrantService])
], GrantController);
exports.GrantController = GrantController;
