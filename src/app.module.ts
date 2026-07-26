import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './services/prisma/prisma.service';
import { ProductoModule } from './features/producto/producto.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { OrdenesModule } from './features/ordenes/ordenes.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ProductoModule, CloudinaryModule, OrdenesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
