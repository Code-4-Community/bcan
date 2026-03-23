import { Body, Controller, Get, Patch, Logger, UseGuards} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DefaultValuesService } from './default-values.service';
import {
  DefaultValuesResponse,
  UpdateDefaultValueBody,
} from './types/default-values.types';
import { VerifyAdminRoleGuard } from '../guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';


@ApiTags('default-values')
@Controller('default-values')
export class DefaultValuesController {
    private readonly logger = new Logger(DefaultValuesController.name);

    constructor(private readonly defaultValuesService: DefaultValuesService) {}

    /**
     * Gets the default values for starting cash, benefits increase, and salary increase for cash flow
     * @returns DefaultValuesResponse containing the default values
     */
    @Get()
    @UseGuards(VerifyAdminRoleGuard)
    @ApiBearerAuth()
    @ApiResponse({
        status: 200,
        description: 'Default values retrieved successfully',
    })
    @ApiResponse({
        status: 404,
        description: 'Default values not found',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal Server Error',
    })
    async getDefaultValues(): Promise<DefaultValuesResponse> {
        this.logger.log('GET /default-values - Retrieving default values');
        return await this.defaultValuesService.getDefaultValues();    
    }

    /**
     * Edits a default value for cash flow based on the provided key and value
     * @param body - UpdateDefaultValueBody containing the key of the default value to update and the new value
     * @returns new DefaultValuesResponse with the updated default values
     */
    @Patch()
    @UseGuards(VerifyAdminRoleGuard)
    @ApiBearerAuth()
    @ApiBody({ schema: {
        type: 'object',
        properties: {
          key: { type: 'string', enum: ['startingCash', 'benefitsIncrease', 'salaryIncrease'] },
          value: { type: 'number' }
        }
      }})
    @ApiResponse({
        status: 200,
        description: 'Default value updated successfully',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request - Invalid key or value',
    })
    @ApiResponse({
        status: 404,
        description: 'Default value not found',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal Server Error',
    })
    async updateDefaultValue(
        @Body() body: UpdateDefaultValueBody,
    ): Promise<DefaultValuesResponse> {
        this.logger.log(`PATCH /default-values - Updating default value for key: ${body.key}`);
        const updatedValues = await this.defaultValuesService.updateDefaultValue(body.key, body.value);
        this.logger.log(`PATCH /default-values - Successfully updated default value for key: ${body.key}`);
        return updatedValues;
    }
}
