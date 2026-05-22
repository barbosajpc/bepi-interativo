# Descrição do Projeto BEPI

## Visão Geral

O projeto `seplan-bepi-interative-supabase` é um dashboard interativo para visualização dos dados do SEPLAN Bepi. Ele oferece uma interface moderna para explorar informações de energia por grupo, subitem detalhado, ano e origem da energia. O foco está em apresentar dados de forma clara e permitir filtrar facilmente séries históricas do balanço energético.

## Objetivo

Criar uma aplicação web que conecte dados estruturados armazenados no Supabase com um frontend responsivo e acessível. A aplicação deve:

- apresentar a estrutura hierárquica de grupos e itens detalhados;
- permitir seleção de intervalo de anos com slider;
- filtrar por origem da energia;
- exibir gráficos e análises em tempo real;
- utilizar uma camada de backend leve para consultas SQL via Supabase Functions.

## Pilha Tecnológica

### Frontend

- **Vite**: bundler moderno e rápido para desenvolvimento e build.
- **React**: construção da interface de usuário.
- **TypeScript**: tipagem estática para maior segurança e manutenção.
- **Tailwind CSS**: estilização utilitária para layout e componentes.
- **shadcn-ui**: componentes acessíveis e reutilizáveis no frontend.
- **Recharts**: biblioteca de gráficos para visualização de dados.
- **@tanstack/react-query**: gerenciamento de dados remotos e cache.
- **React Router DOM**: dependência para roteamento, quando necessário.

### Backend / Infraestrutura

- **Supabase**: plataforma backend como serviço que oferece:
  - banco de dados PostgreSQL;
  - funções edge (Deno);
  - execução de consultas SQL via RPC.
- **Supabase Functions**: função `bepi-data` que processa ações como:
  - `get_structure` — retorna a hierarquia de grupos e detalhados;
  - `get_year_range` — retorna os anos mínimo e máximo disponíveis;
  - `get_data` — retorna os dados filtrados por grupo, detalhado e intervalo de anos.
- **Supabase Migrations**: gerencia o modelo de dados e a versão do banco.

### Utilitários e dependências auxiliares

- `clsx` e `tailwind-merge` para composição condicional de classes CSS.
- `zod` para validação e tipagens no frontend.
- `react-hook-form` e `@hookform/resolvers` para formulários mais complexos.
- `sonner` para notificações toast.
- `lucide-react` para ícones.
- `date-fns` para manipulação de datas.

## Estrutura do Projeto

- `src/pages/Index.tsx`: página principal que monta o layout do dashboard e coordena seleção de filtro, carregamento de dados e renderização.
- `src/components/`: componentes de UI reutilizáveis, como `BepiHeader`, `BepiSidebar`, `BepiChart`, `YearSlider` e `OrigemFilter`.
- `src/integrations/supabase/client.ts`: cliente Supabase configurado com variáveis de ambiente.
- `src/lib/bepi-api.ts`: camada de API que invoca a função Supabase `bepi-data` e agrupa a estrutura de navegação.
- `supabase/functions/bepi-data/index.ts`: função backend que executa SQL via RPC e responde com JSON.
- `supabase/migrations/`: scripts de migração do banco de dados.

## Fluxo de Dados e Processos

1. O frontend inicializa o dashboard e carrega a estrutura geral de `Grupo` e `Detalhado` usando `fetchStructure()`.
2. O usuário seleciona um grupo e um item detalhado no menu lateral.
3. A aplicação obtém o intervalo de anos disponível para a combinação selecionada com `fetchYearRange()`.
4. O usuário ajusta o slider de ano e escolhe origens de energia no filtro.
5. O dashboard chama `fetchChartData()` para recuperar os pontos de dados dentro do intervalo e exibir o gráfico.
6. As consultas SQL são executadas no Supabase via RPC `exec_sql`, garantindo que apenas dados relevantes sejam retornados.
7. A aplicação filtra localmente apenas as origens de energia selecionadas e exibe o gráfico atualizado.

## Configuração

O projeto requer variáveis de ambiente definidas no `.env` ou no ambiente de execução:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

O cliente Supabase é inicializado em `src/integrations/supabase/client.ts` e consome essas variáveis para autenticar as chamadas HTTP.

## Principais Benefícios do Projeto

- **Interatividade**: filtro por período e origem com resposta imediata.
- **Escalabilidade**: backend desacoplado usando Supabase Functions.
- **Manutenção**: uso de TypeScript e componentes reutilizáveis.
- **Visualização de dados**: gráfico e estrutura organizacional para facilitar análise.
- **Acessibilidade**: componentes shadcn-ui com boas práticas de UI.

## Observações

- A função `bepi-data` no Supabase é responsável por sanitizar strings antes das consultas SQL, reduzindo risco de injeção.
- A arquitetura permite evoluir o dashboard adicionando novos filtros, mais métricas ou visualizações sem alterar a base do backend.
- A interface está preparada para trabalhar com grandes conjuntos de dados através do cache e revalidação controlada do React Query.
