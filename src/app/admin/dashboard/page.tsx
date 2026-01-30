import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/sections/section-header";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
import { AdminNav } from "@/components/admin/admin-nav";
import { isAdminFromCookies } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin · Dashboard",
  description: "Resumo de vendas e pedidos Ju.pani.",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
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

  return (
    <div className="pb-20 pt-10">
      <Container className="space-y-6">
        <SectionHeader
          title="Admin · Dashboard"
          subtitle="Acompanhe pedidos, receita e status em tempo real."
        />
        <AdminNav current="dashboard" />
        <AdminDashboardClient />
      </Container>
    </div>
  );
}
