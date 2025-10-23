# Documentação: postcss.config.mjs

Este é o arquivo é uma ferramenta de build que usa plugins JavaScript para transformar e processar o código CSS.

Ele é como o "motor" que roda por baixo dos panos para fazer o Tailwind CSS funcionar.

## Configuração de Plugins

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};
```
