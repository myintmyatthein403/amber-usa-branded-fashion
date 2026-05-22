import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { ProductsScheduler } from './products.scheduler';
import { AttributesModule } from '../attributes/attributes.module';

@Module({
  imports: [AttributesModule],
  providers: [ProductsService, ProductsRepository, ProductsScheduler],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
