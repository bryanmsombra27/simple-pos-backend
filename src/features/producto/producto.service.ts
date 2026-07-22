import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import type {
  ProductoResponse,
  ProductosFindAllResponse,
} from './producto.interface';
import { PaginationDto } from '../../common/pagination.dto';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { Prisma, Producto } from 'generated/prisma/client';
import { type Express } from 'express';
import {
  CloudinaryResponse,
  CloudinaryService,
} from 'src/cloudinary/cloudinary.service';
@Injectable()
export class ProductoService {
  private include: Prisma.ProductoInclude;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    this.include = {
      stock: {
        select: {
          cantidad: true,
        },
      },
    };
  }

  async create(
    createProductoDto: CreateProductoDto,
    file: Express.Multer.File,
  ): Promise<ProductoResponse> {
    let fileUploaded!: CloudinaryResponse;

    const { codigo_barras, nombre, precio, descripcion, almacen } =
      createProductoDto;

    if (file) {
      const response = await this.cloudinaryService.uploadFile(file);

      fileUploaded = response.image;
    }

    const producto = await this.prismaService.producto.create({
      data: {
        codigo_barras,
        nombre,
        precio: +precio,
        imagen: fileUploaded
          ? fileUploaded.secure_url
          : 'https://res.cloudinary.com/dykizva9a/image/upload/v1784654875/producto-default_fxm3sa.png',
        descripcion,
        stock: {
          create: {
            cantidad: +almacen,
          },
        },
      },
    });
    if (!producto)
      throw new BadRequestException('No fue posible crear el producto');

    return {
      message: 'Producto creado con exito!',
      producto,
    };
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<ProductosFindAllResponse> {
    const page = paginationDto.page ?? 1;
    const limit = paginationDto.limit ?? 10;
    const offset = (+page - 1) * limit;

    const clause: Prisma.ProductoFindManyArgs = {
      take: limit,
      skip: offset,
      include: this.include,
    };
    const [productos, total] = await Promise.all([
      this.prismaService.producto.findMany(clause),
      this.prismaService.producto.count(),
    ]);
    // ceil redondear hacia arriba
    const totalPages = Math.ceil(total / limit);

    return {
      message: 'Productos encontrados',
      pagina: page,
      productos,
      total_registros: total,
      total_paginas: totalPages,
    };
  }

  async findOne(id: string): Promise<Producto> {
    const producto = await this.prismaService.producto.findFirst({
      where: {
        OR: [{ id }, { codigo_barras: id }],
      },
      include: this.include,
    });
    if (!producto) throw new NotFoundException('No se encontro el producto');
    return producto;
  }

  async update(
    id: string,
    updateProductoDto: UpdateProductoDto,
  ): Promise<ProductoResponse> {
    const producto = await this.findOne(id);
    const { codigo_barras, descripcion, nombre, precio } = updateProductoDto;

    const updatedProduct = await this.prismaService.producto.update({
      data: {
        codigo_barras: codigo_barras ?? producto.codigo_barras,
        descripcion: descripcion ?? producto.descripcion,
        nombre: nombre ?? producto.nombre,
        precio: precio ?? producto.precio,
      },
      where: {
        id,
      },
      include: this.include,
    });
    return {
      message: 'Producto actualizado con exito',
      producto: updatedProduct,
    };
  }

  async remove(id: string): Promise<ProductoResponse> {
    const producto = await this.findOne(id);
    await this.prismaService.producto.delete({
      where: {
        id,
      },
    });
    return {
      message: 'Producto eliminado con exito',
      producto,
    };
  }
}
