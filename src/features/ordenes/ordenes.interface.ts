import {
  Producto,
  Venta_Por_Producto,
  type Venta,
} from 'generated/prisma/client';
import type {
  CommonFindAllResponse,
  CommonResponse,
} from '../../interfaces/common';

export interface VentaResponse extends CommonResponse {
  venta: Venta;
}
export interface VentaFindAllResponse extends CommonFindAllResponse {
  ventas: Venta[];
}

export interface VentaWithProducts extends Venta {
  productos: Partial<Venta_Por_Producto> & { producto?: Partial<Producto> }[];
}
export type Day = { daily: number }[];
export type Week = { weekly: number }[];
export type Month = { monthly: number }[];
export type SalesCount = { total: number }[];
