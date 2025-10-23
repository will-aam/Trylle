# Documentação: A Pasta `src/app/(main)` (Grupo de Rota)

Esta pasta é um conceito-chave da arquitetura do projeto, baseado no recurso **Route Group (Grupo de Rota)** do Next.js.

## 1. Definição

A pasta `(main)` não é uma rota pública. O nome está entre parênteses `()` para instruir o Next.js a **ignorar o nome da pasta na URL final**.

Dessa forma, a estrutura de rotas é mapeada da seguinte maneira:

- `src/app/(main)/page.tsx` -> Rota **`/`** (Homepage)
- `src/app/(main)/achievements/page.tsx` -> Rota **`/achievements`**
- `src/app/(main)/Schedule/page.tsx` -> Rota **`/Schedule`**

## 2. Propósito Arquitetural

A função primária deste Grupo de Rota é aplicar um layout compartilhado (definido em `src/app/(main)/layout.tsx`) a um conjunto específico de páginas.

No projeto Trylle, `(main)` agrupa todas as páginas que fazem parte da **"aplicação principal"** — as telas centrais de interação do usuário.

Todas as rotas definidas dentro de `(main)` irão, automaticamente, herdar e ser renderizadas dentro do layout `src/app/(main)/layout.tsx`. Este layout contém:

- O componente `BottomNavbar` (barra de navegação inferior).
- A lógica `useEffect` responsável por buscar e definir o avatar do usuário.
- Futuramente, o `Sidebar` e o `Player` global da aplicação.

## 3. Estrutura de Rotas (Layouts Separados)

Esta arquitetura permite um controle granular sobre quais seções da aplicação recebem qual layout.

### Rotas DENTRO de `(main)`

_(Utilizam o layout principal da aplicação: `(main)/layout.tsx`)_

- `/` (homepage)
- `/achievements` (conquistas)
- `/Schedule` (programação)
- `/suggest-topic-in` (futura página de sugestão para usuários logados)

### Rotas FORA de `(main)`

_(Utilizam o layout raiz ou um layout próprio, mas não `(main)/layout.tsx`)_

- **`src/app/admin/`**
  - **Rota:** `/admin`
  - **Motivo:** O painel de administração possui seu próprio layout (`admin/layout.tsx`), que é distinto do layout da aplicação principal.
- **`src/app/auth/`**
  - **Rota:** `/auth`
  - **Motivo:** A página de autenticação não deve conter os elementos de navegação da aplicação (como a `BottomNavbar`).
- **`src/app/privacy-policy/` (e `terms-of-service`, `technologies`, etc.)**
  - **Rota:** `/privacy-policy`
  - **Motivo:** São páginas institucionais estáticas que utilizam apenas o layout raiz (`src/app/layout.tsx`).
- **`src/app/suggest-topic/`**
  - **Rota:** `/suggest-topic`
  - **Motivo (Fase Beta):** Está posicionada fora do layout principal para permitir que _qualquer visitante_ (logado ou não) envie sugestões.
