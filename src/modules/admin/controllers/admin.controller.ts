import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from '../services/admin.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('buyers')
  @ApiOperation({ summary: 'Get all pending buyer requests' })
  getAllBuyerRequests() {
    return this.adminService.getAllBuyerRequests();
  }

  @Get('buyers/:id')
  @ApiOperation({ summary: 'Get buyer request by user id' })
  getBuyerRequestById(@Param('id') id: string) {
    return this.adminService.getBuyerRequestById(id);
  }

  @Post('buyers/:id/approve')
  @ApiOperation({ summary: 'Approve buyer — generates CID and creates profile' })
  approveBuyer(@Param('id') id: string) {
    return this.adminService.approveBuyer(id);
  }

  @Post('buyers/:id/reject')
  @ApiOperation({ summary: 'Reject buyer request' })
  rejectBuyer(@Param('id') id: string) {
    return this.adminService.rejectBuyer(id);
  }
}
