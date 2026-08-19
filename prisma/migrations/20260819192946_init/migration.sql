-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('BODA', 'XV_ANOS', 'CUMPLEANOS', 'CORPORATIVO', 'FERIA', 'OTRO');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('NO_ENVIADA', 'ENVIADA', 'CONFIRMADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "VendorCategory" AS ENUM ('CATERING', 'DJ', 'FOTOGRAFIA', 'FLORES', 'SALON', 'MOBILIARIO', 'OTRO');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('COTIZADO', 'CONTRATADO', 'PAGADO');

-- CreateEnum
CREATE TYPE "MenuCourse" AS ENUM ('ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA');

-- CreateEnum
CREATE TYPE "MusicStatus" AS ENUM ('PENDIENTE', 'CONFIRMADA');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "hostName" TEXT,
    "totalBudget" DECIMAL(65,30),
    "djNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" TEXT,
    "companions" INTEGER NOT NULL DEFAULT 0,
    "phone" TEXT,
    "email" TEXT,
    "invitationStatus" "InvitationStatus" NOT NULL DEFAULT 'NO_ENVIADA',
    "notes" TEXT,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkInTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "category" "VendorCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "serviceDescription" TEXT,
    "cost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "depositPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "costPerPerson" DECIMAL(65,30),
    "status" "VendorStatus" NOT NULL DEFAULT 'COTIZADO',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "course" "MenuCourse" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isVegetarian" BOOLEAN NOT NULL DEFAULT false,
    "isKidsOption" BOOLEAN NOT NULL DEFAULT false,
    "vendorId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleItem" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "activity" TEXT NOT NULL,
    "responsible" TEXT,
    "durationMinutes" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "MusicItem" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "moment" TEXT NOT NULL,
    "songName" TEXT NOT NULL,
    "artist" TEXT,
    "time" TIMESTAMP(3),
    "status" "MusicStatus" NOT NULL DEFAULT 'PENDIENTE',
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_date_idx" ON "Event"("date");

-- CreateIndex
CREATE INDEX "Guest_eventId_idx" ON "Guest"("eventId");

-- CreateIndex
CREATE INDEX "Guest_eventId_invitationStatus_idx" ON "Guest"("eventId", "invitationStatus");

-- CreateIndex
CREATE INDEX "Guest_eventId_checkedIn_idx" ON "Guest"("eventId", "checkedIn");

-- CreateIndex
CREATE INDEX "Vendor_eventId_idx" ON "Vendor"("eventId");

-- CreateIndex
CREATE INDEX "Vendor_eventId_category_idx" ON "Vendor"("eventId", "category");

-- CreateIndex
CREATE INDEX "MenuItem_eventId_idx" ON "MenuItem"("eventId");

-- CreateIndex
CREATE INDEX "MenuItem_eventId_course_idx" ON "MenuItem"("eventId", "course");

-- CreateIndex
CREATE INDEX "ScheduleItem_eventId_idx" ON "ScheduleItem"("eventId");

-- CreateIndex
CREATE INDEX "ScheduleItem_eventId_order_idx" ON "ScheduleItem"("eventId", "order");

-- CreateIndex
CREATE INDEX "InventoryItem_eventId_idx" ON "InventoryItem"("eventId");

-- CreateIndex
CREATE INDEX "InventoryItem_eventId_sold_idx" ON "InventoryItem"("eventId", "sold");

-- CreateIndex
CREATE INDEX "InventoryItem_eventId_sellerName_idx" ON "InventoryItem"("eventId", "sellerName");

-- CreateIndex
CREATE INDEX "MusicItem_eventId_idx" ON "MusicItem"("eventId");

-- CreateIndex
CREATE INDEX "MusicItem_eventId_order_idx" ON "MusicItem"("eventId", "order");

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleItem" ADD CONSTRAINT "ScheduleItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicItem" ADD CONSTRAINT "MusicItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
