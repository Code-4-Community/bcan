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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async setNewPassword(body) {
        try {
            // Check incoming parameters
            console.log('New Password:', body.newPassword);
            console.log('Session:', body.session);
            console.log('Username:', body.username);
            return await this.authService.setNewPassword(body.newPassword, body.session, body.username);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new common_1.HttpException({ status: common_1.HttpStatus.INTERNAL_SERVER_ERROR, error: error.message || 'Failed to set new password' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            throw new common_1.HttpException({ status: common_1.HttpStatus.INTERNAL_SERVER_ERROR, error: 'An unknown error occurred' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async login(body) {
        try {
            // Return the result from AuthService, which could include a challenge
            return await this.authService.login(body.username, body.password);
        }
        catch (error) {
            // Handle errors safely
            if (error instanceof Error) {
                throw new common_1.HttpException({ status: common_1.HttpStatus.INTERNAL_SERVER_ERROR, error: error.message || 'Login failed' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            else {
                throw new common_1.HttpException({ status: common_1.HttpStatus.INTERNAL_SERVER_ERROR, error: 'An unknown error occurred' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
};
__decorate([
    (0, common_1.Post)('set-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setNewPassword", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
exports.AuthController = AuthController;
