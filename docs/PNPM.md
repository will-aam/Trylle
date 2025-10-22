# Comandos pnpm usados no projeto

Este documento registra os comandos `pnpm` essenciais para construir e manter o projeto Trylle, organizados por finalidade.

## Comandos Principais do Projeto

Comandos básicos para o ciclo de vida do desenvolvimento.

1.  **`pnpm install`**

    - _O que faz:_ Lê o arquivo `package.json` e instala todas as dependências listadas no `pnpm-lock.yaml`. Este é o primeiro comando que você roda ao clonar o projeto.

2.  **`pnpm run dev`**

    - _O que faz:_ Inicia o servidor de desenvolvimento do Next.js. Usado para rodar o site localmente (geralmente em `http://localhost:3000`) e ver as alterações em tempo real.

3.  **`pnpm run build`**
    - _O que faz:_ Cria a versão de produção otimizada do site. A Vercel executa este comando automaticamente no deploy.

---

## Gerenciamento de Dependências (pnpm add)

Comandos usados para adicionar novas bibliotecas ao projeto.

### Supabase (Autenticação e Banco de Dados)

- **`pnpm add @supabase/supabase-js`**
  - _O que faz:_ Biblioteca principal do Supabase para comunicação com o banco de dados (buscar, inserir, deletar dados, etc.).
- **`pnpm add @supabase/ssr`**
  - _O que faz:_ Biblioteca moderna do Supabase para autenticação segura no lado do servidor (Server-Side Rendering), usada no `middleware.ts` e na rota de `callback`.
- **`pnpm add @supabase/auth-ui-shared`**
  - _O que faz:_ Adiciona temas visuais (ex: `ThemeSupa`) para o componente de autenticação do Supabase.

### Cloudflare R2 (Armazenamento de Arquivos)

- **`pnpm add @aws-sdk/client-s3`**
  - _O que faz:_ Adiciona o SDK da Amazon S3. Usado para comunicação com o Cloudflare R2, que é compatível com a API do S3 (upload, delete, etc.).

### Gerenciamento de Estado

- **`pnpm add zustand`**
  - _O que faz:_ Biblioteca Zustand para gerenciamento de estado global (ex: `usePlayer` store).

### Editor de Texto (TipTap) e Markdown

- **`pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-markdown @tiptap/extension-heading @tiptap/core`**
  - _O que faz:_ Instala o ecossistema TipTap para o editor de texto rico (`RichTextEditor.tsx`).
- **`pnpm add react-markdown`**
  - _O que faz:_ Instala o renderizador de Markdown (usado para exibir o conteúdo do TipTap).
- **`pnpm add -D @tailwindcss/typography`**
  - _O que faz:_ Instala o plugin de tipografia do Tailwind (`prose`) para estilizar o HTML gerado pelo `react-markdown`. (Note o `-D` para salvar como dependência de desenvolvimento).

### Formulários, Tabelas e Virtualização

- **`pnpm add @hookform/resolvers`**
  - _O que faz:_ Adiciona o "resolver" para integrar o React Hook Form com schemas Zod.
- **`pnpm add @tanstack/react-table`**
  - _O que faz:_ Instala o TanStack Table (React Table) para criar as tabelas de dados no painel admin.
- **`pnpm add @tanstack/react-virtual`**
  - _O que faz:_ Instala o TanStack Virtual para virtualização de listas (carregar apenas itens visíveis na tela, melhorando a performance).

### Utilitários e Ícones

- **`pnpm add lucide-react@latest`**
  - _O que faz:_ Instala a biblioteca de ícones Lucide React.
- **`pnpm add pdfjs-dist`**
  - _O que faz:_ Instala a biblioteca principal para manipulação de PDFs (usada na `documentActions.ts` para extrair o número de páginas).

---

## Comandos ShadCN/UI

Comandos usados para adicionar novos componentes do `ShadCN/UI` ao projeto.

- **`pnpm dlx shadcn@latest add <nome-do-componente>`**
  - _O que faz:_ Comando padrão para adicionar novos componentes da UI, como `tabs`, `separator`, `dialog`, etc.
  - _Exemplo antigo (guardado como referência): `pnpm dlx shadcn-ui@latest add tabs`_

---

## Comandos Obsoletos (Não Usar Mais)

Bibliotecas que foram usadas no passado mas substituídas por soluções mais novas (como o `@supabase/ssr`).

- **`pnpm add @supabase/auth-helpers-nextjs @supabase/auth-ui-react`**
  - _Status:_ **Obsoleto.** Substituído pela stack `@supabase/ssr`.
