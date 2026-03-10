# SEPLAN Bepi Interactive Dashboard

Este projeto é um dashboard interativo para visualização e análise de dados do SEPLAN Bepi, utilizando Supabase como backend para armazenamento e gerenciamento de dados.

## Tecnologias Utilizadas

- **Vite**: Ferramenta de build rápida para desenvolvimento frontend.
- **TypeScript**: Superset do JavaScript com tipagem estática.
- **React**: Biblioteca para construção de interfaces de usuário.
- **shadcn-ui**: Componentes de UI reutilizáveis e acessíveis.
- **Tailwind CSS**: Framework CSS utilitário para estilização.
- **Supabase**: Plataforma de backend como serviço para banco de dados e autenticação.

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

4. **Configure o Supabase**:
   - Crie um projeto no [Supabase](https://supabase.com).
   - Copie as chaves de API (anon key e service role key) para o arquivo `src/integrations/supabase/client.ts`.
   - Execute as migrações do banco de dados localizadas em `supabase/migrations/`.

5. **Inicie o servidor de desenvolvimento**:
   ```sh
   npm run dev
   ```

O aplicativo estará disponível em `http://localhost:5173` (porta padrão do Vite).

## Estrutura do Projeto

- `src/components/`: Componentes React reutilizáveis, incluindo gráficos, filtros e UI.
- `src/pages/`: Páginas principais da aplicação.
- `src/integrations/supabase/`: Configuração e tipos do Supabase.
- `src/lib/`: Utilitários e APIs para dados do Bepi.
- `supabase/`: Configurações, funções e migrações do Supabase.

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Constrói a aplicação para produção.
- `npm run preview`: Visualiza a build de produção localmente.
- `npm run test`: Executa os testes.

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório.
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`).
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`).
4. Push para a branch (`git push origin feature/nova-feature`).
5. Abra um Pull Request.

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
