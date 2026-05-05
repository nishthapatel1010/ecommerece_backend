import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AddressService } from '../services/address.service';
import { SaveAddressDto } from '../dto/address.dto';

@ApiTags('Cart Address')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart/address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiOperation({ summary: 'Save shipping and billing address for the pending order' })
  saveAddress(@Req() req: any, @Body() dto: SaveAddressDto) {
    return this.addressService.saveAddress(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get address details for the pending order' })
  getAddress(@Req() req: any) {
    return this.addressService.getAddress(req.user.id);
  }
}
