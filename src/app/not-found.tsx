import { Container } from "@/components/layout/container";
import { LinkButton } from "@/components/ui/link-button";

export default function NotFound() {
  return (
    <div className="pb-20 pt-16">
      <Container className="text-center">
        <h1 className="font-display text-4xl text-[#3a231c]">
          Página não encontrada
        </h1>
        <p className="mt-3 text-sm text-[#7b3b30]">
          Não encontramos o conteúdo que você procura.
        </p>
        <LinkButton href="/pedidos" className="mt-6">
          Voltar ao catálogo
        </LinkButton>
      </Container>
    </div>
  );
}
