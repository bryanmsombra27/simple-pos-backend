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
import { CONSTANTS_DEFAULT_SETTINGS } from 'src/common/constants';
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
        codigo_barras: codigo_barras.trim(),
        nombre: nombre.toLowerCase().trim(),
        precio: +precio,
        imagen: fileUploaded
          ? fileUploaded.secure_url
          : CONSTANTS_DEFAULT_SETTINGS.defaultImage,
        descripcion: descripcion?.toLowerCase(),
        public_image_id: fileUploaded
          ? fileUploaded.public_id
          : CONSTANTS_DEFAULT_SETTINGS.publicId,
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

    if (paginationDto.search) {
      const search = paginationDto.search.trim().toLowerCase();
      clause.where = {
        OR: [
          {
            nombre: {
              contains: search,
            },
          },
          {
            descripcion: {
              contains: search,
            },
          },
          {
            codigo_barras: {
              contains: search,
            },
          },
        ],
      };
    }

    const [productos, total] = await Promise.all([
      this.prismaService.producto.findMany(clause),
      this.prismaService.producto.count({
        where: clause.where,
      }),
    ]);
    // ceil redondear hacia arriba
    const totalPages = Math.ceil(total / limit);

    return {
      message: 'Productos encontrados',
      pagina: +page,
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
    file: Express.Multer.File,
  ): Promise<ProductoResponse> {
    const producto = await this.findOne(id);
    const { codigo_barras, descripcion, nombre, precio } = updateProductoDto;
    let publicId: string = '';
    let image_url: string = '';

    if (file) {
      if (producto.public_image_id != CONSTANTS_DEFAULT_SETTINGS.publicId) {
        this.cloudinaryService.deleteFile(producto.public_image_id!);
      }
      const fileUploaded = await this.cloudinaryService.uploadFile(file);

      publicId = fileUploaded.image.public_id;
      image_url = fileUploaded.image.secure_url;
    }

    const updatedProduct = await this.prismaService.producto.update({
      data: {
        codigo_barras: codigo_barras ?? producto.codigo_barras,
        descripcion: descripcion ?? producto.descripcion,
        nombre: nombre ?? producto.nombre,
        precio: precio ? +precio : producto.precio,
        public_image_id: publicId ? publicId : producto.public_image_id,
        imagen: image_url ? image_url : producto.imagen,
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
