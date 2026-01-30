"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

type OrderRow = {
  id: string;
  createdAt: string;
  customerName: string;
  total: number;
  status: OrderStatus;
};

type DashboardResponse = {
  ok: boolean;
  orders: OrderRow[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    byStatus: Record<OrderStatus, number>;
  };
};

const formatInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

const getRangeForPreset = (preset: string) => {
  const today = new Date();
  const end = new Date(today);
  const start = new Date(today);

  switch (preset) {
    case "today":
      break;
    case "7d":
      start.setDate(start.getDate() - 6);
      break;
    case "30d":
      start.setDate(start.getDate() - 29);
      break;
    case "month":
      start.setDate(1);
      break;
    default:
      break;
  }

  return {
    start: formatInputDate(start),
    end: formatInputDate(end),
  };
};

export const AdminDashboardClient = () => {
  const initialRange = useMemo(() => getRangeForPreset("7d"), []);
  const [preset, setPreset] = useState("7d");
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [summary, setSummary] = useState<DashboardResponse["summary"]>({
    totalRevenue: 0,
    totalOrders: 0,
    byStatus: { PENDING: 0, CONFIRMED: 0, CANCELLED: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preset === "custom") {
      return;
    }
    const range = getRangeForPreset(preset);
    setStartDate(range.start);
    setEndDate(range.end);
  }, [preset]);

  useEffect(() => {
    const controller = new AbortController();
    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("start", startDate);
        params.set("end", endDate);
        const response = await fetch(`/api/admin/orders?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as DashboardResponse;
        if (!response.ok || !data.ok) {
          throw new Error(
            (data as { error?: string }).error ?? "Erro ao carregar pedidos."
          );
        }
        setOrders(data.orders ?? []);
        setSummary(data.summary);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Erro ao carregar pedidos.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (startDate && endDate) {
      void loadOrders();
    }

    return () => controller.abort();
  }, [startDate, endDate]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="font-display text-2xl text-[#3a231c]">
          Dashboard de vendas
        </h2>
        <p className="mt-2 text-sm text-[#7b3b30]">
          Filtre o período para acompanhar receita, pedidos e status.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:items-end">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-[#7b3b30]">
              Período rápido
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { value: "today", label: "Hoje" },
                { value: "7d", label: "7 dias" },
                { value: "30d", label: "30 dias" },
                { value: "month", label: "Mês atual" },
                { value: "custom", label: "Personalizado" },
              ].map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={preset === option.value ? "primary" : "secondary"}
                  onClick={() => setPreset(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#7b3b30]">
              Início
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(event) => {
                setPreset("custom");
                setStartDate(event.target.value);
              }}
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm text-[#3a231c] shadow-sm focus:border-[#d59a73] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#7b3b30]">
              Fim
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(event) => {
                setPreset("custom");
                setEndDate(event.target.value);
              }}
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm text-[#3a231c] shadow-sm focus:border-[#d59a73] focus:outline-none"
            />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`summary-skeleton-${index}`}
              className="rounded-3xl bg-white p-6 shadow-soft"
            >
              <div className="h-4 w-24 animate-pulse rounded-full bg-[#f3d6cc]" />
              <div className="mt-4 h-8 w-32 animate-pulse rounded-full bg-[#f3d6cc]" />
            </div>
          ))
        ) : (
          <>
            <div className="rounded-3xl bg-white p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d59a73]">
                Receita total
              </p>
              <p className="mt-3 text-2xl font-semibold text-[#3a231c]">
                {formatCurrency(summary.totalRevenue)}
              </p>
              <p className="mt-1 text-xs text-[#7b3b30]">
                Período selecionado
              </p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d59a73]">
                Pedidos
              </p>
              <p className="mt-3 text-2xl font-semibold text-[#3a231c]">
                {summary.totalOrders}
              </p>
              <p className="mt-1 text-xs text-[#7b3b30]">
                Total de pedidos no período
              </p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d59a73]">
                Status
              </p>
              <div className="mt-3 space-y-2 text-sm text-[#3a231c]">
                {(["PENDING", "CONFIRMED", "CANCELLED"] as OrderStatus[]).map(
                  (status) => (
                    <div key={status} className="flex items-center justify-between">
                      <span>{status}</span>
                      <span className="font-semibold">{summary.byStatus[status]}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-xl text-[#3a231c]">
            Pedidos recentes
          </h3>
          <p className="text-xs text-[#7b3b30]">
            {loading ? "Carregando..." : `${orders.length} pedido(s)`}
          </p>
        </div>
        <div className="mt-4 space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`order-skeleton-${index}`}
                className="flex flex-col gap-3 rounded-2xl border border-[#f3d6cc] bg-[#fff8f3] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="h-4 w-40 animate-pulse rounded-full bg-[#f3d6cc]" />
                <div className="h-4 w-24 animate-pulse rounded-full bg-[#f3d6cc]" />
                <div className="h-4 w-16 animate-pulse rounded-full bg-[#f3d6cc]" />
              </div>
            ))
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#f3d6cc] bg-[#fff8f3] p-6 text-center">
              <p className="text-sm font-semibold text-[#3a231c]">
                Nenhum pedido no período.
              </p>
              <p className="mt-2 text-xs text-[#7b3b30]">
                Ajuste o filtro de datas para visualizar novos pedidos.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-3 rounded-2xl border border-[#f3d6cc] bg-[#fff8f3] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-[#3a231c]">
                    #{order.id.slice(-6)}
                  </p>
                  <p className="text-xs text-[#7b3b30]">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#3a231c]">{order.customerName}</p>
                  <p className="text-xs text-[#7b3b30]">{order.status}</p>
                </div>
                <div className="text-sm font-semibold text-[#3a231c]">
                  {formatCurrency(order.total)}
                </div>
                <Link
                  href={`/admin/pedidos/${order.id}`}
                  className="text-xs font-semibold text-[#7b3b30] transition hover:text-[#d37d64]"
                >
                  Ver detalhes
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
