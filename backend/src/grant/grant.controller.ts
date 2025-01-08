import { Controller, Get, Param, Put, Body } from '@nestjs/common';
import { GrantService } from './grant.service';

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

}