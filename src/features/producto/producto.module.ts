import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { PrismaService } from '../../services/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  controllers: [ProductoController],
  providers: [ProductoService, PrismaService, CloudinaryService],
})
export class ProductoModule {}
