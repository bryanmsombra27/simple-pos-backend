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
import { Prisma, Venta } from 'generated/prisma/client';
import {
  Day,
  Month,
  VentaFindAllResponse,
  VentaWithProducts,
  Week,
} from './ordenes.interface';
import { format, subDays, subMonths } from 'date-fns';

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

    const today = new Date().toISOString();

    const venta = await this.prismaService.venta.create({
      data: {
        total,
        fecha: today,
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

    const inicio = format(
      new Date().setHours(0, 0, 0, 0),
      'yyyy-MM-dd HH:mm:ss:sss zzzz',
    );
    const fin = format(
      new Date().setHours(0, 0, 0),
      'yyyy-MM-dd HH:mm:ss:sss zzzz',
    );

    const initialDateTime = subDays(new Date(inicio), 1).toISOString();
    const finalDateTime = new Date(fin).toISOString();

    const dateTime: Prisma.DateTimeFilter = {
      gte: initialDateTime,
      lt: finalDateTime,
    };

    const clause: Prisma.VentaFindManyArgs = {
      where: {
        fecha: dateTime,
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

  async earnings() {
    const inicio = format(new Date().setHours(0, 0, 0, 0), 'yyyy-MM-dd zzzz');

    // daily
    const day = subDays(new Date(inicio), 1).toISOString();
    const week = subDays(new Date(inicio), 8).toISOString();
    const month = subMonths(new Date(inicio), 1).toISOString();

    const [daily, weekly, monthly] = await Promise.all([
      this.prismaService
        .$queryRaw`select  SUM(total) AS daily  from "Venta"  where fecha::date = ${day}`,
      this.prismaService
        .$queryRaw`select  SUM(total) AS weekly  from "Venta"  where fecha::date BETWEEN ${week} AND ${day}`,
      this.prismaService
        .$queryRaw`select  SUM(total) AS monthly  from "Venta"  where fecha::date BETWEEN ${month} AND ${day}`,
    ]);
    const dayResult = (daily as Day)[0].daily;
    const weekResult = (weekly as Week)[0].weekly;
    const monthResult = (monthly as Month)[0].monthly;

    return {
      day: dayResult,
      week: weekResult,
      month: monthResult,
    };
  }

  private dateTimeFilter(init: string, finish: string): Prisma.DateTimeFilter {
    const filter: Prisma.DateTimeFilter = {
      gte: init,
      lt: finish,
    };
    return filter;
  }

  private clauseFilter(date: Prisma.DateTimeFilter<never>) {
    const clause: Prisma.VentaFindManyArgs = {
      where: {
        fecha: date,
      },
      select: { total: true },
    };
    return clause;
  }
}
