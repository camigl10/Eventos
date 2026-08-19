-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "price" DECIMAL NOT NULL DEFAULT 0,
    "sellerName" TEXT NOT NULL,
    "sold" BOOLEAN NOT NULL DEFAULT false,
    "soldAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "InventoryItem_eventId_idx" ON "InventoryItem"("eventId");

-- CreateIndex
CREATE INDEX "InventoryItem_eventId_sold_idx" ON "InventoryItem"("eventId", "sold");

-- CreateIndex
CREATE INDEX "InventoryItem_eventId_sellerName_idx" ON "InventoryItem"("eventId", "sellerName");
