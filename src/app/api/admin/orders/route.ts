import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const querySchema = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

const toDayStart = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setHours(0, 0, 0, 0);
  return date;
};

const toDayEnd = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setHours(23, 59, 59, 999);
  return date;
};

export async function GET(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { ok: false, error: "NÃ£o autorizado." },
        { status: 401 }
      );
    }

    const { prisma } = await import("@/lib/db");
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = querySchema.parse(params);

    const now = new Date();
    const defaultStart = new Date(now);
    defaultStart.setDate(defaultStart.getDate() - 6);
    defaultStart.setHours(0, 0, 0, 0);
    const defaultEnd = new Date(now);
    defaultEnd.setHours(23, 59, 59, 999);

    const startDate = query.start ? toDayStart(query.start) : defaultStart;
    const endDate = query.end ? toDayEnd(query.end) : defaultEnd;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { ok: false, error: "Datas invÃ¡lidas para o perÃ­odo." },
        { status: 400 }
      );
    }

    const page = query.page ? Math.max(1, Number(query.page)) : 1;
    const pageSize = query.pageSize
      ? Math.min(50, Math.max(1, Number(query.pageSize)))
      : 20;

    const whereClause = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    const [orders, totalOrders, revenue, statusCounts] = await prisma.$transaction([
      prisma.order.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: pageSize,
        skip: (page - 1) * pageSize,
        select: {
          id: true,
          createdAt: true,
          customerName: true,
          total: true,
          status: true,
        },
      }),
      prisma.order.count({ where: whereClause }),
      prisma.order.aggregate({
        where: whereClause,
        _sum: { total: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        orderBy: { status: "asc" },
        where: whereClause,
        _count: { _all: true },
      }),
    ]);

    const byStatus = {
      PENDING: 0,
      CONFIRMED: 0,
      CANCELLED: 0,
    } as Record<"PENDING" | "CONFIRMED" | "CANCELLED", number>;

    statusCounts.forEach((item) => {
      const count =
        typeof item._count === "object" && item._count !== null
          ? item._count._all ?? 0
          : 0;
      byStatus[item.status] = count;
    });

    return NextResponse.json({
      ok: true,
      orders,
      summary: {
        totalRevenue: revenue._sum.total ?? 0,
        totalOrders,
        byStatus,
      },
      pagination: {
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(totalOrders / pageSize)),
      },
    });
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Erro ao carregar pedidos.",
      },
      { status: 400 }
    );
  }
}
