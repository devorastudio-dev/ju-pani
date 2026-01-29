import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProducts } from "@/lib/products";
import { isAdminRequest } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const querySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  featured: z.string().optional(),
  favorite: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  includeInactive: z.string().optional(),
});

const createSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  price: z.number().int().positive(),
  category: z.string().min(2),
  images: z.array(z.string()).optional(),
  ingredients: z.string().optional(),
  calories: z.number().int().optional(),
  prepTimeMinutes: z.number().int().optional(),
  yieldInfo: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  popularityScore: z.number().int().optional(),
  active: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const query = querySchema.parse(params);

  const page = query.page ? Number(query.page) : 1;
  const pageSize = query.pageSize ? Number(query.pageSize) : undefined;
  const allowInactive = query.includeInactive === "1" && isAdminRequest(request);

  const { items, total, totalPages } = await getProducts({
    query: query.q,
    category: query.category,
    featured: query.featured === "1",
    favorite: query.favorite === "1",
    page,
    pageSize,
    includeInactive: allowInactive,
  });

  return NextResponse.json({ items, total, totalPages });
}

export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import("@/lib/db");
    if (!isAdminRequest(request)) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    const payload = createSchema.parse(await request.json());
    const product = await prisma.product.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        price: payload.price,
        category: payload.category,
        images: payload.images ?? ["/images/products/bolo-red-velvet.svg"],
        ingredients: payload.ingredients ?? "A definir",
        calories: payload.calories ?? null,
        prepTimeMinutes: payload.prepTimeMinutes ?? null,
        yieldInfo: payload.yieldInfo ?? "A definir",
        isFeatured: payload.isFeatured ?? false,
        isFavorite: payload.isFavorite ?? false,
        popularityScore: payload.popularityScore ?? 0,
        active: payload.active ?? true,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao criar." },
      { status: 400 }
    );
  }
}
