-- CreateTable
CREATE TABLE "Feria" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "feriaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoData" BYTEA,
    "photoMime" TEXT,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sellerName" TEXT NOT NULL,
    "sold" BOOLEAN NOT NULL DEFAULT false,
    "soldAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feria_date_idx" ON "Feria"("date");

-- CreateIndex
CREATE INDEX "InventoryItem_feriaId_idx" ON "InventoryItem"("feriaId");

-- CreateIndex
CREATE INDEX "InventoryItem_feriaId_sold_idx" ON "InventoryItem"("feriaId", "sold");

-- CreateIndex
CREATE INDEX "InventoryItem_feriaId_sellerName_idx" ON "InventoryItem"("feriaId", "sellerName");

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_feriaId_fkey" FOREIGN KEY ("feriaId") REFERENCES "Feria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
