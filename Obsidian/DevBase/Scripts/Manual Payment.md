# Consultas SQL

  

### Excluir aprovação pra testar cenários diferentes:

```sql

-- 1. Inicia a transação com segurança

BEGIN TRANSACTION;

  

-- Definimos o ID para não ter que digitar várias vezes

DECLARE @TargetManualPaymentId UNIQUEIDENTIFIER = '5f137f49-046b-4064-b966-d2412f94da50';

  

-- 2. Deleta a aprovação

DELETE FROM [DB_MULTIPAY].[Manual].[PaymentApproval]

WHERE [ManualPaymentId] = @TargetManualPaymentId;

  

-- 3. Atualiza o pagamento manual para o status original (ex: Pendente = 1)

-- E limpa o campo ApprovedAt que você mencionou no C#

UPDATE [DB_MULTIPAY].[Manual].[Payment]

SET [StatusId] = 1,        -- Ajuste para o ID do status 'Pendente' do seu banco

    [ApprovedAt] = NULL    -- Remove a data de aprovação

WHERE [Id] = @TargetManualPaymentId;

  

-- 4. VALIDAÇÃO

-- Verifica se a aprovação sumiu

SELECT 'Aprovação após DELETE' as Label, * FROM [DB_MULTIPAY].[Manual].[PaymentApproval] WHERE [ManualPaymentId] = @TargetManualPaymentId;

  

-- Verifica se o pagamento foi resetado

SELECT 'Pagamento após UPDATE' as Label, [StatusId], [ApprovedAt] FROM [DB_MULTIPAY].[Manual].[Payment] WHERE [Id] = @TargetManualPaymentId;

  

-- 5. CONCLUSÃO (Escolha uma das linhas abaixo e execute individualmente):

-- ROLLBACK; -- Se quiser desfazer tudo (recomendado para testes)

-- COMMIT;   -- Se quiser salvar as alterações permanentemente

```

  
### Passados

```sql

SELECT [Id]
      ,[SystemId]
      ,[StatusId]
      ,[ReferenceId]
      ,[SubReferenceId]
      ,[RequesterId]
      ,[Amount]
      ,[Discount]
      ,[ExpirationTime]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [DB_MULTIPAY].[Multipay].[Order]
  WHERE [DB_MULTIPAY].[Multipay].[Order].[Id] =  '019c5217-ad08-742d-9d5c-c793512a6819';

  ----------------------------------------------------------------------------

  SELECT TOP (1000) [Id]
      ,[OrderId]
      ,[Amount]
      ,[RequesterId]
      ,[StatusId]
      ,[Reason]
      ,[ApprovedAt]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [DB_MULTIPAY].[Manual].[Payment]
  

  SELECT *
  FROM [DB_MULTIPAY].[Manual].[Payment]
  WHERE [DB_MULTIPAY].[Manual].[Payment].[OrderId] = '019c5217-ad08-742d-9d5c-c793512a6819'

  

  ---------------------------------------------------------------------------

  SELECT [Id]
      ,[ManualPaymentId]
      ,[IsApproved]
      ,[RequesterId]
      ,[RejectionReason]
      ,[CreatedAt]
  FROM [DB_MULTIPAY].[Manual].[PaymentApproval]
  WHERE [ManualPaymentId] = '5f137f49-046b-4064-b966-d2412f94da50';

  

  ---------------------------------------------------------------------------

  SELECT *
  FROM [DB_MULTIPAY].[Manual].[Payment]
  WHERE [DB_MULTIPAY].[Manual].[Payment].[Id] = 'C8EEC3A7-4CA1-43CE-8B59-61FF0060DDA6'

  

  SELECT [Id]
      ,[SystemId]
      ,[StatusId]
      ,[ReferenceId]
      ,[SubReferenceId]
      ,[RequesterId]
      ,[Amount]
      ,[Discount]
      ,[ExpirationTime]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [DB_MULTIPAY].[Multipay].[Order]
  WHERE [DB_MULTIPAY].[Multipay].[Order].[Id] =  '019C051D-677B-70E3-8F5B-A13CE8F0FD4A';


-- ============================================================================

  

  SELECT *
  FROM [DB_MULTIPAY].[Manual].[Payment]
  WHERE [Id] = '5f137f49-046b-4064-b966-d2412f94da50'

  

   SELECT [Id]
      ,[ManualPaymentId]
      ,[IsApproved]
      ,[RequesterId]
      ,[RejectionReason]
      ,[CreatedAt]
  FROM [DB_MULTIPAY].[Manual].[PaymentApproval]
  WHERE [ManualPaymentId] = '5f137f49-046b-4064-b966-d2412f94da50';

  

  -----------------------------------------------------------------------------

  -- DELETAR APROVAÇÃO
  DELETE FROM [DB_MULTIPAY].[Manual].[PaymentApproval]
  WHERE [ManualPaymentId] = '5f137f49-046b-4064-b966-d2412f94da50';



  -- ATUALIZAR DADOS DE PAGAMENTO MANUAL
UPDATE [DB_MULTIPAY].[Manual].[Payment]
SET [StatusId] = 1,
[ApprovedAt] = null
WHERE [Id] = '5f137f49-046b-4064-b966-d2412f94da50';

  

```

  

