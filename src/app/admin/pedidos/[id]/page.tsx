import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/sections/section-header";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminNav } from "@/components/admin/admin-nav";
import { formatCurrency } from "@/lib/format";
import { isAdminFromCookies } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin Â· Pedido",
  description: "Detalhes do pedido Ju.pani.",
};

export const dynamic = "force-dynamic";

const formatDateTime = (value: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);

export default async function AdminPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const isAdmin = await isAdminFromCookies();

  if (!isAdmin) {
    return (
      <div className="pb-20 pt-10">
        <Container className="space-y-6">
          <SectionHeader
            title="Ãrea administrativa"
            subtitle="Protegida por senha do ambiente."
          />
          <AdminLogin />
        </Container>
      </div>
    );
  }

  const resolvedParams = await params;
  const { prisma } = await import("@/lib/db");
  const order = await prisma.order.findUnique({
    where: { id: resolvedParams.id },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="pb-20 pt-10">
      <Container className="space-y-6">
        <SectionHeader
          title={`Pedido #${order.id.slice(-6)}`}
          subtitle={`Criado em ${formatDateTime(order.createdAt)}`}
        />
        <AdminNav />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6 rounded-3xl bg-white p-6 shadow-soft">
            <div>
              <h3 className="font-display text-xl text-[#3a231c]">Cliente</h3>
              <p className="mt-2 text-sm text-[#3a231c]">{order.customerName}</p>
              <p className="text-sm text-[#7b3b30]">{order.customerPhone}</p>
            </div>
            <div>
              <h3 className="font-display text-xl text-[#3a231c]">EndereÃ§o</h3>
              <p className="mt-2 text-sm text-[#3a231c]">
                {order.addressStreet}, {order.addressNumber}
              </p>
              <p className="text-sm text-[#7b3b30]">
                {order.addressDistrict} - {order.addressCity} / {order.addressState}
              </p>
              <p className="text-sm text-[#7b3b30]">{order.addressZip}</p>
              {order.addressReference && (
                <p className="text-sm text-[#7b3b30]">
                  ReferÃªncia: {order.addressReference}
                </p>
              )}
            </div>
            {order.notes && (
              <div>
                <h3 className="font-display text-xl text-[#3a231c]">ObservaÃ§Ãµes</h3>
                <p className="mt-2 text-sm text-[#7b3b30]">{order.notes}</p>
              </div>
            )}
            <div>
              <h3 className="font-display text-xl text-[#3a231c]">Itens</h3>
              <div className="mt-3 space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between rounded-2xl border border-[#f3d6cc] bg-[#fff8f3] p-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-[#3a231c]">
                        {item.quantity}x {item.productSnapshotName}
                      </p>
                      {item.itemNotes && (
                        <p className="text-xs text-[#7b3b30]">
                          Obs: {item.itemNotes}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-[#3a231c]">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-fit rounded-3xl bg-white p-6 shadow-soft">
            <h3 className="font-display text-xl text-[#3a231c]">Resumo</h3>
            <div className="mt-4 space-y-2 text-sm text-[#3a231c]">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span className="font-semibold">{order.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pagamento</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Frete</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
