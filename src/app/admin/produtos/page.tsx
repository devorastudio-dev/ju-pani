import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/sections/section-header";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminProductsClient } from "@/components/admin/admin-products-client";
import { AdminNav } from "@/components/admin/admin-nav";
import { isAdminFromCookies } from "@/lib/admin";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Admin · Produtos",
  description: "Gestão básica de produtos Ju.pani.",
};

export const dynamic = "force-dynamic";

const ADMIN_PAGE_SIZE = 10;

export default async function AdminProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
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

  const resolvedParams = await searchParams;
  const getParam = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;
  const page = Math.max(1, Number(getParam(resolvedParams.page) ?? 1) || 1);
  const query = getParam(resolvedParams.q) ?? "";
  const category = getParam(resolvedParams.category) ?? "all";
  const { items, totalPages, total } = await getProducts({
    page,
    query,
    category,
    includeInactive: true,
    pageSize: ADMIN_PAGE_SIZE,
  });

  return (
    <div className="pb-20 pt-10">
      <Container className="space-y-6">
        <SectionHeader
          title="Admin · Produtos"
          subtitle="Crie, edite ou ative/desative itens do catálogo."
        />
        <AdminNav current="produtos" />
        <AdminProductsClient
          initialProducts={items}
          initialQuery={query}
          initialCategory={category}
          initialPage={page}
          initialTotalPages={totalPages}
          initialTotal={total}
        />
      </Container>
    </div>
  );
}
