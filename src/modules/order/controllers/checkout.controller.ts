import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CheckoutService } from '../services/checkout.service';
import { Response } from 'express';

@ApiTags('Cart Checkout')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get order summary (items and totals) before checkout' })
  getSummary(@Req() req: any) {
    return this.checkoutService.getSummary(req.user.id);
  }

  @Get('export-csv')
  @ApiOperation({ summary: 'Download current cart as a CSV file (Excel compatible)' })
  async exportCsv(@Req() req: any, @Res() res: Response) {
    const csv = await this.checkoutService.exportCartCsv(req.user.id);
    const filename = `cart-${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Finalize order, deduct stock, and confirm purchase' })
  checkout(@Req() req: any) {
    return this.checkoutService.checkout(req.user.id);
  }
}
