# Demonstração de Dados Viciados

Uma aplicação web interativa para demonstrar conceitos de inferência estatística usando dados viciados e não viciados. Desenvolvida em SvelteKit para uso educacional em visitações públicas.

## Características

- **Interface Interativa**: Registro manual de jogadas através de d-pad numérico
- **Simulação Automatizada**: Botões para simular 10, 25 ou quantidade personalizada de jogadas
- **Visualização em Tempo Real**: Histogramas que mostram a distribuição empírica com linha de referência 1/6
- **Análise Bayesiana**: Tela dedicada com ajuste de prior, cálculo de posterior, estimadores de Bayes e MAP
- **Formulação Matemática**: Equações LaTeX renderizadas com MathJax
- **Design Responsivo**: Interface limpa e moderna otimizada para uso em desktop

## Funcionalidades

### Tela Principal
- Duas seções: dado não viciado (laranja) e dado viciado (azul)
- D-pad para registro manual de jogadas (faces 1-6)
- Histogramas com linha tracejada indicando probabilidade 1/6
- Botões de simulação com animação de convergência
- Função de limpeza para resetar dados

### Análise Bayesiana
- Configuração interativa de distribuição prior (Dirichlet)
- Visualização simultânea de prior, posterior, empírica e estimadores
- Tabela com resultados numéricos detalhados
- Formulação matemática completa do modelo Multinomial-Dirichlet

## Tecnologias

- **Frontend**: SvelteKit + TypeScript
- **Visualização**: D3.js
- **Matemática**: MathJax para renderização LaTeX
- **Containerização**: Docker + Docker Compose

## Execução

### Desenvolvimento
```bash
npm install
npm run dev
```

### Produção com Docker
```bash
# Construir e executar
docker-compose up --build

# Ou usando Docker diretamente
docker build -t biased-dice-demo .
docker run -p 3000:3000 biased-dice-demo
```

### Deployment Local
```bash
npm run build
npm run preview
```

A aplicação estará disponível em http://localhost:3000

## Configuração

### Cores dos Dados
As cores dos dados podem ser alteradas modificando o arquivo `src/lib/stores.ts`:

```typescript
export const diceColors = writable({
    biased: '#3498db',     // Azul (padrão)
    unbiased: '#e67e22'    // Laranja (padrão)
});
```

### Viés do Dado
O comportamento do dado viciado pode ser ajustado em `src/lib/diceUtils.ts`:

```typescript
// Probabilidades para faces 1-6 do dado viciado
const weights = [0.05, 0.05, 0.1, 0.15, 0.25, 0.4];
```

## Estrutura do Projeto

```
src/
├── routes/
│   └── +page.svelte          # Página principal
├── lib/
│   ├── DiceSection.svelte    # Componente de seção do dado
│   ├── Histogram.svelte      # Componente do histograma
│   ├── BayesianAnalysis.svelte # Tela de análise bayesiana
│   ├── stores.ts             # Estados globais (Svelte stores)
│   └── diceUtils.ts          # Utilitários matemáticos
└── app.html                  # Template HTML base
```

## Uso Educacional

Esta aplicação foi projetada para:
- Demonstrações interativas em visitações públicas
- Ensino de conceitos de probabilidade e estatística
- Visualização da convergência de frequências para probabilidades
- Introdução à inferência bayesiana
- Comparação entre estimadores frequentistas e bayesianos

## Licença

Este projeto é de código aberto e pode ser usado livremente para fins educacionais.
