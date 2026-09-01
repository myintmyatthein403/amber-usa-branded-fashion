import { Prisma } from '@prisma/client';

// Keeps MediaUsage (Product/Variant -> Media) in sync with whatever URLs are
// currently in a product/variant's `images` array. Product.images/
// Variant.images stay plain string arrays (too many other call sites
// already assume that shape) — this only tracks which of those strings
// happen to match an uploaded Media row's url, so a future "can I delete
// this Media asset" check has something to look at instead of guessing.
// URLs that don't match any Media row (the free-text external-URL path,
// e.g. EditorialImagery's paste-a-URL input) are silently skipped, same as
// they always have been — this is additive tracking, not enforcement.
export async function reconcileMediaUsage(
  tx: Prisma.TransactionClient,
  target: { productId: string; variantId?: undefined } | { productId?: undefined; variantId: string },
  imageUrls: string[] | undefined,
): Promise<void> {
  const urls = imageUrls ?? [];

  if (urls.length === 0) {
    await tx.mediaUsage.deleteMany({ where: target });
    return;
  }

  const mediaRows = await tx.media.findMany({
    where: { url: { in: urls } },
    select: { id: true },
  });
  const mediaIds = mediaRows.map((m) => m.id);

  await tx.mediaUsage.deleteMany({
    where: {
      ...target,
      ...(mediaIds.length ? { mediaId: { notIn: mediaIds } } : {}),
    },
  });

  if (mediaIds.length === 0) return;

  const existing = await tx.mediaUsage.findMany({
    where: { ...target, mediaId: { in: mediaIds } },
    select: { mediaId: true },
  });
  const existingIds = new Set(existing.map((e) => e.mediaId));
  const toCreate = mediaIds.filter((id) => !existingIds.has(id));

  if (toCreate.length) {
    await tx.mediaUsage.createMany({
      data: toCreate.map((mediaId) => ({ mediaId, ...target })),
    });
  }
}
