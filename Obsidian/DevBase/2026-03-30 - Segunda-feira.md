### Tarefas:

- [x] Colocar documentação de Manual Payment no Confluence
- [x] Testar cancelar em QA após pipeline
- [x] Colocar em Cancelar, a role de Create
- [ ] Fazer o Read.Me do Manual Payment
- [x] Checklist de coisas a serem alteradas no deploy de Manual Payment para Produção
- [ ] Conferir role de cancelar no Geteway
- [ ] 



---
### Observações:

1. teste


---





---
### Estratégias:






    


---
### Deploy de Manual Payment:

#### 1. Migrações de base de dados:
	-  Manual.PaymentStatus:
		- Pending_Approval (1)
		- Approved (2)
		- Rejected (3)
		- Canceled (4)
	- Manual.Payment
	- Manual.PaymentApproval
	- Manual.PaymentReceipt
2. Estratégias de Rollback
3. Controle de acessos no Keycloak:
	1. `multipay:manual-payment-view`
	2. `multipay:manual-payment-create` 
	3. `multipay:manual-payment-approval`
	4. `multipay-create-manual-payment_policy`
	5. `multipay-view-manual-payment_policy`
	6. `multipay-approval-manual-payment_policy`
4. Bucket AWS
	- `/manual-payment/receipt/{orderId}/{manualPaymentId}/{arquivo}`
5. Conferir AWS S3
6. Validação da existência do status **MANUAL_CONFIRMED**
7. Configuração do Kubernetes

## Tabelas
#### Manual.PaymentStatus

- **Id** (PK, int, não nulo)
- **Description** (nvarchar(100), não nulo)
- **CreatedAt** (datetime2(3), não nulo)
- **UpdatedAt** (datetime2(3), não nulo)

#### Manual.Payment

- **Id** (PK, uniqueidentifier, não nulo)
- **OrderId** (FK, uniqueidentifier, não nulo)
- **Amount** (float, não nulo)
- **RequesterId** (nvarchar(100), não nulo)
- **StatusId** (int, não nulo)
- **Reason** (nvarchar(500), não nulo)
- **ApprovedAt** (datetime2(2), nulo)
- **CreatedAt** (datetime2(3), não nulo)
- **UpdatedAt** (datetime2(3), não nulo)

#### Manual.PaymentApproval

- **Id** (PK, uniqueidentifier, não nulo)
- **ManualPaymentId** (FK, uniqueidentifier, não nulo)
- **IsApproved** (bit, não nulo)
- **RequesterId** (nvarchar(100), não nulo)
- **RejectionReason** (nvarchar(500), nulo)
- **CreatedAt** (datetime2(3), não nulo)

#### Manual.PaymentReceipt

- **Id** (PK, uniqueidentifier, não nulo)
- **ManualPaymentId** (FK, uniqueidentifier, não nulo)
- **DocumentName** (nvarchar(200), não nulo)
- **CreatedAt** (datetime2(3), não nulo)

#### Multipay.Status

- **Id** (PK, int, não nulo)
- **Description** (nvarchar(100), nulo)
- **CreatedAt** (datetime2(3), não nulo)

---

```
CREATE TABLE dbo.Produtos (
    ProdutoID INT IDENTITY(1,1) PRIMARY KEY, -- IDENTITY no SQL Server
    Nome VARCHAR(100) NOT NULL,
    Preco DECIMAL(10, 2) NOT NULL
);
```

    CREATE TABLE [Manual].[PaymentStatus] (




-- CREATE DATABASE testes;
-- USE testes;

-- CREATE SCHEMA [Manual];


CREATE TABLE [Manual].[PaymentStatus] (
        [Id] INT NOT NULL PRIMARY KEY,
        [Description] NVARCHAR(100) NOT NULL,
        [CreatedAt] DATETIME DEFAULT GETDATE() NOT NULL,
        [UpdatedAt] DATETIME NOT NULL,
        
    );


