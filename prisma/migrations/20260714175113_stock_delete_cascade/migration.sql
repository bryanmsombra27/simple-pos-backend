-- DropForeignKey
ALTER TABLE "Almacen" DROP CONSTRAINT "Almacen_producto_id_fkey";

-- AddForeignKey
ALTER TABLE "Almacen" ADD CONSTRAINT "Almacen_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
