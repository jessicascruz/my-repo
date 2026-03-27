
- [x] Após confirmação de aprovação, deixar modal aberto rodando um load com botões desatualizados
- [x] No campo de Motivo - Minimo de 100 caracteres e máximo de 500
- [x] No modal de Rejeição, trocar título para apenas "Detalhes"
- [x] No retorno de aprovação no banco, incluir a verificação e retorno do obj Requester
- [x] Conferir no backend fluxo de verificação do valor de pagamento - se tiver aprovações no valor, barrar nova inclusão
- [x] Quando soma de valores dos pagamentos criados de o valor da ordem, desabilitar botão de inserir pagamento manual
- [x] Verificar pq valor de data de aprovação está vindo zero
---
# Planejamento de Tarefas - Execução Hoje 🚀

## Prioridade 1: Lógica de Negócio e Back-end (Nível Cognitivo: Alto)

- [x] **Verificação de valor de pagamento:** No fluxo de verificação do backend, barrar nova inclusão se já houver aprovações no valor total.
- [x] **Objeto Requester:** Incluir a verificação e o retorno do objeto `Requester` no retorno de aprovação no banco. (FEITO MAS DEVO CONFERIR NO GETEWAY)
- [x] **Bug da Data Zero:** Investigar e corrigir por que o valor da data de aprovação está vindo como zero.

## Prioridade 2: Comportamento de Interface e Regras (Nível Cognitivo: Médio)

- [x] **Bloqueio de inserção manual:** Desabilitar botão de inserir pagamento manual quando os valores das aprovações atingirem o valor da ordem.
- [x] **Estado de Loading:** Após confirmação de aprovação, manter o modal aberto com um _loading_ e botões desatualizados/desabilitados.

## Prioridade 3: Validações e Ajustes de Texto (Nível Cognitivo: Baixo)

- [x] **Validação de Motivo:** Aplicar mínimo de 100 e máximo de 500 caracteres no campo de Motivo.
- [x] **Título do Modal:** No modal de Rejeição, trocar título para apenas "Detalhes".



### Não esquecer
- [x] Quando botões estão desabilitados, estão azuis
- [ ] Reduzir css para deixar usando material mui
- [ ] 

---

## Tasks 

Olá! Que prazer te ajudar a colocar ordem na casa. Entendo perfeitamente a urgência: tudo para hoje exige foco total e uma execução cirúrgica. Vamos transformar esse "caos" de pendências em um plano de ação claro para você não se sentir sobrecarregada(o).

Como estamos falando de ajustes técnicos (front e back-end), organizei as tarefas por **complexidade lógica** e **fluxo de dependência**.

---

## 📋 Seu Plano de Execução (Prioridade Máxima)

Aqui está a ordem sugerida, do que exige mais "cérebro" para o que é mais mecânico:

### 1. Fluxo de Verificação de Valores (Back-end)

- **Prioridade:** Alta (Crítica para a regra de negócio)
- **Nível Cognitivo:** Alto (Exige análise de lógica e integridade de dados)
- **Subtarefas:**
    1. Localizar o service/controller responsável pela inserção de pagamentos.
    2. Implementar a query que soma as aprovações já existentes para aquela ordem.
    3. Criar a condicional: `se (soma_atual >= valor_total) { retornar erro/barrar }`.
    4. Testar com um valor exato e um valor excedente.

### 2. Retorno do Objeto Requester & Data Zero

- **Prioridade:** Alta (Essencial para o front-end exibir dados corretos)
    
- **Nível Cognitivo:** Médio
    
- **Subtarefas:**
    
    1. Alterar o DTO/Mapper de retorno da aprovação para incluir o objeto `Requester`.
        
    2. Investigar a tipagem do campo de data no banco vs. aplicação (O "zero" geralmente é erro de parsing ou valor default de Unix timestamp).
        
    3. Corrigir a atribuição da data no momento da persistência ou busca.
        

### 3. Regras de Interface (Botão de Pagamento e Modal de Aprovação)

- **Prioridade:** Média
    
