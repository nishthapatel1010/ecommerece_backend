// src/modules/cart/controllers/cart.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { CartService } from '../services/cart.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../modules/user/entities/user.entity';


import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUYER)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Post()
  addToCart(@Req() req: any, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, dto);
  }

  @Patch(':itemId')
  updateCartItem(
    @Req() req: any,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(
      req.user.id,
      itemId,
      dto,
    );
  }

  @Delete('clear')
  clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.id);
  }

  @Delete(':itemId')
  removeCartItem(
    @Req() req: any,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
  ) {
    return this.cartService.removeCartItem(
      req.user.id,
      itemId,
    );
  }
}