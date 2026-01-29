import Image from "next/image";
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/sections/section-header";
import { ProductCarousel } from "@/components/products/product-carousel";
import { ProductCard } from "@/components/products/product-card";
import { LinkButton } from "@/components/ui/link-button";
import { getFavoriteProducts, getFeaturedProducts, getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Bolos, doces e tortas artesanais. Confira os destaques da semana e finalize seu pedido no WhatsApp.",
  openGraph: {
    title: "Ju.pani | Confeitaria artesanal",
    description:
      "Bolos, doces e tortas artesanais. Confira os destaques da semana e finalize seu pedido no WhatsApp.",
    url: "/",
  },
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featured, favorites, latest] = await Promise.all([
    getFeaturedProducts(),
    getFavoriteProducts(),
    getProducts({ pageSize: 6 }),
  ]);

  return (
    <div className="space-y-20 pb-20">
      <section className="relative overflow-hidden pt-10">
        <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-[#f5c2b0] opacity-40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-[#f7e0d6] opacity-70 blur-3xl" />
        <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6 animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#d59a73]">
              Confeitaria artesanal
            </p>
            <h1 className="font-display text-4xl leading-tight text-[#3a231c] md:text-5xl">
              Doces com memória afetiva, feitos para celebrar cada detalhe.
            </h1>
            <p className="text-base text-[#7b3b30]">
              Na Ju.pani, cada receita é criada à mão com ingredientes frescos,
              texturas delicadas e combinações que aquecem o coração.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/pedidos">Fazer pedido</LinkButton>
              <LinkButton href="/sobre" variant="secondary">
                Conhecer história
              </LinkButton>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: "Receitas autorais", value: "15+" },
                { label: "Pedidos mensais", value: "25+" },
                { label: "Avaliações 5★", value: "98%" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-white/80 px-4 py-3 text-center shadow-soft"
                >
                  <p className="text-lg font-semibold text-[#3a231c]">
                    {item.value}
                  </p>
                  <p className="text-xs text-[#7b3b30]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative animate-fade-in">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full border border-dashed border-[#f0bfae]" />
            <div className="rounded-[48px] bg-white p-4 shadow-soft">
              <Image
                src="/images/hero-cake.svg"
                alt="Mesa de doces Ju.pani"
                width={520}
                height={520}
                priority
                className="h-auto w-full rounded-[40px]"
              />
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="space-y-6">
          <SectionHeader
            title="Destaques da semana"
            subtitle="Seleção especial com os sabores mais pedidos."
          />
          <ProductCarousel products={featured} />
        </Container>
      </section>

      <section>
        <Container className="space-y-6">
          <SectionHeader
            title="Favoritos da casa"
            subtitle="Receitas queridinhas que fazem sucesso em toda comemoração."
          />
          <ProductCarousel products={favorites} />
        </Container>
      </section>

      <section>
        <Container className="space-y-6">
          <SectionHeader
            title="Para começar agora"
            subtitle="Monte seu carrinho com doces artesanais prontos para encantar."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latest.items.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
