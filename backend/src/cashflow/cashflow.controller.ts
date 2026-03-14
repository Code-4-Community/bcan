import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";



@ApiTags('cashflow')
@Controller('cashflow')
export class CashflowController {
    
    @Get('hello')
    @ApiOperation({ summary: 'Hello endpoint', description: 'Returns a simple hello message' })
    @ApiResponse({ status: 200, description: 'Returns hello message' })
    getHello(): string {
        return 'hello';
    }
}