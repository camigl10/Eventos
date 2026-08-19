import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
    select: { photoData: true, photoMime: true },
  });

  if (!item || !item.photoData || !item.photoMime) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(new Uint8Array(item.photoData), {
    headers: {
      "Content-Type": item.photoMime,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
