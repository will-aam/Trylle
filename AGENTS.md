# Comandos pnpm usados no projeto

Este documento registra todos os comandos `pnpm` utilizados para construir e manter o projeto, organizados por finalidade.

## Comandos Principais do Projeto

Estes são os comandos que você mais usará no dia a dia.

1. **`pnpm install`**  
   _O que faz:_ Lê o arquivo `package.json` e instala todas as dependências necessárias para o projeto funcionar. Este é o primeiro comando que você roda em um projeto novo.

2. **`pnpm run dev`**  
   _O que faz:_ Inicia o servidor de desenvolvimento do Next.js. Usado para rodar o site localmente (geralmente em `http://localhost:3000`) e ver as alterações em tempo real.

3. **`pnpm run build`**  
   _O que faz:_ Cria a versão de produção otimizada do site. A Vercel executa este comando automaticamente no deploy.

---

## Comandos de Instalação de Pacotes

Estes comandos adicionam funcionalidades específicas ao projeto.

1. **`pnpm install @supabase/supabase-js`**  
   _O que faz:_ Instala a biblioteca principal do Supabase para comunicação com o banco de dados (buscar, inserir, deletar dados, etc.).

2. **`pnpm install @supabase/auth-helpers-nextjs @supabase/auth-ui-react`**  
   _O que faz:_ Instala pacotes auxiliares do Supabase para facilitar a autenticação (login, cadastro) em Next.js.

3. **`pnpm install @supabase/auth-ui-shared`**  
   _O que faz:_ Adiciona a biblioteca com temas visuais (`ThemeSupa`) para o componente de autenticação do Supabase.

4. **`pnpm install @supabase/ssr`**  
   _O que faz:_ Instala a biblioteca moderna do Supabase para autenticação segura no lado do servidor (Server-Side Rendering), usada no `middleware.ts` e na rota de `callback`.

5. **`pnpm install @aws-sdk/client-s3`**  
   _O que faz:_ Adiciona o SDK da Amazon S3. Usado para comunicação com o Cloudflare R2, que é compatível com a API do S3.

6. **`pnpm install lucide-react@latest`**  
   _O que faz:_ Instala a biblioteca de ícones Lucide React na versão mais recente.

7. **`pnpm install zustand`**  
   _O que faz:_ Instala a biblioteca Zustand para gerenciamento de estado.

---
