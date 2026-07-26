import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateOrdeneDto {
  @ArrayNotEmpty()
  @IsArray({ each: true })
  //   @Type(() => CreateOrdenPorVentaDto)
  productos!: CreateOrdenPorVentaDto[];
  @ArrayNotEmpty()
  @IsArray({ each: true })
  productoIds!: string[];
}

export class CreateOrdenPorVentaDto {
  @IsNumber({ allowNaN: false })
  @IsNotEmpty()
  precio!: number;

  @IsNumber({ allowNaN: false })
  @IsNotEmpty()
  @IsPositive()
  cantidad!: number;

  @IsNotEmpty()
  producto_id!: string;
}

export type ProductoOrden = {
  precio: number;
  cantidad: number;
  producto_id: string;
};
