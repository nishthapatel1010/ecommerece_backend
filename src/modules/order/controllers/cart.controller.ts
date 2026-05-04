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
  ParseUUIDPipe,
} from '@nestjs/common';

import { CartService } from '../services/cart.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private getUserId(req: any): string {
    return req.user?.id || req.headers['x-user-id'];
  }

  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(this.getUserId(req));
  }

  @Post()
  addToCart(@Req() req: any, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(this.getUserId(req), dto);
  }

  @Patch(':itemId')
  updateCartItem(
    @Req() req: any,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(
      this.getUserId(req),
      itemId,
      dto,
    );
  }

  @Delete(':itemId')
  removeCartItem(
    @Req() req: any,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
  ) {
    return this.cartService.removeCartItem(
      this.getUserId(req),
      itemId,
    );
  }

  @Delete('clear')
  clearCart(@Req() req: any) {
    return this.cartService.clearCart(this.getUserId(req));
  }
}