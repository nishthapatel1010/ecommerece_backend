import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from '../services/health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('db')
  @ApiOperation({ summary: 'Check database connection' })
  @ApiResponse({ status: 200, description: 'Database is connected' })
  @ApiResponse({ status: 500, description: 'Database is disconnected' })
  checkDb() {
    return this.healthService.checkDb();
  }
}
