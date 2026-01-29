import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/sections/section-header";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminProductsClient } from "@/components/admin/admin-products-client";
import { isAdminFromCookies } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin · Produtos",
  description: "Gestão básica de produtos Ju.pani.",
};

export const dynamic = "force-dynamic";

export default async function AdminProdutosPage() {
  const isAdmin = await isAdminFromCookies();

  if (!isAdmin) {
    return (
      <div className="pb-20 pt-10">
        <Container className="space-y-6">
          <SectionHeader
            title="Área administrativa"
            subtitle="Protegida por senha do ambiente."
          />
          <AdminLogin />
        </Container>
      </div>
    );
  }

  const { prisma } = await import("@/lib/db");
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="pb-20 pt-10">
      <Container className="space-y-6">
        <SectionHeader
          title="Admin · Produtos"
          subtitle="Crie, edite ou ative/desative itens do catálogo."
        />
        <AdminProductsClient initialProducts={products} />
      </Container>
    </div>
  );
}
