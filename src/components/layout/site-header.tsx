"use client";

import Link from "next/link";
import { Container } from "@/components/layout/container";
import { CartIndicator } from "@/components/cart/cart-indicator";
import Image from "next/image";
import logoImg from "../../../public/images/logo.png";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pedidos", label: "Pedidos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/endereco", label: "Endereço" },
];

export const SiteHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#3a231c]">
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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-[#3a231c]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-black/5 md:hidden">
            <nav className="flex flex-col py-4 px-4 gap-4 text-sm font-medium text-[#3a231c]">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition hover:text-[#d37d64] py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/carrinho"
                className="relative rounded-full border border-[#f1d0c7] px-4 py-2 text-sm font-semibold text-[#7b3b30] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#fdf3ee] self-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                Carrinho
                <CartIndicator />
              </Link>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
};