- **Nível Cognitivo:** Médio
    
- **Subtarefas:**
    
    1. Criar a lógica no Front para desabilitar o botão de inserção manual baseado no retorno da soma (que você corrigiu na tarefa 1).
        
    2. Implementar o estado de `loading` no modal de aprovação e garantir que os botões fiquem em estado `disabled` ou ocultos durante o processo.
        

### 4. Ajustes de Validação e Texto (UI/UX)

- **Prioridade:** Baixa (Rápido de resolver)
    
- **Nível Cognitivo:** Baixo
    
- **Subtarefas:**
    
    1. No campo "Motivo", adicionar os atributos `minlength="100"` e `maxlength="500"`.
        
    2. Adicionar um contador de caracteres para ajudar o usuário.
        
    3. No modal de Rejeição, alterar a string do título para "Detalhes".
        

---

## 💡 Dicas de Ouro para não atrasar

- **Não tente "refatorar o mundo":** O prazo é para hoje. Foque no funcional. Se o código estiver feio mas seguro e funcionando, entregue. Você limpa depois.
    
- **Testes rápidos:** Para cada subtarefa de back-end finalizada, rode um _insomnia/postman_ imediato. Não espere terminar tudo para testar, ou o erro vai ser difícil de rastrear.
    
- **Evite o "só mais uma coisinha":** Cuidado com pedidos extras que surgem no chat. Mantenha o foco nesta lista.
    

---

## ☕ Pausas Estratégicas (Método 50/10)

Trabalhar sob pressão sem parar frita os neurônios e causa erros bobos de sintaxe.

- **A cada 50 minutos de código:** Pare por **10 minutos**.
    
- **O que fazer:** Saia da frente da tela. Beba um copo de água gelada, alongue os pulsos (essencial para devs!) e olhe para algo que esteja a mais de 5 metros de distância para descansar a vista.
    

---


- [x] criar endpoint de cancelamento
	- [x] Status 4 = CANCELED
	- [x] Só o criador do pagamento pode cancelar 
	- [x] v1/manualPayment/cancel/manualPaymentId
	- [x] Tipo Patch
 - [x] Verifica Status - só pode cancelar com Status  pendente
 - [x] Verifica Requester
 - [x] Update na tabela de pagamento manual com update em StatusId e data de alteração
 - [x] Verifica pendentes ou aprovados - se não tiver o valor, ele cria pagamento
 - [x] Desde que valor seja menor que valor seja menor
 - [x] Configurar para que botão de cancelar só apareça para a pessoa que criou ele
 - [ ] Colocar loading no botão ao invés da tela/modal


 - [ ] Na documentação, acima de Desconto criar regras de pagamento manual
 - [ ] Usar levantamento de requisitos
 - [ ] Mudar fluxo na documentação draw.io
 - [ ] Conferir fluxo de validações
 - [ ] Conferir cancelamento no front
 - [ ] Conferir modal de confirmação

---

Preciso criar uma validação em um método de criação. A primeira coisa que ele precisa fazer é 
selecionar itens de ManualPayment e verificar os que são pendentes ou aprovado. Depois verificar Se a soma do Amount deles é igual ao Amount de Order. Se for igual ou maior, retorna erro de valor completo e não deve exceder. Se for abaixo, ele segue o fluxo de criação

---

@beautifulMention@beautifulMention em CreatePaymentManualAsync, antes de qualquer coisa, preciso validar Amount de pagamentos incluindo o que está em ManualPaymentRequest. Preciso criar uma validação em um método de criação. A primeira coisa que ele precisa fazer é

selecionar itens de ManualPayment e verificar os que são pendentes ou aprovado. Depois verificar Se a soma do Amount deles é igual ao Amount de Order. Se for igual ou maior, retorna erro de valor completo e não deve exceder. Se for abaixo, ele segue o fluxo de criação. Use o ValidatePaymentApprovalAsync que também será usado em CreatePaymentApprovalByIdAsync para validar com aprovações e mudar status de ordem. Valida apenas pagamentos com o StatusId 1 e 2


---
