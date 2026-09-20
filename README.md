# Ponto das Ofertas

Sistema web full-stack de gestão de comércio (ponto de ofertas): catálogo de produtos, fornecedores, vendas, movimentação de estoque, relatórios e multi-loja.

> Status: projeto em desenvolvimento ativo. Configurado para deploy em Vercel (`vercel.json`), mas sem evidência de ambiente publicado — `NÃO CONFIRMADO`.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 3.4 |
| ORM / Banco | Prisma 5, PostgreSQL (`prisma/schema.prisma`, migrations + seed) |
| Autenticação | NextAuth **5.0.0-beta** (`next-auth@5.0.0-beta.31`) + bcryptjs |
| Dados / UI | TanStack Query, React Query, Axios, Zod, recharts, framer-motion, @hello-pangea/dnd |
| Internacionalização | next-intl (página de login/registro multi-locale, padrão `pt`) |

> **Nota:** `next-auth` está em versão beta (5.0.0-beta.31) — comportamento pode mudar (`PARCIAL`/`EXPERIMENTAL`).

## Modelo de dados (Prisma)

O schema define **7 modelos**: `User`, `Category`, `Supplier`, `Product`, `Sale`, `Store`, `Movement` — cobrindo catálogo, compra, venda e estoque, com suporte a múltiplas lojas (`Store`).

## Funcionalidades principais

- Autenticação completa: login, registro, recuperação/reset de senha, troca de senha e perfil (`api/auth/*`).
- Dashboard com estatísticas de vendas e alertas de estoque baixo (`api/sales/stats`, `api/products/low-stock`).
- Catálogo: produtos, categorias e fornecedores com CRUD completo.
- Vendas (checkout) e movimentações de estoque.
- Relatórios, upload de arquivos e configurações da loja.
- Onboarding e página de planos.

## Padrão de rotas

- Área pública: `/[locale]/(auth)` — `login`, `register`, `forgot-password`, `reset-password`.
- Área do dashboard: `/[locale]/(dashboard)` — `dashboard`, `produtos`, `categorias`, `fornecedores`, `vendas`, `movimentos`, `relatorios`, `menu`, `checkout`, `planos`, `configuracoes`, `onboarding`, `termos`.

## Como rodar localmente

Pré-requisito: Node.js + PostgreSQL.

```bash
npm install        # postinstall roda `prisma generate`
cp .env.example .env
npm run db:migrate # prisma migrate deploy
npm run db:seed    # opcional — dados iniciais
npm run dev        # servidor de desenvolvimento
```

Outros scripts: `build`, `start`, `lint`.

## Variáveis de ambiente

Veja `.env.example`:

- `DATABASE_URL` — conexão PostgreSQL (obrigatório).
- `NEXTAUTH_URL` — URL base de autenticação.
- `NEXTAUTH_SECRET` — segredo de sessão do NextAuth.
- `NEXT_PUBLIC_DEFAULT_LOCALE` — locale padrão (`pt`).

## Estrutura

```
app/        # rotas do Next.js (páginas + API routes, com [locale])
components/
lib/        # utilitários e cliente Prisma
prisma/     # schema, migrations e seed
providers/  # providers (React Query, sessão, i18n)
messages/   # traduções (next-intl)
i18n/       # config de internacionalização
```

## Notas

- Testes automatizados: não localizados no repositório (`NÃO CONFIRMADO`).
- Deploy: `vercel.json` define `buildCommand: npx prisma migrate deploy && next build` — configurado para Vercel, mas sem evidência de publicação (`NÃO CONFIRMADO`).