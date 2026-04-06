
## Tarefas:

- [ ] Pensar em quais campos a mais devemos incluir no Filtro de busca
- [ ] 



---
## Observações Para Próxima Daily:

1. Conversei com Emily e ela mudou protótipo para o padrão
2. Terminei Discovery, mas preciso voltar depois e alterar as imagens e incluir link do Figma
3. Ju solicitou acesso ao Figma pra mim
4. Quase terminando os Levantamentos de Requisitos
5. Coloquei algumas coisas dos Levantamentos de domínio, mas vou aproveitar a reunião do Multi Verso para ver melhor sobre os componentes



---
### 




---


# Levantamento de Requisitos

Requisitos Funcionais dizem _o que_ o sistema faz, os **Requisitos Não Funcionais (RNF)** determinam _como_ o sistema deve se comportar em termos de qualidade, segurança e experiência.


Atualmente o multipay não possui o fluxo que disponibiliza as informações de vendas e pagamentos que são processados fora da plataforma, como exemplo marketplaces e e-commerces. Além disso, não possui uma tela inicial onde centraliza os fluxos existentes e também não possui um menu para facilitar os acessos ao usuário. 




# Levantamento de Requisitos de Front-end: Detalhes da Ordem (MultiPay)

## 1. Visão Geral

Interface de detalhamento de pedidos/ordens, permitindo a visualização de dados do cliente, financeiros, logísticos e técnicos através de uma navegação por abas e seções expansíveis.

## 2. Requisitos Funcionais (Interface e Interação)

### 2.1. Cabeçalho e Identificação

- **Breadcrumb:** Caminho de navegação funcional: `Página Inicial / Ordens / Detalhes`.
    
- **Botão Voltar:** Ícone de seta à esquerda do nome do cliente que retorna à listagem anterior.
    
- **Copy ID:** Próximo ao ID da ordem, deve haver um botão/ícone de "copiar" que salve o hash no clipboard do usuário.
    
- **Tag de Status:** Exibir o status da ordem (ex: "CRIADO") em um _badge_ com cores condicionais.
    

### 2.2. Navegação por Abas (Tabs)

- **Categorias:** Ordem, Cliente, Produto, Informações.
    
- **Comportamento:** A aba ativa deve ter o indicador visual (linha azul inferior). A troca de abas deve alterar o conteúdo inferior sem recarregar a página (comportamento de SPA).
    

### 2.3. Seção "Ordem" (Campos de Dados)

- **Visualização:** Os campos devem ser "Read-Only" (apenas leitura), dispostos em grid de 3 colunas.
    
- **Links Externos:** Os campos de "Link" e "Link Administrativo" devem abrir em uma nova aba (`_blank`) ao clicar no ícone de saída.
    

### 2.4. Seção Financeira e Pagamentos

- **Lista de Pagamentos:** Exibir ícone do método (Cartão, PIX, Boleto, Vale), descrição, data/vencimento e valor alinhado à direita.
    
- **Resumo de Totais:** Card destacado na cor azul claro com o valor total pago e status da conciliação.
    
- **Notas Fiscais:** Tabela com ações de download para arquivos **XML** e **DANFE**.
    

### 2.5. Seção Informações (Acordeões)

- **Componente Accordion:** Seções de Logística, Financeiro/Fiscal e Dados Técnicos devem ser expansíveis/retráteis.
    
- **Indicador de Itens:** Exibir a contagem de itens (ex: "2 itens") à esquerda da seta de expansão.
    

---

## 3. Requisitos Não Funcionais

### 3.1. Design e UI (Style Guide)

