
## Tarefas:

- [ ] Começar Levantamento de Requisitos
- [ ] Pensar em quais campos a mais devemos incluir no Filtro de busca
- [ ] 



---
## Observações Para Próxima Daily:

1. Conversei com Emily e ela fará os ajustes no protótipo para que fique no padrão Multi e ficar certo na documentação
2. Terminei Discovery, mas preciso voltar depois e alterar as imagens e incluir link do Figma
3. Ju solicitou acesso ao Figma pra mim



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