import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CostService } from './cost.service';
import { CostType } from '../../../middle-layer/types/CostType';

interface CreateCostBody {
  amount: number;
  type: CostType;
  name: string;
}

interface UpdateCostBody {
  amount?: number;
  type?: CostType;
  name?: string;
}

@ApiTags('cost')
@Controller('cost')
export class CostController {
  constructor(private readonly costService: CostService) {}

  /**
   * Gets all the costs for cash flow
   * @returns array of all CashflowCosts in db
   */
  @Get()
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
  @ApiOperation({ summary: 'Get cost by name' })
  @ApiParam({ name: 'costName', type: String, description: 'Cost Name' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved cost' })
  @ApiResponse({ status: 404, description: 'Cost not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getCostByName(@Param('costName') costName: string) {
    return await this.costService.getCostByName(costName);
  }

  /**
   * gets costs by type (e.g. Personal Salary, Personal Benefits, etc.)
   * @param costType type of cost you are trying to get (e.g. all Salary costs)
   * @returns array of costs of the specified type, if any exist
   */
  @Get(':costType')
  @ApiOperation({ summary: 'Get costs by type' })
  @ApiParam({ name: 'costType', type: String, description: 'Cost Type' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved costs' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getCostsByType(@Param('costType') costType: CostType) {
    return await this.costService.getCostsByType(costType);
  }

  /**
   * creates a new cost with the specified fields in the request body
   * @param body must include amount, type, and name of the cost to be created
   * @returns 
   */
  @Post()
  @ApiOperation({ summary: 'Create a cost' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['amount', 'type', 'name'],
      properties: {
        amount: { type: 'number', example: 12000 },
        type: {
          type: 'string',
          enum: Object.values(CostType),
          example: CostType.Salary,
        },
        name: { type: 'string', example: 'Program Manager Salary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Successfully created cost' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid cost payload' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createCost(@Body() body: CreateCostBody) {
    return await this.costService.createCost(body);
  }

  @Patch(':costName')
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
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Successfully updated cost' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid update payload' })
  @ApiResponse({ status: 404, description: 'Cost not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateCost(
    @Param('costName') costName: string,
    @Body() body: UpdateCostBody,
  ) {
    if (Object.keys(body).length === 0) {
      throw new BadRequestException('At least one field is required for update');
    }

    return await this.costService.updateCost(costName, body);
  }

  @Delete(':costName')
  @ApiOperation({ summary: 'Delete cost by name' })
  @ApiParam({ name: 'costName', type: String, description: 'Cost Name' })
  @ApiResponse({ status: 200, description: 'Successfully deleted cost' })
  @ApiResponse({ status: 404, description: 'Cost not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteCost(@Param('costName') costName: string) {
    return await this.costService.deleteCost(costName);
  }
}
