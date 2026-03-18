### Conclusão:

As chamadas reais para o backend são feitas dentro do **`OrderRepository.ts`**. Note que lá eles usam o `this.httpClient.post` ou `this.httpClient.patch` para enviar dados para rotas como `/v1/payment/.../refund` ou `/v1/order/status/...`.

Para implementar o seu pagamento manual:

1.  **Abra o `OrderRepository.ts`** e adicione um novo método, por exemplo:
    ```typescript
    createManualPayment = async (data: any): Promise<void> => {
      // Implemente a chamada para a sua rota de pagamento manual aqui
      await this.httpClient.post('/v1/order/manual-payment', data)
    }
    ```
2.  **Crie um Hook de Mutação**: Copie o `useCancelOrder.ts` e adapte-o para chamar o novo método `createManualPayment`.
3.  **Use o Hook no `Tabs.tsx`**: Substitua o `console.log` e o `toast.success` manual pela execução da mutação que o hook vai te fornecer.

Dessa forma, você estará seguindo o padrão de arquitetura do projeto (Clean Architecture / Repository Pattern). Se quiser ajuda para criar o hook ou o método no repositório, é só me pedir!




-------------------------------------------------------------------------------------------------------------------------


Implementei a lógica de envio de pagamento manual seguindo os padrões de arquitetura do projeto. As principais alterações foram:

1.  **Domínio**:
    *   Adicionei a chave `CREATE_MANUAL_PAYMENT` ao enum `reactQueryEnum`.
    *   Atualizei a interface `IReceivableResponse` para incluir o campo opcional `manualPayments`.
    *   Mapeei o novo erro `createManualPaymentError` em `orderRepositoryErrors.ts` e o registrei no `messagesPicker.ts`.

2.  **Infraestrutura (Repositório)**:
    *   Criei a interface `ICreateManualPaymentParams` no `OrderRepository.ts`.
    *   Implementei o método `createManualPayment` no `OrderRepository`, utilizando `FormData` para suportar o envio de arquivos para a rota `/v1/order/manual-payment`.

3.  **Apresentação (Hooks e Componentes)**:
    *   Criei o hook de mutação `useCreateManualPayment.ts`, que gerencia o estado da requisição, exibe notificações de sucesso/erro e invalida o cache do pedido para refletir as mudanças.
    *   Atualizei o componente `Tabs.tsx` para utilizar o novo hook e a sessão do usuário (`useSession`), enviando os dados do formulário juntamente com as informações do solicitante logado.

Agora, ao preencher o formulário de pagamento manual e confirmar, a aplicação enviará os dados e arquivos para o backend e atualizará automaticamente os detalhes da ordem na tela.