-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "nombre" TEXT NOT NULL,
    "imagen" TEXT,
    "descripcion" TEXT,
    "codigo_barras" TEXT NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Almacen" (
    "id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "producto_id" TEXT NOT NULL,

    CONSTRAINT "Almacen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta_Por_Producto" (
    "id" TEXT NOT NULL,
    "venta_id" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "producto_id" TEXT NOT NULL,

    CONSTRAINT "Venta_Por_Producto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigo_barras_key" ON "Producto"("codigo_barras");

-- CreateIndex
CREATE UNIQUE INDEX "Almacen_producto_id_key" ON "Almacen"("producto_id");

-- AddForeignKey
ALTER TABLE "Almacen" ADD CONSTRAINT "Almacen_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta_Por_Producto" ADD CONSTRAINT "Venta_Por_Producto_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "Venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta_Por_Producto" ADD CONSTRAINT "Venta_Por_Producto_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
