import "server-only";

const getPrisma = async () => (await import("@/lib/db")).prisma;

export const PRODUCT_PAGE_SIZE = 9;

export type ProductFilters = {
  query?: string;
  category?: string;
  featured?: boolean;
  favorite?: boolean;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};

export const getFeaturedProducts = async () => {
  const prisma = await getPrisma();
  return prisma.product.findMany({
    where: { active: true, isFeatured: true },
    orderBy: [{ popularityScore: "desc" }, { createdAt: "desc" }],
    take: 8,
  });
};

export const getFavoriteProducts = async () => {
  const prisma = await getPrisma();
  return prisma.product.findMany({
    where: { active: true, isFavorite: true },
    orderBy: [{ popularityScore: "desc" }, { createdAt: "desc" }],
    take: 8,
  });
};

export const getProductBySlug = async (slug: string) => {
  const prisma = await getPrisma();
  return prisma.product.findFirst({
    where: { slug, active: true },
  });
};

export const getProducts = async ({
  query,
  category,
  featured,
  favorite,
  page = 1,
  pageSize = PRODUCT_PAGE_SIZE,
  includeInactive = false,
}: ProductFilters) => {
  const prisma = await getPrisma();
  const whereClause: Record<string, unknown> = {
    ...(includeInactive ? {} : { active: true }),
  };

  if (category && category !== "all") {
    whereClause.category = category;
  }

  if (featured) {
    whereClause.isFeatured = true;
  }

  if (favorite) {
    whereClause.isFavorite = true;
  }

  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { category: { contains: query, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      orderBy: [{ popularityScore: "desc" }, { createdAt: "desc" }],
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.product.count({ where: whereClause }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return { items, total, totalPages };
};
