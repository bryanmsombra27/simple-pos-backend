import { Transform } from "class-transformer";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  isPositive,
  IsString,
  Min,
} from "class-validator";
export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @IsNumber({ allowNaN: false })
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsPositive()
  @IsNumber({ allowNaN: false })
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @IsString()
  search?: string;
}
