import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Post, Put, UseGuards, ValidationPipe } from '@nestjs/common';
import { RevenueService } from './revenue.service';
import { VerifyUserGuard } from '../guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateRevenueTypeBody, RevenueTypeResponseDto, UpdateRevenueTypeBody } from './types/revenue.types';

@ApiTags('revenue-types')
@Controller('revenue-types')
export class RevenueController {
    private readonly logger = new Logger(RevenueController.name);

    constructor(private readonly revenueService: RevenueService) {}

    @Post()
    @UseGuards(VerifyUserGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create revenue type', description: 'Creates a new revenue type record.' })
    @ApiBody({ type: CreateRevenueTypeBody })
    @ApiResponse({ status: 201, description: 'Revenue type created successfully', type: RevenueTypeResponseDto })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid request payload' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    @ApiResponse({ status: 403, description: 'Forbidden - User does not have access to this resource' })
    @ApiResponse({ status: 500, description: 'Internal Server Error - AWS or server error' })
    async createRevenueType(
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
        body: CreateRevenueTypeBody,
    ): Promise<RevenueTypeResponseDto> {
        this.logger.log(`POST /revenue-types - Creating revenue type: ${body.name}`);
        return this.revenueService.createRevenueType(body);
    }

    @Get()
    @UseGuards(VerifyUserGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all revenue types', description: 'Retrieves all revenue type records.' })
    @ApiResponse({ status: 200, description: 'Revenue types retrieved successfully', type: [RevenueTypeResponseDto] })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    @ApiResponse({ status: 403, description: 'Forbidden - User does not have access to this resource' })
    @ApiResponse({ status: 500, description: 'Internal Server Error - AWS or server error' })
    async getAllRevenueTypes(): Promise<RevenueTypeResponseDto[]> {
        this.logger.log('GET /revenue-types - Retrieving all revenue types');
        return this.revenueService.getAllRevenueTypes();
    }

    @Get(':revenueTypeId')
    @UseGuards(VerifyUserGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get revenue type by ID', description: 'Retrieves a revenue type record by ID.' })
    @ApiParam({ name: 'revenueTypeId', type: Number, description: 'Revenue type ID' })
    @ApiResponse({ status: 200, description: 'Revenue type retrieved successfully', type: RevenueTypeResponseDto })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid revenue type ID' })
    @ApiResponse({ status: 404, description: 'Not Found - Revenue type does not exist' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    @ApiResponse({ status: 403, description: 'Forbidden - User does not have access to this resource' })
    @ApiResponse({ status: 500, description: 'Internal Server Error - AWS or server error' })
    async getRevenueTypeById(
        @Param('revenueTypeId', ParseIntPipe) revenueTypeId: number,
    ): Promise<RevenueTypeResponseDto> {
        this.logger.log(`GET /revenue-types/${revenueTypeId} - Retrieving revenue type`);
        return this.revenueService.getRevenueTypeById(revenueTypeId);
    }

    @Put(':revenueTypeId')
    @UseGuards(VerifyUserGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update revenue type', description: 'Updates a revenue type record by ID.' })
    @ApiParam({ name: 'revenueTypeId', type: Number, description: 'Revenue type ID' })
    @ApiBody({ type: UpdateRevenueTypeBody })
    @ApiResponse({ status: 200, description: 'Revenue type updated successfully', type: RevenueTypeResponseDto })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid payload or revenue type ID' })
    @ApiResponse({ status: 404, description: 'Not Found - Revenue type does not exist' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    @ApiResponse({ status: 403, description: 'Forbidden - User does not have access to this resource' })
    @ApiResponse({ status: 500, description: 'Internal Server Error - AWS or server error' })
    async updateRevenueType(
        @Param('revenueTypeId', ParseIntPipe) revenueTypeId: number,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
        body: UpdateRevenueTypeBody,
    ): Promise<RevenueTypeResponseDto> {
        this.logger.log(`PUT /revenue-types/${revenueTypeId} - Updating revenue type`);
        return this.revenueService.updateRevenueType(revenueTypeId, body);
    }

    @Delete(':revenueTypeId')
    @UseGuards(VerifyUserGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete revenue type', description: 'Deletes a revenue type record by ID.' })
    @ApiParam({ name: 'revenueTypeId', type: Number, description: 'Revenue type ID' })
    @ApiResponse({ status: 200, description: 'Revenue type deleted successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid revenue type ID' })
    @ApiResponse({ status: 404, description: 'Not Found - Revenue type does not exist' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    @ApiResponse({ status: 403, description: 'Forbidden - User does not have access to this resource' })
    @ApiResponse({ status: 500, description: 'Internal Server Error - AWS or server error' })
    async deleteRevenueTypeById(
        @Param('revenueTypeId', ParseIntPipe) revenueTypeId: number,
    ): Promise<{ message: string }> {
        this.logger.log(`DELETE /revenue-types/${revenueTypeId} - Deleting revenue type`);
        return this.revenueService.deleteRevenueTypeById(revenueTypeId);
    }
}