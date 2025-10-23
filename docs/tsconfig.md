# Documentação: tsconfig.json

Este é o arquivo de configuração principal do **TypeScript**. Ele define como o compilador TypeScript (e o editor de código) deve analisar, verificar e entender o código-fonte.

Ele é o "cérebro" que controla as regras de tipo, a sintaxe e os caminhos de importação em todo o projeto.

## Seções Principais

### 1. `compilerOptions` (As Regras do Compilador)

Esta seção define as regras de como o TypeScript deve tratar o código.

- **`"strict": true`**: Esta é a regra de qualidade mais importante. Ela ativa o modo "rigoroso" do TypeScript, que força a declarar tipos corretamente e proíbe `any` implícito, tornando o código mais seguro e previsível.
- **`"noEmit": true`**: Configuração essencial para Next.js. Ela diz ao TypeScript para _apenas_ fazer a verificação de tipo e **não** gerar arquivos `.js`. O Next.js tem seu próprio processo de compilação otimizado.
- **`"jsx": "preserve"`**: Instrui o TypeScript a não transformar o JSX (ex: `<div>`). Ele o preserva para que o Next.js/React possa lidar com isso.
- **`"moduleResolution": "bundler"`**: Usa o método moderno para encontrar módulos, imitando como o Next.js (o _bundler_) faz.
- **`"plugins": [{"name": "next"}]`**: Carrega o plugin específico do Next.js para que o TypeScript entenda recursos do framework, como o App Router.

### 2. `paths` (Apelidos de Importação)

Esta é a configuração mais visível no dia-a-dia do desenvolvimento.

```json
  "paths": {
    "@/*": ["./*"]
  }
```
