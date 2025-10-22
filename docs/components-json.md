# Documentação: components.json

Este arquivo é o **manual de configuração para a CLI do ShadCN/UI**.

Ele **não é lido pelo Next.js** ou pela nossa aplicação. Seu único propósito é dizer ao comando `pnpm dlx shadcn@latest add <componente>` como ele deve se comportar e onde ele deve instalar os arquivos dentro do nosso projeto.

Quando rodamos o comando, ele lê este arquivo para saber as "regras da casa".

## Configurações Principais

### 1. Estilo e Código (`style`, `rsc`, `tsx`)

Define o padrão visual e técnico dos componentes que serão gerados.

- **`"style": "new-york"`**: Define o tema visual que escolhemos.
- **`"rsc": true`**: Informa que nosso projeto é compatível com React Server Components (RSC).
- **`"tsx": true`**: Informa que usamos TypeScript (`.tsx`).

### 2. Configuração do Tailwind (`tailwind`)

Aponta para os arquivos de estilo do nosso projeto.

```json
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  }
```

**Obs: Não alterar este arquivo, especialmente a seção aliases, a menos que seja relevante fazer uma refatoração completa e mover as pastas principais (como src/lib ou src/components).**
