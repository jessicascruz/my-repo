


# Backend

- Lista de sub-referencias dentro da ordem
- Usando um filtro que o Agaci vai fazer no backend
- Terá o MarketplaceId, isOutlet
- Terá paginação 
- Usuário precisa ter uma role de seleção para usar rota get e post
- O retorno será da Ordem e dos Agregados - paginado


---

# Frontend

- Exibir notas fiscais de external receivable e receivable
- Remover a coluna de Tipo da tabela
- Criar menu tipo sidebar com itens -
- Página inicial ser tipo dashboard - usar Multitech de exemplo
- Ideias de card de acesso rápido
- Tela de filtro - lista de ordem, trazer, marktplace, outlet, link adm - basear no Multipay
- Pensar em uma busca para pesquisa  pela referencia e subreferencia (pra frente) - depois
- tela de visualização: tipo recebimento, com as mesmas coisas, porém com mais itens - nota fiscal,
- ver como será exibido os novos itens como a nota fiscal - ter if para cada exibição
- usar Stich para pensar em menu,
- criar pock de recebimento externo
mandar mensagem para a UX pra mandar a pock que eu fizer
criar o Discovery no Confluence com tudo que eu levantar nas pesquisas
funcionalidades de domínio
fazer painel exibindo informações como o receivable - (estou sem acesso)
Luiz mandou exemplos no char

---

Criar plano de seguimento para criação de Discovery - seguir anotações
Criar app que ao inserir minha tarefa com data de inicio e fim, e ele me dá metas diárias bem quebradas para seguir e consegui fazer a entrega com prazo
	- Seria tipo um agente que me ajudaria a me organizar nas tarefas da sprint
	- Tela para inserir Sprint e as tarefas. Poder detalhar mais as tarefas com base no Discovery e Levantamentos de requisitos
	-


- O uso de flags no backend, é enviado pelo front na url e o backend trata


---
### 18/03 - reunião 2
- domínio é o não funcional, mais tarefa - racional
- Funcionais - 

---
## DÚVIDAS

1. Precisa seguir os padrões ou pode ter uma identificação nossa?
2. 


---
## Discovery

## 1. Visão Geral e Objetivo

O objetivo deste projeto é desmembrar a visão de recebíveis no painel ADM, separando o domínio de **Recebimento Interno** do **Recebimento Externo (Marketplace)**. A meta é oferecer uma interface especializada que suporte a complexidade de dados externos (notas fiscais, tarifas, fretes) e melhore a navegabilidade através de uma nova arquitetura de informação.

## 2. Experiência do Usuário (UX) e Interface (UI)

- **Arquitetura de Navegação:**

    - Substituição da navegação atual por um **Menu Lateral (Sidebar)** segregando: _Recebimento_ e _Recebimento Externo_.
    - Criação de uma **Home (Dashboard)** utilizando cards de acesso rápido para as verticais de negócio.
        
- **Refatoração de Telas Existentes:**
    
    - Remoção da coluna "Tipo" na listagem geral para purificar o domínio da tela.
        
- **Processo de Design:**
    
    - Desenho de fluxos e baixa fidelidade utilizando a ferramenta **Stitch**.
    - Validação de protótipos com a especialista de UX (Emily) e posterior exportação para o **Figma**.
    - **Referência de Mercado:** Estudo visual de painéis para benchmarking de conciliação.

## 3. Requisitos Funcionais (Frontend)

### 3.1. Tela de Listagem (Filtros) - Recebíveis Externos

A listagem deve ser baseada na estrutura atual do Multipay, mas com as seguintes colunas obrigatórias:

- Marketplace ID
- Is Outlet (Identificador de produtos de retorno)
- Sistema / Empresa
- Valor e Data de Criação
- Link Administrativo para a Ordem

### 3.2. Detalhes da Ordem (Visualização)

Manter a estrutura de abas (**Ordem, Cliente, Produto**) e adicionar a exibição de novos agregados:

- **Invoices (Notas Fiscais):** Exibição condicional (renderizar apenas se o objeto existir no retorno da API).
- **Financeiro Detalhado:** Exibição de tarifas, descontos, frete e origem.
- **Lógica de Renderização:** Implementação de _conditional rendering_ (ifs) para garantir que a interface não quebre na ausência de dados opcionais.

### 3.3. Filtros Avançados e Busca

- Busca por Marketplace ID, Is Outlet, Reference ID e Range de datas.
- _(Roadmap/Futuro)_: Pesquisa por Sub-referência.

## 4. Definições Técnicas e Integração

- **Otimização de Payload:** Utilização de **Flags de Projeção** nas URLs de requisição. O frontend deverá solicitar explicitamente quais agregados deseja receber (ex: `?include=invoices,storno`).
    
- **Segurança e Acessos:** Implementação de controle por **Roles**. O acesso às rotas de Recebimento Externo será restrito a usuários com a permissão específica de seleção.
    
- **POC (Prova de Conceito):** Criação de uma POC inicial focada no fluxo de recebimento externo para validar a comunicação com os novos endpoints.


---

## DICA:

#### 1. Visão Geral e Objetivos (Contexto)

- **Problema a ser resolvido:** O que motivou essa nova interface?
- **Objetivos de Negócio:** O que se espera alcançar (ex: aumentar conversão, reduzir tempo de carregamento)?
- **Público-Alvo:** Quem vai usar a interface?

#### 2. Pesquisa e Referências (Benchmarking)

- **Análise de Concorrentes:** Referências visuais e funcionais.
- **Propostas de Valor:** Como a nova interface resolve o problema do usuário.

#### 3. Escopo Técnico de Front-End (O que será feito)

- **Mapa de Componentes/UI Kits:** Identificação de elementos reutilizáveis (botões, campos de formulário, cards).
- **Funcionalidades por Tela:** Descrição detalhada do que cada parte faz.
- **Fluxo do Usuário:** Como o usuário navega entre as páginas. 

#### 4. Arquitetura e Estratégia Técnica

- **Stack Tecnológica:** Definição de frameworks (React, Next.js, Vue), linguagens (TypeScript/JavaScript) e ferramentas de estilização (Styled Components, Tailwind).
- **Estratégia de Renderização:** SSR (Server-Side Rendering), CSR (Client-Side Rendering) ou SSG (Static Site Generation).
- **Integração com BFF (Backend for Front-end):** Como o front-end consumirá APIs.
- **Ferramentas de Documentação:** Uso de Storybook para isolar e documentar componentes. 

#### 5. Requisitos Não Funcionais

- **Desempenho:** Metas de tempo de carregamento.
- **Acessibilidade:** Padrões WCAG a serem seguidos.
- **Responsividade:** Dispositivos e resoluções suportadas.
- **SEO:** Requisitos de tags e meta-descrições.

#### 6. Definição de MVP (Produto Mínimo Viável)

- O que é estritamente necessário para lançar e testar o valor da ideia.
- Lista de funcionalidades a serem adiadas para versões futuras. 

#### 7. Riscos e Premissas

- Limitações técnicas conhecidas.
- Dependências de APIs do back-end.
- Prazos e alinhamento da equipe. 

#### Ferramentas Usadas na Documentação

- **Storybook:** Para criar a documentação interativa de componentes UI.
- **Figma/Adobe XD:** Para as referências visuais e fluxo.
- **Confluence/GitHub Issues:** Para centralizar o documento de texto. 

O objetivo principal deste documento não é ser uma especificação imutável, mas sim **reduzir riscos e aumentar a assertividade no desenvolvimento**.