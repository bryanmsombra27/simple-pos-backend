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
  productos: Pick<
    Venta_Por_Producto,
    'id' | 'cantidad' | 'producto_id' | 'precio'
  >[];
}
