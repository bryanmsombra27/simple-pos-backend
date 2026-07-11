import type { Producto } from '../../../generated/prisma/client';
import type {
  CommonFindAllResponse,
  CommonResponse,
} from '../../interfaces/common';

export interface ProductoResponse extends CommonResponse {
  producto: Producto;
}
export interface ProductosFindAllResponse extends CommonFindAllResponse {
  productos: Producto[];
}
