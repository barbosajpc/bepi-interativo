# SEPLAN Bepi Interactive Dashboard

Este projeto é um dashboard interativo para visualização e análise de dados do SEPLAN Bepi.

Arquitetura atual: frontend em React (Vite/TypeScript) + backend Express (`bepi-backend`) que expõe uma API REST simples em `/bepi-data` para consultas ao banco PostgreSQL.

## Tecnologias Utilizadas

- **Vite**: Ferramenta de build rápida para desenvolvimento frontend.
- **TypeScript**: Superset do JavaScript com tipagem estática.
- **React**: Biblioteca para construção de interfaces de usuário.
- **shadcn-ui**: Componentes de UI reutilizáveis e acessíveis.
- **Tailwind CSS**: Framework CSS utilitário para estilização.
- **Express + PostgreSQL**: API backend em `bepi-backend` que substitui o uso direto de Supabase Functions.

## Instalação e Configuração

### Pré-requisitos

- Node.js & npm instalados. Recomendamos usar [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) para gerenciar versões do Node.js.

### Passos para Instalação

1. **Clone o repositório**:
   ```sh
   git clone <URL_DO_REPOSITORIO>
   ```

2. **Navegue para o diretório do projeto**:
   ```sh
   cd seplan-bepi-interative-supabase
   ```

3. **Instale as dependências**:
   ```sh
   npm install
   ```

4. **Configuração da API (Express backend)**:
   - O backend Express está em `bepi-backend/`.
   - Crie o arquivo `bepi-backend/.env` com as variáveis listadas abaixo.
   - O frontend comunica-se com o backend via `VITE_API_URL` (veja abaixo).

5. **Inicie o servidor de desenvolvimento**:
   ```sh
   npm run dev
   ```

O aplicativo estará disponível em `http://localhost:5173` (porta padrão do Vite).

## Estrutura do Projeto

- `src/components/`: Componentes React reutilizáveis, incluindo gráficos, filtros e UI.
- `src/pages/`: Páginas principais da aplicação.
- `src/integrations/supabase/`: (opcional) integração antiga com Supabase — atualmente o frontend consome a API Express em `bepi-backend`.
- `src/lib/`: Utilitários e APIs para dados do Bepi (contém `bepi-api.ts` que usa `VITE_API_URL`).
- `bepi-backend/`: Backend Express que atende `/bepi-data` e `/health`.

## Scripts Disponíveis (Frontend)

- `npm run dev`: Inicia o servidor de desenvolvimento (frontend).
- `npm run build`: Constrói o frontend para produção.
- `npm run preview`: Visualiza a build de produção localmente.
- `npm run test`: Executa os testes.

## Backend (`bepi-backend`) - Scripts

- `npm --prefix bepi-backend run dev`: Inicia o backend em modo desenvolvimento (usa `ts-node-dev`).
- `npm --prefix bepi-backend run build`: Compila TypeScript para `bepi-backend/dist`.
- `npm --prefix bepi-backend start`: Inicia o backend a partir de `dist`.

## Variáveis de Ambiente

Frontend (crie um arquivo `.env` na raiz do frontend ou exporte estas variáveis):

- `VITE_API_URL` — URL base da API (ex.: `http://localhost:3000`).

Backend (`bepi-backend/.env`):

- `PGHOST=seu-host.rds.amazonaws.com`
- `PGPORT=5432`
- `PGUSER=seu_usuario`
- `PGPASSWORD=sua_senha`
- `PGDATABASE=seu_banco`
- `PORT=3000`
- `ALLOWED_ORIGIN=http://localhost:5173`

## Execução Rápida (desenvolvimento)

1. Instale dependências (raiz e backend):

```bash
npm install
npm --prefix bepi-backend install
```

2. Inicie o backend e o frontend em terminais separados:

```bash
npm --prefix bepi-backend run dev
npm run dev
```

O frontend (`http://localhost:5173`) fará chamadas POST para `http://localhost:3000/bepi-data` por meio do `src/lib/bepi-api.ts`.

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório.
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`).
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`).
4. Push para a branch (`git push origin feature/nova-feature`).
5. Abra um Pull Request.

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
