// src/modules/payment/controllers/payments.controller.ts
import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from '../../payment/services/payments.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';

@ApiTags('Payments (Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
@Controller('admin/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Get()
  @ApiOperation({ summary: 'List all payment records' })
  getAll() {
    return this.paymentsService.getAllPayments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment details by ID' })
  getOne(@Param('id') id: string) {
    return this.paymentsService.getPaymentById(id);
  }

  @Post('collect-cod/:orderId')
  @ApiOperation({ summary: 'Mark COD as collected for an order' })
  collectCod(@Param('orderId') orderId: string, @Req() req: any) {
    return this.paymentsService.collectCodPayment(orderId, req.user.id);
  }
}
