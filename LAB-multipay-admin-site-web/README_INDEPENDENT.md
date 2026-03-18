# Execução Independente (Standalone)

Este projeto foi configurado para ser executado de forma totalmente independente, sem dependência de APIs externas ou servidores Keycloak.

## Como funciona

1.  **Banco de Dados Local:** Utiliza um arquivo `multipay.db` (SQLite) local para armazenar ordens, pagamentos e reembolsos.
2.  **API Mockada:** Foram criadas rotas de API no Next.js (`src/app/api/v1/...`) que interceptam as chamadas que antes iam para o backend externo.
3.  **Autenticação Local:** O Keycloak foi substituído por um `CredentialsProvider` do NextAuth.
    *   **Usuário:** `admin`
    *   **Senha:** `admin`
4.  **Persistência:** As interações (cancelamentos, reembolsos, novos pagamentos manuais) são salvas no banco de dados SQLite local.

## Como executar

1.  Certifique-se de que as dependências foram instaladas (especialmente `better-sqlite3`):
    ```bash
    yarn
    ```
2.  O arquivo `.env.local` já está configurado para apontar para a API local (`/api`).
3.  Inicie o servidor de desenvolvimento:
    ```bash
    yarn dev
    ```
4.  Acesse `http://localhost:3000` e faça login com `admin/admin`.

## Estrutura do Banco
O banco é inicializado e populado automaticamente na primeira chamada à API de listagem de ordens.
Os dados iniciais são baseados no arquivo `test/mocked-order.ts` e 20 ordens adicionais foram geradas para fins de teste de paginação.
