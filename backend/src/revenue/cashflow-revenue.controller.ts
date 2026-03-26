import { Body, Controller, Delete, Get, Logger, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from "@nestjs/swagger";
import { VerifyAdminRoleGuard } from "../guards/auth.guard";
import { CashflowRevenue } from "../types/CashflowRevenue";
import { RevenueService } from "./cashflow-revenue.service";
import { CashflowRevenueDTO } from "./types/revenue.types";

@ApiTags('cashflow-revenue')
@Controller('cashflow-revenue')
export class RevenueController {

    private readonly logger = new Logger(RevenueController.name);

    constructor(private readonly revService: RevenueService) { }

    @Get()
    @UseGuards(VerifyAdminRoleGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all revenue', description: 'Retrieves all cashflow revenue items' })
    @ApiResponse({ status: 200, description: 'Successfully retrieved all revenue items', type: [CashflowRevenueDTO] })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async getAllRevenue(): Promise<CashflowRevenue[]> {
        return this.revService.getAllRevenue();
    }

    @Post()
    @UseGuards(VerifyAdminRoleGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a revenue item', description: 'Creates a new cashflow revenue item' })
    @ApiBody({ type: CashflowRevenueDTO, description: 'The revenue item to create' })
    @ApiResponse({ status: 201, description: 'Successfully created revenue item', type: CashflowRevenueDTO })
    @ApiResponse({ status: 400, description: 'Bad request - invalid body or missing fields' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
    @ApiResponse({ status: 409, description: 'Conflict - revenue item with this name already exists' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async createRevenue(
        @Body() body: CashflowRevenue
    ): Promise<CashflowRevenue> {
        return await this.revService.createRevenue(body);
    }

    @Put(':name')
    @UseGuards(VerifyAdminRoleGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a revenue item', description: 'Updates an existing cashflow revenue item by name' })
    @ApiParam({ name: 'name', description: 'The name of the revenue item to update' })
    @ApiBody({ type: CashflowRevenueDTO, description: 'The updated revenue item data' })
    @ApiResponse({ status: 200, description: 'Successfully updated revenue item', type: CashflowRevenueDTO })
    @ApiResponse({ status: 400, description: 'Bad request - invalid body or missing fields' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
    @ApiResponse({ status: 404, description: 'Not found - revenue item with this name does not exist' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async updateRevenue(
        @Param('name') name: string,
        @Body() body: CashflowRevenue
    ): Promise<CashflowRevenue> {
        return await this.revService.updateRevenue(name, body);
    }

    @Delete(':name')
    @UseGuards(VerifyAdminRoleGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a revenue item', description: 'Deletes an existing cashflow revenue item by name' })
    @ApiParam({ name: 'name', description: 'The name of the revenue item to delete' })
    @ApiResponse({ status: 200, description: 'Successfully deleted revenue item' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
    @ApiResponse({ status: 404, description: 'Not found - revenue item with this name does not exist' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async deleteRevenue(
        @Param('name') name: string
    ): Promise<void> {
        return await this.revService.deleteRevenue(name);
    }
}