// src/modules/order/controllers/admin-orders.controller.ts
import { Controller, Get, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from '../../order/services/orders.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';
import { OrderStatus } from '../../order/entities/order.entity';

import { UpdateOrderStatusDto } from '../../order/dto/update-order-status.dto';

@ApiTags('Admin Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List all orders with filters and pagination' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getAll(@Query() query: any) {
    return this.ordersService.getAllOrders(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full order details with items, payment, and timeline' })
  getOne(@Param('id') id: string) {
    return this.ordersService.getOrderDetails(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (placed -> processing -> shipped -> delivered)' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateOrderStatusDto,
    @Req() req: any,
  ) {
    return this.ordersService.updateStatus(id, body.status, req.user.id, body);
  }
}
