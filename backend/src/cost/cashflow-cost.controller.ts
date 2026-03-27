import {
  BadRequestException,
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
import { CostType } from '../../../middle-layer/types/CostType';
import { VerifyAdminRoleGuard } from '../guards/auth.guard';
import { CashflowCost } from '../types/CashflowCost';

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
  @ApiBody({
    schema: {
    type: 'object',
    required: ['name', 'amount', 'type','date'],
    properties: {
      name: { type: 'string', example: 'PM Salary' },
      amount: { type: 'number', example: 12000 },
      type: { type: 'string', enum: Object.values(CostType), example: CostType.Salary },
      date: { type: 'string', example: '2026-03-14T00:00:00.000Z' },
    },
  },
})
  @ApiResponse({ status: 201, description: 'Successfully created cost' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid cost payload' })
  @ApiResponse({ status: 409, description: 'Conflict - Cost with the same name already exists' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createCost(@Body() body: CashflowCost) {
    return await this.costService.createCost(body);
  }

  @Put(':costName')
  @UseGuards(VerifyAdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update cost fields by name' })
  @ApiParam({ name: 'costName', type: String, description: 'Cost Name' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 13000 },
        type: {
          type: 'string',
          enum: Object.values(CostType),
          example: CostType.Benefits,
        },
        name: { type: 'string', example: 'Updated Cost Name' },
        date: {type: 'string', example: "2026-03-22T16:09:52Z"}
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Successfully updated cost' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid update payload' })
  @ApiResponse({ status: 404, description: 'Cost not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Cost with the updated name already exists' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateCost(
    @Param('costName') costName: string,
    @Body() body: CashflowCost,
  ) {
    if (Object.keys(body).length === 0) {
      throw new BadRequestException('At least one field is required for update');
    }

    return await this.costService.updateCost(costName, body);
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
    return await this.costService.deleteCost(costName);
  }
}
