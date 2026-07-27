import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateOrdeneDto,
  CreateOrdenPorVentaDto,
  ProductoOrden,
} from './dto/create-ordene.dto';
import { UpdateOrdeneDto } from './dto/update-ordene.dto';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { PaginationDto } from 'src/common/pagination.dto';
import { Prisma } from 'generated/prisma/client';
import { VentaFindAllResponse, VentaWithProducts } from './ordenes.interface';

@Injectable()
export class OrdenesService {
  private include: Prisma.VentaInclude;

  constructor(private readonly prismaService: PrismaService) {
    this.include = {
      productos: {
        select: {
          id: true,
          cantidad: true,
          producto_id: true,
          precio: true,
        },
      },
    };
  }

  async create(createOrdeneDto: CreateOrdeneDto) {
    const productosDelAlmacen = await this.prismaService.producto.findMany({
      where: {
        id: {
          in: createOrdeneDto.productoIds,
        },
      },
      include: {
        stock: {
          select: {
            cantidad: true,
          },
        },
      },
    });

    const productos: CreateOrdenPorVentaDto[] = [];
    const actualizarAlmacen: any = [];

    for (const producto of createOrdeneDto.productos) {
      const productoEnAlmacen = productosDelAlmacen.find(
        (p) => p.id == producto.producto_id,
      );
      if (
        productoEnAlmacen &&
        producto.cantidad < productoEnAlmacen?.stock!.cantidad
      ) {
        productos.push(producto);
        const almacen = this.prismaService.almacen.update({
          data: {
            cantidad: {
              decrement: producto.cantidad,
            },
          },
          where: { producto_id: producto.producto_id },
        });

        actualizarAlmacen.push(almacen);
      } else {
        throw new BadRequestException(
          `El producto ${productoEnAlmacen?.nombre} no cuenta con el inventario suficiente para surtir el pedido`,
        );
      }
    }
    const total = productos.reduce(
      (acc, value) => acc + value.cantidad * value.precio,
      0,
    );

    const venta = await this.prismaService.venta.create({
      data: {
        total,
        productos: {
          createMany: {
            data: productos,
          },
        },
      },
      include: this.include,
    });
    if (venta) Promise.all(actualizarAlmacen);

    return {
      message: 'La venta se realizo con exito',
      venta,
    };
  }

  async findAll(
    pagination: PaginationDto,
    date: Date,
  ): Promise<VentaFindAllResponse> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const offset = (+page - 1) * limit;

    const clause: Prisma.VentaFindManyArgs = {
      where: {
        fecha: Intl.DateTimeFormat('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(date),
      },
      take: limit,
      skip: offset,
    };
    const [ventas, total] = await Promise.all([
      this.prismaService.venta.findMany(clause),
      this.prismaService.venta.count({ where: clause.where }),
    ]);
    // ceil redondear hacia arriba
    const totalPages = Math.ceil(total / limit);

    return {
      message: 'Ventas realizadas',
      pagina: page,
      total_paginas: totalPages,
      total_registros: total,
      ventas,
    };
  }

  async findOne(id: string): Promise<VentaWithProducts> {
    const venta = await this.prismaService.venta.findUnique({
      where: { id },
      include: this.include,
    });
    if (!venta) throw new NotFoundException('No se encontro la venta');

    return venta;
  }

  async update(id: number, updateOrdeneDto: UpdateOrdeneDto) {
    return `This action updates a #${id} ordene`;
  }

  async remove(id: number) {
    return `This action removes a #${id} ordene`;
  }
}
