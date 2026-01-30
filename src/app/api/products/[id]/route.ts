import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  price: z.number().int().positive().optional(),
  category: z.string().min(2).optional(),
  images: z.array(z.string()).optional(),
  ingredients: z.string().optional(),
  calories: z.number().int().nullable().optional(),
  prepTimeMinutes: z.number().int().nullable().optional(),
  yieldInfo: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  popularityScore: z.number().int().optional(),
  active: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { prisma } = await import("@/lib/db");
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
  });
  if (!product) {
    return NextResponse.json(
      {
        ok: false,
        error: "Produto não encontrado.",
        message: "Produto não encontrado.",
      },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true, product });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/db");
    const resolvedParams = await params;
    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { ok: false, error: "Não autorizado.", message: "Não autorizado." },
        { status: 401 }
      );
    }

    const payload = updateSchema.parse(await request.json());
    const product = await prisma.product.update({
      where: { id: resolvedParams.id },
      data: payload,
    });
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Erro ao atualizar.",
        message: error instanceof Error ? error.message : "Erro ao atualizar.",
      },
      { status: 400 }
    );
  }
}
