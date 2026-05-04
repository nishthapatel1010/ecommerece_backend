import { AuthModule } from '../modules/auth/auth.module';
import { UserModule } from '../modules/user/user.module';
import { ProductModule } from '../modules/product/product.module';
import { OrderModule } from '../modules/order/order.module';
import { HealthModule } from '../modules/health/health.module';
import { AdminModule } from '../modules/admin/admin.module';

export const AppRoutes = [AuthModule, UserModule, ProductModule, OrderModule, HealthModule, AdminModule];
