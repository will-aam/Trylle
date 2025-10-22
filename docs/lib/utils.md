# Documentação: src/lib/utils.ts

Este arquivo é um utilitário central para o nosso _design system_ baseado em ShadCN/UI e Tailwind CSS.

## Função Principal: `cn`

A única função exportada, `cn` (abreviação de "class name"), é usada para **mesclar classes do Tailwind CSS de forma inteligente e resolver conflitos**.

### O Problema que Ela Resolve

Quando criamos componentes reutilizáveis (como `src/components/ui/button.tsx`), eles têm classes padrão (ex: `p-4`, `bg-primary`).

Se tentarmos sobrescrever essas classes ao usar o componente em uma página (ex: passando `className="p-6"`), teríamos um conflito no HTML:

<!-- <button class="p-4 bg-primary p-6">...</button> -->
