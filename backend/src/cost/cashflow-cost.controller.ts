import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
  UseGuards
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth
} from '@nestjs/swagger';
import { CostService } from './cashflow-cost.service';
import { VerifyAdminRoleGuard } from '../guards/auth.guard';
import { CashflowCost } from '../types/CashflowCost';
import { CashflowCostDTO } from './types/cost.types';

// interface CreateCostBody {
//  cost : CashflowCost;
// }

// interface UpdateCostBody {
//   cost : CashflowCost
// }

@ApiTags('cashflow-cost')
@Controller('cashflow-cost')
export class CostController {
  constructor(private readonly costService: CostService) {}

  /**
   * Gets all the costs for cash flow
   * @returns array of all CashflowCosts in db
   */
  @Get()
  @UseGuards(VerifyAdminRoleGuard)
  @ApiBearerAuth()
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved all costs' })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal Server Error' })
  async getAllCosts() {
    return await this.costService.getAllCosts();
  }

  /**
   * gets a cost by name
   * @param costName name of cost (e.g. "Intern #1 Salary")
   * @returns the cost with the specified name, if it exists
   */
  @Get(':costName')
  @UseGuards(VerifyAdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get cost by name' })
  @ApiParam({ name: 'costName', type: String, description: 'Cost Name' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved cost' })
  @ApiResponse({ status: 404, description: 'Cost not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getCostByName(@Param('costName') costName: string) {
    return await this.costService.getCostByName(costName);
  }

  /**
   * creates a new cost with the specified fields in the request body
   * @param body must include amount, type, and name of the cost to be created
   * @returns 
   */
  @Post()
  @UseGuards(VerifyAdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a cost' })
  @ApiBody({ type: CashflowCostDTO, description: 'Full cost payload' })
  @ApiResponse({ status: 201, description: 'Successfully created cost' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid cost payload' })
  @ApiResponse({ status: 409, description: 'Conflict - Cost with the same name already exists' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createCost(@Body() body: CashflowCostDTO) {
    return await this.costService.createCost(body);
  }

  @Put(':costName')
  @UseGuards(VerifyAdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Replace cost by name' })
  @ApiParam({ name: 'costName', type: String, description: 'Cost Name' })
  @ApiBody({ type: CashflowCostDTO, description: 'Full replacement payload (all fields required)' })
  @ApiResponse({ status: 200, description: 'Successfully updated cost' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid update payload' })
  @ApiResponse({ status: 404, description: 'Cost not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Cost with the updated name already exists' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateCost(
    @Param('costName') costName: string,
    @Body() body: CashflowCostDTO,
  ) {
    return await this.costService.updateCost(decodeURIComponent(costName), body);
  }

  @Delete(':costName')
  @UseGuards(VerifyAdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete cost by name' })
  @ApiParam({ name: 'costName', type: String, description: 'Cost Name' })
  @ApiResponse({ status: 200, description: 'Successfully deleted cost' })
  @ApiResponse({ status: 404, description: 'Cost not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteCost(@Param('costName') costName: string) {
    return await this.costService.deleteCost(decodeURIComponent(costName));
  }
}
