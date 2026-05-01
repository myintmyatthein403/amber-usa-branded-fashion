import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { VariantsModule } from './variants/variants.module';
import { BrandsModule } from './brands/brands.module';
import { MediaModule } from './media/media.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { HeroModule } from './hero/hero.module';
import { CollectionsModule } from './collections/collections.module';
import { CouponsModule } from './coupons/coupons.module';
import { GiftCardsModule } from './gift-cards/gift-cards.module';
import { SalesModule } from './sales/sales.module';
import { SettingsModule } from './settings/settings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { MissionModule } from './mission/mission.module';
import { GiftCardSectionModule } from './gift-card-section/gift-card-section.module';
import { SaleSectionModule } from './sale-section/sale-section.module';
import { FooterSectionModule } from './footer-section/footer-section.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { CommunityPostsModule } from './community-posts/community-posts.module';
import { DeliveryMethodsModule } from './delivery-methods/delivery-methods.module';
import { AdsModule } from './ads/ads.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { StripeModule } from './stripe/stripe.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { LogisticsModule } from './logistics/logistics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      serveRoot: '/',
    }),
    PrismaModule,
    ProductsModule,
    AuthModule,
    CategoriesModule,
    VariantsModule,
    BrandsModule,
    MediaModule,
    CloudinaryModule,
    HeroModule,
    CollectionsModule,
    CouponsModule,
    GiftCardsModule,
    SalesModule,
    SettingsModule,
    ReviewsModule,
    MissionModule,
    GiftCardSectionModule,
    SaleSectionModule,
    FooterSectionModule,
    TestimonialsModule,
    CommunityPostsModule,
    DeliveryMethodsModule,
    AdsModule,
    UsersModule,
    RolesModule,
    StripeModule,
    OrdersModule,
    PaymentMethodsModule,
    LogisticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
