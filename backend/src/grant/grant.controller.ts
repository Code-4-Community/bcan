import { Controller, Get, Param, Put, Body, Patch, Post, Delete, ValidationPipe, Logger, UseGuards } from '@nestjs/common';
import { GrantService } from './grant.service';
import { Grant } from '../../../middle-layer/types/Grant';
import { VerifyUserGuard } from '../guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiTags } from '@nestjs/swagger';
import { InactivateGrantBody, AddGrantBody, UpdateGrantBody, GrantResponseDto } from './types/grant.types';

@ApiTags('grant')
@Controller('grant')
export class GrantController {
    private readonly logger = new Logger(GrantController.name);
    
    constructor(private readonly grantService: GrantService) { }

    @Get()
    @UseGuards(VerifyUserGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Retrieve all grants', description: 'Returns a list of all grants in the database. Automatically inactivates expired grants.' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved all grants', type: [GrantResponseDto] })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    @ApiResponse({ status: 403, description: 'Forbidden - User does not have access to this resource' })
    @ApiResponse({ status: 500, description: 'Internal Server Error', example: 'Internal Server Error' })
    async getAllGrants(): Promise<Grant[]> {
        this.logger.log('GET /grant - Retrieving all grants');
        const grants = await this.grantService.getAllGrants();
        this.logger.log(`GET /grant - Successfully retrieved ${grants.length} grants`);
        return grants;
    }

    @Put('inactivate')
    @UseGuards(VerifyUserGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Inactivate grants', description: 'Marks one or more grants as inactive by their grant IDs' })
    @ApiBody({ type: InactivateGrantBody, description: 'Array of grant IDs to inactivate' })
    @ApiResponse({ status: 200, description: 'Successfully inactivated grants', type: [GrantResponseDto] })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    @ApiResponse({ status: 403, description: 'Forbidden - User does not have access to this resource' })
    @ApiResponse({ status: 500, description: 'Internal Server Error', example: 'Internal Server Error' })
    async inactivate(
        @Body() body: InactivateGrantBody
    ): Promise<Grant[]> {
        this.logger.log(`PUT /grant/inactivate - Inactivating ${body.grantIds.length} grant(s)`);
        let grants: Grant[] = [];
        for(const id of body.grantIds){
            this.logger.debug(`Inactivating grant with ID: ${id}`);
            let newGrant = await this.grantService.makeGrantsInactive(id)
            grants.push(newGrant);
        }
        this.logger.log(`PUT /grant/inactivate - Successfully inactivated ${grants.length} grant(s)`);
        return grants;
    }

    @Post('new-grant')
    @UseGuards(VerifyUserGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new grant', description: 'Creates a new grant in the database with a generated grant ID' })
    @ApiBody({ type: AddGrantBody, description: 'Grant data to create' })
    @ApiResponse({ status: 201, description: 'Successfully created grant', type: Number, example: 1234567890 })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid grant data', example: '{Error encountered}' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    @ApiResponse({ status: 403, description: 'Forbidden - User does not have access to this resource' })
    @ApiResponse({ status: 500, description: 'Internal Server Error', example: 'Internal Server Error' })
    async addGrant(
      @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
      grant: AddGrantBody
    ): Promise<number> {
      this.logger.log(`POST /grant/new-grant - Creating new grant for organization: ${grant.organization}`);
      const grantId = await this.grantService.addGrant(grant as Grant);
      this.logger.log(`POST /grant/new-grant - Successfully created grant with ID: ${grantId}`);
      return grantId;
    }

    @Put('save')
    @UseGuards(VerifyUserGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update an existing grant', description: 'Updates an existing grant in the database with new grant data' })
    @ApiBody({ type: UpdateGrantBody, description: 'Updated grant data including grantId' })
    @ApiResponse({ status: 200, description: 'Successfully updated grant', type: String, example: '{"Attributes": {...}}' })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid grant data', example: '{Error encountered}' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    @ApiResponse({ status: 403, description: 'Forbidden - User does not have access to this resource' })
    @ApiResponse({ status: 500, description: 'Internal Server Error', example: 'Internal Server Error' })
    async saveGrant(@Body() grantData: UpdateGrantBody): Promise<string> {
        this.logger.log(`PUT /grant/save - Updating grant with ID: ${grantData.grantId}`);
        const result = await this.grantService.updateGrant(grantData as Grant);
        this.logger.log(`PUT /grant/save - Successfully updated grant ${grantData.grantId}`);
        return result;
    }

    @Delete(':grantId')
    @UseGuards(VerifyUserGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a grant', description: 'Deletes a grant from the database by its grant ID' })
    @ApiParam({ name: 'grantId', type: Number, description: 'The ID of the grant to delete' })
    @ApiResponse({ status: 200, description: 'Successfully deleted grant', type: String, example: 'Grant 1234567890 deleted successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request - Grant does not exist', example: '{Error encountered}' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    @ApiResponse({ status: 403, description: 'Forbidden - User does not have access to this resource' })
    @ApiResponse({ status: 500, description: 'Internal Server Error', example: 'Internal Server Error' })
    async deleteGrant(@Param('grantId') grantId: number): Promise<string> {
        this.logger.log(`DELETE /grant/${grantId} - Deleting grant`);
        const result = await this.grantService.deleteGrantById(grantId);
        this.logger.log(`DELETE /grant/${grantId} - Successfully deleted grant`);
        return result;
    }
    
    @Get(':id')
    @UseGuards(VerifyUserGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a grant by ID', description: 'Retrieves a single grant from the database by its grant ID' })
    @ApiParam({ name: 'id', type: String, description: 'The ID of the grant to retrieve' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved grant', type: GrantResponseDto })
    @ApiResponse({ status: 404, description: 'Grant not found', example: '{Error encountered}' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    @ApiResponse({ status: 403, description: 'Forbidden - User does not have access to this resource' })
    @ApiResponse({ status: 500, description: 'Internal Server Error', example: 'Internal Server Error' })
    async getGrantById(@Param('id') GrantId: string): Promise<Grant> {
        this.logger.log(`GET /grant/${GrantId} - Retrieving grant by ID`);
        const grant = await this.grantService.getGrantById(parseInt(GrantId, 10));
        this.logger.log(`GET /grant/${GrantId} - Successfully retrieved grant`);
        return grant;
    }
}