import { type Venta } from 'generated/prisma/client';
import type {
  CommonFindAllResponse,
  CommonResponse,
} from '../../interfaces/common';

export interface ProductoResponse extends CommonResponse {
  venta: Venta;
}
export interface ProductosFindAllResponse extends CommonFindAllResponse {
  ventas: Venta[];
}
