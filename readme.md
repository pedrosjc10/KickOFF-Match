# TCC - Sistema de Gerenciamento de Partidas Esportivas

Este projeto tem como objetivo facilitar o gerenciamento de partidas esportivas, permitindo o cadastro de usuários (jogadores e organizadores), criação e organização de partidas, controle de locais e acompanhamento dos resultados.

## Estrutura do Projeto

- **backend/**: API desenvolvida em Node.js/TypeScript para gerenciar dados, autenticação e regras de negócio.
- **frontend/**: Aplicação web desenvolvida em React para interação dos usuários.
- **Monografia/**: Documentação acadêmica e arquivos de modelagem do banco de dados.

## Funcionalidades Principais

- Cadastro e autenticação de usuários (jogador, organizador)
- Criação e gerenciamento de partidas (públicas e privadas)
- Cadastro de locais e modalidades esportivas
- Controle de participação dos jogadores nas partidas
- Registro de placares e resultados

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão recomendada: 18.x ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [MySQL](https://www.mysql.com/) (ou outro banco de dados compatível, conforme configuração do backend)

## Como executar o projeto

### 1. Backend

```sh
cd backend
npm install
# Configure o arquivo .env com as variáveis de ambiente necessárias (exemplo em .env.example)
npm run dev
```

### 2. Frontend

```sh
cd frontend
npm install
# Inicie o servidor de desenvolvimento
npm start
```

## Tecnologias Utilizadas

- **Backend**: Node.js, TypeScript, Express, TypeORM, MySQL
- **Frontend**: React, TypeScript, Material-UI, React Router, Axios, React Hook Form, Yup, React Query
- **Testes**: Jest, React Testing Library, Cypress
- **Qualidade de Código**: ESLint, Prettier, Husky, Lint Staged, Commitlint

## Autores
Pedro Dias de Oliveira
Joao Vitor Soares de Moraes
Lucas Henrique Toledo Bispo
Helio Esperidiao
/*******  8a09d622-231c-43e2-a59c-1308c4708c48  *******/