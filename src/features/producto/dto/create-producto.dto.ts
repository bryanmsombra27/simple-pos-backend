import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateProductoDto {
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, maxDecimalPlaces: 2 })
  @IsPositive()
  @Transform(({ value }) => Number(value))
  precio!: number;

  @IsNotEmpty()
  @IsString()
  nombre!: string;

  @IsNotEmpty()
  @IsString()
  codigo_barras!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  almacen!: number;
}
