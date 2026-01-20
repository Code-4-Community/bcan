import { Controller, Get, Param, Put, Body, Patch, Post, Delete, ValidationPipe, Logger, UseGuards } from '@nestjs/common';
import { GrantService } from './grant.service';
import { Grant } from '../../../middle-layer/types/Grant';
import { VerifyUserGuard } from '../guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('grant')
export class GrantController {
    constructor(private readonly grantService: GrantService) { }

    @Get()
    @UseGuards(VerifyUserGuard)
    @ApiBearerAuth()
    async getAllGrants() {
        return await this.grantService.getAllGrants();
    }

   

    @Put('inactivate')
    @UseGuards(VerifyUserGuard)
    async inactivate(
        @Body('grantIds') grantIds: number[]
    ): Promise<Grant[]> {
        let grants: Grant[] = [];
        for(const id of grantIds){
            Logger.log(`Inactivating grant with ID: ${id}`);
            let newGrant = await this.grantService.makeGrantsInactive(id)
            grants.push(newGrant);
        }
        return grants;
    }

    @Post('new-grant')
    @UseGuards(VerifyUserGuard)
    async addGrant(
      @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
      grant: Grant
    ) {
      return await this.grantService.addGrant(grant);
    }

    @Put('save')
    @UseGuards(VerifyUserGuard)
    async saveGrant(@Body() grantData: Grant) {
        return await this.grantService.updateGrant(grantData)
    }

    @Delete(':grantId')
    @UseGuards(VerifyUserGuard)
    async deleteGrant(@Param('grantId') grantId: number) {
        return await this.grantService.deleteGrantById(grantId);
    }
    @Get(':id')
    @UseGuards(VerifyUserGuard)
    async getGrantById(@Param('id') GrantId: string) {
        return await this.grantService.getGrantById(parseInt(GrantId, 10));
    }
}