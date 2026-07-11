import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './services/prisma/prisma.service';
import { ProductoModule } from './features/producto/producto.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ProductoModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
