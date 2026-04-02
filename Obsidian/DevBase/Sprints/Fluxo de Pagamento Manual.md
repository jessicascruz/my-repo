Em casos de pagamento manual, o valor da ordem corresponderá a soma dos valores de todos os pagamentos que foram inseridos manualmente. O processo pode ser feito por usuários autorizados. Ao inserir o pagamento, é obrigatório inserir o motivo desse pagamento, seu valor e anexar arquivos de evidências. Esses arquivos precisam ser nos formatos PDF, JPG, PNG.
O pagamento manual precisa ser aprovado por um usuário que não seja o mesmo que inseriu esse pagamento. O usuário que fez a inclusão, poderá cancelar e esse pagamento será invalidado pelo sistema, e se for o caso, poderá ser inserido novamente. Somente o criador do pagamento poderá exclui-lo.
O aprovador, fará a análise desse pagamento e terá a opção de **Aprovar** ou **Rejeitar**.
Em Rejeitar, é obrigatório inserir o motivo dessa rejeição que é no mínimo 100 caracteres.
Para inserir um novo pagamento manual, o valor precisa ser menor ou igual ao valor da Ordem, levando em consideração se já existem pagamentos lançados. Se já tem algum, será somado o valor do pagamento que está sendo inserido, com os que já estão lançados para que soma não seja maior que valor da Ordem.
Se soma de pagamentos lançados e aprovados chegarem ao valor da Ordem, Status da Ordem muda para **Confirmado Manual** e não há mais possibilidade de inserir novos pagamentos.


---
## Regras de Pagamento Manual

### 1. Definição e Requisitos

O **Pagamento Manual** é uma funcionalidade restrita a usuários autorizados. O valor total da Ordem será composto pela soma de todos os lançamentos manuais realizados.

Ao registrar um pagamento, é mandatório o preenchimento/envio de:

- **Motivo:** Justificativa detalhada do lançamento;
    
- **Valor:** Valor unitário do pagamento;
    
- **Evidências:** Anexo obrigatório de arquivos nos formatos **PDF, JPG ou PNG**.
    

### 2. Fluxo de Aprovação e Alçada

Para garantir a integridade do processo, o sistema aplica a regra de segregação de funções:

- **Aprovação:** Um pagamento deve ser aprovado obrigatoriamente por um usuário distinto daquele que realizou a inclusão.
    
- **Ações do Criador:** O usuário de origem pode **cancelar** um lançamento (invalidando-o no sistema) ou **excluí-lo** permanentemente.
    
- **Análise:** O aprovador possui as opções de **Aprovar** ou **Rejeitar**. Em caso de rejeição, é obrigatória a inserção de uma justificativa.
    

### 3. Regras de Validação de Valor

O sistema não permite que a soma dos pagamentos manuais exceda o valor total da Ordem.

> **Regra:** $\sum \text{Pagamentos Manuais} \leq \text{Valor da Ordem}$

- Se houver pagamentos anteriores (lançados ou aprovados), o novo lançamento será somado ao montante existente para validação do limite.
    
- Ao atingir o valor total da Ordem através de pagamentos aprovados, o status da Ordem será alterado automaticamente para **"Confirmado Manual"**, impossibilitando novos lançamentos.





---
Estou escrevendo regras de pagamento manual para inserir no documento do software. Com base nisso, você é minha orientadora e vai conferir meu texto, avaliando a escrita, normas, gramática e boa estruturação para um documento de de software. Ao fim, você deve devolver pontos de melhoria e correções.