### 26/02

```sql
  -- ORDEM POR ID

  SELECT [Id]

      ,[SystemId]

      ,[StatusId]

      ,[ReferenceId]

      ,[SubReferenceId]

      ,[RequesterId]

      ,[Amount]

      ,[Discount]

      ,[ExpirationTime]

      ,[CreatedAt]

      ,[UpdatedAt]

  FROM [DB_MULTIPAY].[Multipay].[Order]

  WHERE [DB_MULTIPAY].[Multipay].[Order].[Id] =  '5f137f49-046b-4064-b966-d2412f94da50';

  

-- APPROVAL

    SELECT [Id]

      ,[ManualPaymentId]

      ,[IsApproved]

      ,[RequesterId]

      ,[RejectionReason]

      ,[CreatedAt]

  FROM [DB_MULTIPAY].[Manual].[PaymentApproval]

  

-- MANUAL PAYMENT POR ID DA ORDEM

     SELECT [Id]

      ,[OrderId]

      ,[Amount]

      ,[RequesterId]

      ,[StatusId]

      ,[Reason]

      ,[ApprovedAt]

      ,[CreatedAt]

      ,[UpdatedAt]

  FROM [DB_MULTIPAY].[Manual].[Payment]

  WHERE [OrderId] = '019B28DC-EBCC-78BD-9ED1-804762AC9607'

  

-- MANUAL PAYMENT POR ID

  SELECT *

  FROM [DB_MULTIPAY].[Manual].[Payment]

  WHERE [DB_MULTIPAY].[Manual].[Payment].[Id] = '612EE919-1A8F-433A-B96B-040D7FA33A07'

  

  -- REQUESTER

  SELECT TOP (1000) [Id]

      ,[Name]

      ,[Email]

      ,[CreatedAt]

      ,[UpdatedAt]

  FROM [DB_MULTIPAY].[Multipay].[Requester]

```

  

### 27/02
  

```sql

  SELECT 'MANUAL PAYMENT' as Label, *
  FROM [DB_MULTIPAY].[Manual].[Payment]
  WHERE [OrderId] = '01973645-F4EC-7E4D-9B88-00467D862E93'

  

  SELECT 'MANUAL PAYMENT' as Label, *
  FROM [DB_MULTIPAY].[Manual].[Payment]
  WHERE [Id] = 'b249c02c-24e6-4315-96ca-3d18d6d45431'

  

    SELECT 'ORDER' as Label,

       [Id]

      ,[SystemId]

      ,[StatusId]

      ,[ReferenceId]

      ,[SubReferenceId]

      ,[RequesterId]

      ,[Amount]

      ,[Discount]

      ,[ExpirationTime]

      ,[CreatedAt]

      ,[UpdatedAt]

  FROM [DB_MULTIPAY].[Multipay].[Order]

  WHERE [Id] = '01973645-F4EC-7E4D-9B88-00467D862E93'

  

  UPDATE [DB_MULTIPAY].[Multipay].[Order]

SET [StatusId] = 13,        -- Ajuste para o ID do status 'Pendente' do seu banco

    [UpdatedAt] = GETDATE()    -- Remove a data de aprovação

WHERE [Id] = '01973645-F4EC-7E4D-9B88-00467D862E93'

```

  

