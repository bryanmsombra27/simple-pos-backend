import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateOrdeneDto,
  CreateOrdenPorVentaDto,
  ProductoOrden,
} from './dto/create-ordene.dto';
import { UpdateOrdeneDto } from './dto/update-ordene.dto';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class OrdenesService {
  constructor(private readonly prismaService: PrismaService) {}

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

    for (const producto of createOrdeneDto.productos) {
      const productoEnAlmacen = productosDelAlmacen.find(
        (p) => p.id == producto.producto_id,
      );
      if (
        productoEnAlmacen &&
        producto.cantidad < productoEnAlmacen?.stock!.cantidad
      ) {
        productos.push(producto);
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
      include: {
        productos: {
          select: {
            cantidad: true,
            producto_id: true,
          },
        },
      },
    });

    return {
      message: 'La venta se realizo con exito',
      venta,
    };
  }

  async findAll() {
    return `This action returns all ordenes`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} ordene`;
  }

  async update(id: number, updateOrdeneDto: UpdateOrdeneDto) {
    return `This action updates a #${id} ordene`;
  }

  async remove(id: number) {
    return `This action removes a #${id} ordene`;
  }
}
