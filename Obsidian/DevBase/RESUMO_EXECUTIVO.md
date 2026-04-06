# Resumo Executivo e Guia de Referência - Multipay / Multi Verso

Este documento consolida as principais informações espalhadas pelo vault, agrupando-as por afinidade temática para facilitar a consulta e o onboarding.

---

## 1. 🏗️ Arquitetura e Padrões Técnicos

### 1.1. Backend (.NET DDD Multipay)
*   **Padrão de Camadas:** Rigorosa separação entre `App` (API/Endpoints), `Domain` (Core/Business) e `Infra` (Data/External).
*   **Result Pattern:** Uso obrigatório de `Tuple<T?, ErrorResult>` para evitar o lançamento de exceções em regras de negócio.
*   **Mapeamento:** Preferência por métodos explícitos `ToDomain()` e `FromDomain()` em vez de AutoMapper.
*   **Tecnologias AWS:** API Gateway, Lambda (Serverless), SNS (Mensageria), S3 (Storage) e Secret Manager.

### 1.2. Frontend (Multi Verso & UI)
*   **Stack:** React com foco em componentes reutilizáveis.
*   **SmartTable:** Componente central para exibição de dados complexos.
*   **Autenticação:** Uso de Keycloak apenas no client e `http-client` para automação de tokens.
*   **Arquitetura de Navegação:** Transição para Layout Flexível com Sidebar e Cards (Dashboard).

---

## 2. 💳 Domínio de Negócio (Multipay)

### 2.1. Recebíveis Externos (XR - External Receivable)
*   **Objetivo:** Separar a visão de recebimento interno do Marketplace.
*   **Conceitos Chave:**
    *   **Ordem (Order):** Informações originadas no sistema de origem.
    *   **Invoices (Notas Fiscais):** Renderização condicional no frontend baseada no retorno da API.
    *   **Agregados:** Dados financeiros detalhados (tarifas, descontos, frete).
*   **Filtros:** Busca por `MarketplaceId`, `IsOutlet` e `ReferenceId`.

---

## 3. 🛠️ Guia Operacional e Procedimentos

### 3.1. Fluxo de Pagamento Manual (Manual Payment)
*   **Estados:** Pendente (Status 1), Aprovado, Rejeitado.
*   **Resiliência:** Procedimentos documentados para "resetar" aprovações via SQL para testes de cenários.

### 3.2. Consultas SQL Úteis
*   **Consultar Ordem por ID:** Seleção completa na tabela `[Multipay].[Order]`.
*   **Gerenciamento de Aprovações:** Scripts para `DELETE` em `[Manual].[PaymentApproval]` e `UPDATE` em `[Manual].[Payment]` para limpeza de `ApprovedAt`.

---

## 4. 🤖 Ecossistema de IA e Automação

### 4.1. Skills de Agente (Prompt Engineering)
*   `dotnet-ddd-multipay`: Especialista em microserviços C#.
*   `multiverso-consumption`: Guia para implementação do Multi Verso.
*   `dark-mode`: Diretrizes para temas escuros.

### 4.2. Automações e Experimentos
*   **Agente de Organização de Sprint:** Projeto para criar metas diárias baseadas no prazo da sprint.
*   **Análise de Código:** Instruções (GEMS) para análise arquitetural automática.

---

## 📅 Status Atual (Sprint 8)
*   **Foco:** Implementação do Discovery de Recebíveis Externos.
*   **Pendências:** Levantamento de requisitos do Multi Verso, liberação de Figma e finalização do fluxo de visualização de Notas Fiscais.
