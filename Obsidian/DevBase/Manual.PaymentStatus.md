
```
- **Id** (PK, int, não nulo)
- **Description** (nvarchar(100), não nulo)
- **CreatedAt** (datetime2(3), não nulo)
- **UpdatedAt** (datetime2(3), não nulo)
```

CREATE

```

-- Garante que o Schema existe
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'Manual')
BEGIN
    EXEC('CREATE SCHEMA [Manual]');
END
GO

-- Criação da Tabela
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Manual].[PaymentStatus]') AND type in (N'U'))
BEGIN
    CREATE TABLE [Manual].[PaymentStatus] (
        [Id] INT NOT NULL,
        [Description] NVARCHAR(100) NOT NULL,
        [CreatedAt] DATETIME2(3) NOT NULL,
        [UpdatedAt] DATETIME2(3) NOT NULL,
        
        -- Chave Primária
        CONSTRAINT [PK_PaymentStatus] PRIMARY KEY CLUSTERED ([Id] ASC)
    );

    -- Opcional: Adiciona valores padrão para as datas se desejar automação
    -- ALTER TABLE [Manual].[PaymentStatus] ADD CONSTRAINT DF_PaymentStatus_CreatedAt DEFAULT (GETDATE()) FOR [CreatedAt];
END
GO

```


ROLLBACK


```
-- Verifica se a tabela existe antes de deletar
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Manual].[PaymentStatus]') AND type in (N'U'))
BEGIN
    DROP TABLE [Manual].[PaymentStatus];
END
GO

-- Opcional: Remover o Schema se ele estiver vazio e não for mais necessário
-- IF NOT EXISTS (SELECT * FROM sys.objects WHERE schema_id = SCHEMA_ID('Manual'))
-- BEGIN
--     DROP SCHEMA [Manual];
-- END
-- GO
```
