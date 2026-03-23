import { Body, Controller, Get, Logger, Post, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
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
}