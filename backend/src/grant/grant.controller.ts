import { Controller, Get, Param, Put, Body, Patch, Post, Delete, ValidationPipe, Logger } from '@nestjs/common';
import { GrantService } from './grant.service';
import { Grant } from '../../../middle-layer/types/Grant';

@Controller('grant')
export class GrantController {
    constructor(private readonly grantService: GrantService) { }

    @Get()
    async getAllGrants() {
        return await this.grantService.getAllGrants();
    }

    @Get(':id')
    async getGrantById(@Param('id') GrantId: string) {
        return await this.grantService.getGrantById(parseInt(GrantId, 10));
    }

    @Put('archive')
    async archive(
        @Body('grantIds') grantIds: number[]
    ): Promise<number[]> {
        return await this.grantService.unarchiveGrants(grantIds)
    }

    @Put('unarchive')
    async unarchive(
        @Body('grantIds') grantIds: number[]
    ): Promise<number[]> {
        return await this.grantService.unarchiveGrants(grantIds)
    }

    @Post('new-grant')
    async addGrant(
      @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
      grant: Grant
    ) {
      return await this.grantService.addGrant(grant);
    }

    @Put('save')
    async saveGrant(@Body() grantData: Grant) {
        return await this.grantService.updateGrant(grantData)
    }

    @Delete(':grantId')
    async deleteGrant(@Param('grantId') grantId: string) {
        return await this.grantService.deleteGrantById(grantId);
    }

}