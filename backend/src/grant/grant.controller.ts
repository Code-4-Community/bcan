import { Controller, Get, Param } from '@nestjs/common';
import { GrantService } from './grant.service';

@Controller('grant')
export class GrantController {
    constructor(private readonly grantService: GrantService) { }

    @Get()
    async getAllGrants() {
        return await this.grantService.getAllGrants();
    }

    @Get(':id')
    async getGrantById(@Param('id') grantId: string) {
        return await this.grantService.getGrantById(grantId);
    }

}