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

   

    @Put('inactivate')
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
    @Get(':id')
    async getGrantById(@Param('id') GrantId: string) {
        return await this.grantService.getGrantById(parseInt(GrantId, 10));
    }
}