```sql

-- 1. Inicia a transação com segurança

BEGIN TRANSACTION;

  

-- Definimos o ID para não ter que digitar várias vezes

DECLARE @TargetManualPaymentId UNIQUEIDENTIFIER = 'b249c02c-24e6-4315-96ca-3d18d6d45431';

  

-- 2. Deleta a aprovação

DELETE FROM [DB_MULTIPAY].[Manual].[PaymentApproval]

WHERE [ManualPaymentId] = @TargetManualPaymentId;

  

-- 3. Atualiza o pagamento manual para o status original (ex: Pendente = 1)

-- E limpa o campo ApprovedAt que você mencionou no C#

UPDATE [DB_MULTIPAY].[Manual].[Payment]

SET [StatusId] = 1,        -- Ajuste para o ID do status 'Pendente' do seu banco

    [ApprovedAt] = NULL    -- Remove a data de aprovação

WHERE [Id] = @TargetManualPaymentId;

  

-- 4. VALIDAÇÃO

-- Verifica se a aprovação sumiu

SELECT 'Aprovação após DELETE' as Label, * FROM [DB_MULTIPAY].[Manual].[PaymentApproval] WHERE [ManualPaymentId] = @TargetManualPaymentId;

  

-- Verifica se o pagamento foi resetado

SELECT 'Pagamento após UPDATE' as Label, [StatusId], [ApprovedAt] FROM [DB_MULTIPAY].[Manual].[Payment] WHERE [Id] = @TargetManualPaymentId;

  

-- 5. CONCLUSÃO (Escolha uma das linhas abaixo e execute individualmente):

-- ROLLBACK; -- Se quiser desfazer tudo (recomendado para testes)

COMMIT;   -- Se quiser salvar as alterações permanentemente

```

  

```sql
BEGIN TRANSACTION;
  

DECLARE @TargetOrderId UNIQUEIDENTIFIER = '01973645-f4ec-7e4d-9b88-00467d862e93';
DECLARE @TargetManualPaymentId UNIQUEIDENTIFIER = 'a5f25ffa-caf9-43fa-ad83-454fafd677d3';

  SELECT 'ORDER' as Label,

       [Id]

      ,[SystemId]

      ,[StatusId]

      ,[ReferenceId]

      ,[SubReferenceId]

      ,[RequesterId]

      ,[Amount]

      ,[Discount]

      ,[ExpirationTime]

      ,[CreatedAt]

      ,[UpdatedAt]

  FROM [DB_MULTIPAY].[Multipay].[Order]

  WHERE [DB_MULTIPAY].[Multipay].[Order].[Id] =  @TargetOrderId;

  

  SELECT 'MANUAL PAYMENT' as Label, *

  FROM [DB_MULTIPAY].[Manual].[Payment]

  WHERE [OrderId] = @TargetOrderId

  

  SELECT 'PAYMENT APPROVAL' as Label, *

  FROM [DB_MULTIPAY].[Manual].[PaymentApproval]

  WHERE [ManualPaymentId] = @TargetManualPaymentId;

  

COMMIT;

```


```
SELECT * 
  FROM [DB_MULTIPAY].[Manual].[Payment]
  WHERE [DB_MULTIPAY].[Manual].[Payment].[OrderId] = '019ce3f4-32a4-7574-bd39-cb4def497cdf'





  SELECT [Id]
      ,[SystemId]
      ,[StatusId]
      ,[ReferenceId]
      ,[SubReferenceId]
      ,[RequesterId]
      ,[Amount]
      ,[Discount]
      ,[ExpirationTime]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [DB_MULTIPAY].[Multipay].[Order]
WHERE [Id] = '019C051D-677B-70E3-8F5B-A13CE8F0FD4A'




  SELECT * 
  FROM [DB_MULTIPAY].[Manual].[Payment]
  WHERE [DB_MULTIPAY].[Manual].[Payment].[Id] = 'b4b48b30-b5b6-4b11-c137-08de5ebb217b'

  
  SELECT [Id]
      ,[ManualPaymentId]
      ,[IsApproved]
      ,[RequesterId]
      ,[RejectionReason]
      ,[CreatedAt]
  FROM [DB_MULTIPAY].[Manual].[PaymentApproval]
  WHERE [ManualPaymentId] = 'b4b48b30-b5b6-4b11-c137-08de5ebb217b'


```