import Link from "next/link";
import { Container } from "@/components/layout/container";
import { CartIndicator } from "@/components/cart/cart-indicator";
import Image from "next/image";
import logoImg from "../../../public/images/logo.png";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pedidos", label: "Pedidos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/endereco", label: "Endereço" },
];

export const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur-md">
      <Container className="flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image 
          src={logoImg} 
          alt="Ju.pani logo" 
          width={64} 
          height={64}
          className="-my-2"
           />
          <span className="hidden text-sm text-[#7b3b30] md:inline">
            Confeitaria artesanal
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-[#3a231c]">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-[#d37d64]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/carrinho"
            className="relative rounded-full border border-[#f1d0c7] px-4 py-2 text-sm font-semibold text-[#7b3b30] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#fdf3ee]"
          >
            Carrinho
            <CartIndicator />
          </Link>
        </nav>
      </Container>
    </header>
  );
};
