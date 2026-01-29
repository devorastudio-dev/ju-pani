# Ju.pani · Confeitaria artesanal

Site completo com catálogo, carrinho e checkout via WhatsApp, usando Next.js App Router + Prisma + PostgreSQL.

## Stack
- Next.js (App Router) + TypeScript
- PostgreSQL + Prisma
- Tailwind CSS (v4)
- Zod para validação

## Como rodar localmente
1. Instale dependências
   ```bash
   npm install
   ```
2. Configure o ambiente
   ```bash
   cp .env.example .env
   ```
   Edite o `.env` com sua URL do Postgres e numero do WhatsApp.
3. Rode as migrations e seed
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```
4. Suba o app
   ```bash
   npm run dev
   ```

## Scripts úteis
- `npm run dev` — ambiente local
- `npm run build` — build de produção
- `npm run start` — server de produção
- `npm run prisma:studio` — Prisma Studio

## Carrinho (abordagem escolhida)
O carrinho é armazenado server-side via cookie HTTP-only (`ju_cart`). Essa abordagem:
- preserva dados entre páginas sem depender de localStorage
- evita exposição do carrinho ao JavaScript do cliente
- facilita sincronizar dados no servidor (ex: criação do pedido)

O estado do carrinho é acessado e atualizado via `/api/cart`.

## Frete
O cálculo inicial é configurável em `src/lib/shipping.ts` usando uma tabela simples por cidade/bairro.
No checkout, a lógica já está isolada para ser substituída futuramente por uma API real (Correios/Mapas).

## Pedido via WhatsApp
O botão “Fazer pedido” cria um `Order` com status `PENDING`, gera a mensagem formatada e redireciona para:
```
https://wa.me/SEU_NUMERO?text=...
```
A formatação está em `src/lib/whatsapp.ts`.

## Admin básico
Rota: `/admin/produtos`
- Protegida por `ADMIN_PASSWORD` no `.env`
- CRUD básico com criação, edição e ativação/desativação

## Supabase (recomendado)
- Use `DATABASE_URL` com `sslmode=require`.
- Para migrations, use `DIRECT_URL` apontando para a porta 5432.

---
Feito para produção, com arquitetura em camadas (`db`, `services`, `ui`) e componentes reutilizáveis.