- **Cores:** Azul institucional (#0055D4 aprox.) para botões primários e cabeçalho. Cinzas claros para fundos de campos desabilitados.
    
- **Componentização:** Utilizar botões com estados de _hover_ (escurecimento leve) e _focus_.
    
- **Feedback Visual:** Implementar _Skeletons_ de carregamento enquanto os dados da API não retornam.
    

### 3.2. Responsividade e Sidebar

- **Menu Lateral:** Deve ser retrátil (ícone `<` no topo da sidebar). Quando fechado, exibir apenas os ícones para ganhar área de trabalho.
    
- **Breakpoints:** Em telas menores (mobile), o grid de 3 colunas deve se transformar em 1 coluna (empilhamento).
    

---

## 4. Notas de Implementação (Dicas da Doc)

> **Atenção aos Links:** No campo "Logística", o link de rastreio deve ser dinâmico. Se não houver código de rastreio, o front-end deve exibir um estado de "Não disponível". **Segurança de Dados:** O campo de Cartão de Crédito deve vir mascarado do back-end (ex: **** 1111). Nunca manipule o número completo no front-end.






---

### REQUISITOS DE DOMINIO PARA INCLUIR NA DOC


Fala, dev! Que massa esse projeto. O layout está bem limpo, seguindo uma linha de design system robusta (estilo Material ou Ant Design, mas com uma pegada própria de Fintech).

Para o **Next.js**, a melhor abordagem aqui é usar a **App Router** para aproveitar os Server Components nas partes de dados estáticos e Client Components para as interações (tabs, accordions, dropdowns).

Aqui está o detalhamento das tarefas (Issues) para o seu Jira, estruturado para que qualquer dev do time consiga pegar e executar sem dúvidas:

---

## 🛠️ Epic: Implementação do Painel MultiPay

### Task 1: Estrutura Base e Componentes de Layout (Shell)

**Descrição:** Criar a base da aplicação que envolve todas as telas.

- **Sidenav:** Implementar a barra lateral com estados `active` para rotas, ícones (Lucide ou Heroicons) e o botão de colapsar.
    
- **Navbar (Header):** Criar o cabeçalho azul com logo, notificações, configurações e o Profile Chip (nome + avatar).
    
- **Footer:** Componente simples com links de termos/privacidade e o indicador de status "Servidores Online".
    
- **Layout Wrapper:** Configurar o `layout.tsx` para persistir esses elementos entre trocas de página.
    

### Task 2: Componentes Atômicos e Design System

**Descrição:** Desenvolver os componentes reutilizáveis baseados no print para garantir consistência.

- **Cards:** Componentes com bordas arredondadas e sombra leve (vimos dois tipos: os de navegação da Home e os de dados da Ordem).
    
- **Inputs (Read-only):** Estilizar os campos de visualização de dados (fundo cinza claro, label superior pequena).
    
- **Badges/Status:** Criar o componente de status (ex: "CRIADO", "Conciliado com a Invoice").
    
- **Buttons:** Implementar o botão primário azul e o botão de "Escolha a ação" com dropdown.
    

### Task 3: Página Home (Dashboard de Entrada)

**Descrição:** Implementar a rota `/home`.

- **Grid de Atalhos:** Renderizar os cards de "Recebimentos" e "Recebimentos Externos".
    
- **Interatividade:** Hover states e redirecionamento para as sub-rotas.
    
- **Responsividade:** Garantir que os cards empilhem corretamente em telas menores.
    

### Task 4: Página de Detalhes da Ordem - Cabeçalho e Navegação

**Descrição:** Implementar a parte superior da tela de detalhes.

- **Breadcrumbs:** Linkagem funcional (Página Inicial > Ordens > Detalhes).
    
- **Header da Ordem:** Título dinâmico (Nome do cliente), ID com função "Click to Copy" e botão de voltar.
    
- **Tabs de Navegação:** Implementar o componente de abas (Ordem, Cliente, Produto, Informações) usando `useState` ou query params para controlar a visualização.
    

### Task 5: Tela de Detalhes (Aba "Ordem") - Data Display

**Descrição:** Construção do conteúdo da primeira aba.

- **Grid de Informações:** Organizar os campos (ID, Referência, Solicitante, Datas) em um layout de 3 colunas (CSS Grid/Flexbox).
    
- **Financeiro/Fiscal:** Lista de pagamentos com ícones de método (Cartão, PIX, Boleto) e a tabela de Notas Fiscais com links para download de XML/DANFE.
    
- **Logística:** Seção inferior com campos de código e link de rastreio funcional.
    

### Task 6: Tela de Detalhes (Aba "Informações") - Accordions

**Descrição:** Implementar a visualização de listas expansíveis.

- **Componente Accordion:** Criar os grupos "Logística", "Financeiro/Fiscal" e "Dados Técnicos".
    
- **Badges de Contagem:** Mostrar a quantidade de itens (ex: "2 itens") no header do accordion.
    
- **Logic:** Garantir que o estado de abertura/fechamento seja suave (foco em UX).
    

---

## 💡 Dicas de Arquitetura (O toque da "Dev Senior")

1. **Server Components vs Client Components:** * Mantenha a busca de dados no `page.tsx` (Server Component).
    
    - Crie um componente de cliente apenas para o que for interativo, como as **Tabs** e o **Accordion**. Isso vai deixar o carregamento voando.
        
2. **Tailwind CSS:** Para esses inputs com fundo cinza e bordas suaves, o Tailwind é perfeito. Use `bg-slate-50` ou `bg-gray-100` para os campos de leitura.
    
3. **Skeleton Screens:** Como essa tela tem muitos dados, não esqueça de criar uma tarefa de "Loading States" usando Skeletons para o usuário não ver a tela em branco enquanto o Next.js busca os detalhes da ordem.
    
4. **Zustand ou Context:** Se você precisar passar o estado da "Ordem" entre as abas e elas forem componentes muito separados, um store pequeno com Zustand resolve sem a complexidade do Redux.
    

Precisa de ajuda com o código de algum desses componentes específicos? É só dar o grito! 🚀