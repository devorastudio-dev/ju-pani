import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/cart-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ju.pani | Confeitaria artesanal",
    template: "%s | Ju.pani",
  },
  description:
    "Confeitaria artesanal com bolos, doces e tortas feitos à mão. Monte seu pedido e finalize no WhatsApp.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://jupani.local"
  ),
  openGraph: {
    title: "Ju.pani | Confeitaria artesanal",
    description:
      "Catálogo completo de bolos, doces e tortas com checkout direto no WhatsApp.",
    url: "/",
    siteName: "Ju.pani",
    images: ["/og-cover.svg"],
    type: "website",
    locale: "pt_BR",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${manrope.variable} ${playfair.variable} min-h-screen antialiased`}
      >
        <CartProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
