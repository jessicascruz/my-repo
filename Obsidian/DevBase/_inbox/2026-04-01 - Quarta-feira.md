
- Tela igual com marketplace, is outlet
- como colocar link administrativo em link
- colocar campo de busca no filtro - referencia, subgerência
- incluir filtro de  marketplace, is outlet

- Tela de visualização:
	- Lista de novos campos que vão ser trazidos - Pedir Agaci
	- Manter as abas
	- Qual a melhor forma de visualizar tudo?
	- Exibir nota fiscal


- [ ] Para o usuário, é importante ele ver o MarketplaceId ou melhor o nome?
- [ ] No discovery coloco o link do stitch ou passo para o Figma?
- [ ] 


---
### Call de Front (Eduardo):

- [ ] Tive problemas com performance
- [ ] O uso de componente - a chamada de um dentro do outro sobrecarrega
- [ ] 


- App fica roteamento
- multi-ajuda-admin-web-
- logic pra ficar separado do html
- tanstack react
- nuks lib para queryParams - 
- Usar o Multi Verso
- DDD no Front 
- micro-frontends



---
## Detalhamento de Pagamentos (Payments)

Como há um mix de métodos (Cartão, Pix, Boleto e Giftcard), organize-os em cards ou em uma tabela de conciliação para somar o valor total.

### **Composição do Recebimento**

- **Cartão de Crédito**: **R$ 150,01** (Operadora: MercadoPagoV2).
    
- **Pix**: **R$ 4,21** (Operadora: Getnet).
    
- **Boleto (Ticket)**: **R$ 2,00** (Banco: 001 - BB).
    
- **Vale-Presente (Giftcard)**: **R$ 2,00** (Provider: Retail Store).
    
- **TOTAL PAGO**: **R$ 158,22** (Status: _Conciliado com a Invoice_)
    

---

## 3. Dados Técnicos por Método

Para suporte ou auditoria, agrupe os detalhes específicos que variam conforme o `paymentMethodId`:

### **Cartão de Crédito**

- **Portador**: JOHN DOE
    
- **Cartão**: 411111******1111 (1x parcela)
    
- **IDs de Transação**: TID: `1876...881` | NSU: `456789`
    

### **Pix**

- **Vencimento**: 10/01/2026
    
- **Código**: `00020126360014BR...`
    
- **Status**: QR Code Gerado
    

### **Boleto (Ticket)**

- **Linha Digitável**: `00190500954014481606906809350314337370000002000`
    
- **Nosso Número**: 123456789012345

---
## Gemini UX:

## 1. O Novo Filtro (Barra Superior)

Para a listagem, como temos muitos parâmetros novos, vamos organizar a barra de filtros assim:

- **Busca Rápida (Full Width):** Uma barra de busca genérica no topo para `Reference ID` e `Sub Reference ID` (o "plano futuro" que já vamos deixar engatilhado).
- **Linha de Filtros Específicos:** Abaixo da busca, 4 colunas:
    1. **Marketplace:** Um dropdown alimentado pelo `marketplaceId` e `origin.description` (ex: "MAGALU").
    2. **Período:** Seletor de data para o campo `externalCreatedAt`.
    3. **Condição:** Toggle ou Select para o `isOutlet` (Verdadeiro/Falso).
    4. **Status:** Filtro para o status da ordem (ex: "CONFIRMED").


UX

Gem personalizado

## UX disse

Fala, meu parceiro dev! Agora o negócio ficou sério, hein? Com o **JSON** na mão e a imagem da tela atual, a gente consegue fazer uma engenharia reversa de respeito para essa nova interface de **Recebíveis Externos (XR)**.

Analisando o payload, vi que o XR é bem mais "robusto" em dados do que o RC tradicional. A gente precisa de uma estrutura que comporte essas novas informações sem virar uma bagunça visual.

Aqui está a proposta de reestruturação baseada no que você mandou:

---

## 1. O Novo Filtro (Barra Superior)

Para a listagem, como temos muitos parâmetros novos, vamos organizar a barra de filtros assim:

- **Busca Rápida (Full Width):** Uma barra de busca genérica no topo para `Reference ID` e `Sub Reference ID` (o "plano futuro" que já vamos deixar engatilhado).
    
- **Linha de Filtros Específicos:** Abaixo da busca, 4 colunas:
    
    1. **Marketplace:** Um dropdown alimentado pelo `marketplaceId` e `origin.description` (ex: "MAGALU").
        
    2. **Período:** Seletor de data para o campo `externalCreatedAt`.
        
    3. **Condição:** Toggle ou Select para o `isOutlet` (Verdadeiro/Falso).
        
    4. **Status:** Filtro para o status da ordem (ex: "CONFIRMED").
        

---

## 2. Reestruturação da Tela de Detalhes (Baseada na Imagem)

A tela em anexo é bem linear. Para a nova tela, como temos blocos de informações muito distintos (Pagamentos, Itens, Impostos), sugiro usarmos **Cards de Agrupamento**.

### Cabeçalho Dinâmico

- **Lado Esquerdo:** Nome do Cliente (`businessPartner.name`) e o ID da Ordem.
- **Lado Direito:** Badge de Status colorido e o botão "Escolha a ação".
    

### Grid de Conteúdo (Cards)

Em vez de uma lista infinita de campos cinzas, vamos separar por contexto:

- **Card 1: Informações da Origem (O "Coração" do XR)**
    - Aqui entram os novos campos: `Marketplace ID`, `External Reference ID`, `System ID` e a `Origin Description`.
    - _Dica de UX:_ Coloque o logo do Marketplace (se tiver) ao lado do nome para identificação imediata.
        
- **Card 2: Detalhes Financeiros**
    - Campos: `Valor total`, `Desconto`, `Frete (Shipping)` e `Tarifas (Tariffs)`.
    - Como o JSON mostra que pode haver múltiplas tarifas e descontos, aqui vale uma pequena tabela interna ou uma lista de itens.
        
- **Card 3: Logística e Entrega**
    - Dados do `shippings`: Empresa de entrega, Código de rastreio e link de rastreio.
    
- **Card 4: Cliente e Endereço**
    - Dados do `businessPartner`: CPF/CNPJ, E-mail, Telefone e o endereço completo formatado.

## 3. Componentes Especiais (Upgrade de UI)

1. **Linha do Tempo de Datas:** O XR tem muitas datas (`createdAt`, `externalCreatedAt`, `updatedAt`). Em vez de campos isolados, que tal uma pequena "Timeline" horizontal no topo do card de informações? Fica muito mais fácil de entender o fluxo do pedido.
    
2. **Accordion para Pagamentos:** O JSON mostra que uma única ordem XR pode ter **vários métodos de pagamento** (Cartão, PIX, Boleto, etc. todos juntos!).
    
    - **Sugestão:** Crie um componente de "Accordion" ou "Tabs" dentro do card de pagamentos para separar os detalhes de cada transação sem poluir a tela principal.
        
3. **Tag de Outlet:** Se `isOutlet` for `true`, coloque uma tag de destaque (ex: laranja "Retorno/Usado") logo abaixo do ID principal. Isso evita erros operacionais de quem está conferindo o recebível.