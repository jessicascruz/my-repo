---

name: dotnet-ddd-multipay

description: Especialista na arquitetura DDD Multipay para microserviços .NET. Use para criar novos microserviços, aggregates, repositories ou serviços seguindo o padrão de camadas App, Domain e Infra, com tratamento de erro via Tuple<T?, ErrorResult> e mapeamentos explícitos ToDomain/FromDomain.

---


# DotNet DDD Multipay Skill

  

Este guia define o padrão arquitetural para microserviços na Multipay, focado em Domain-Driven Design (DDD) e C# moderno.

  

## 🏗️ Estrutura de Camadas

  

O projeto deve seguir rigorosamente a separação em três projetos principais:

  

1.  **App**: Camada de entrada (API). Contém Endpoints, Middlewares e Extensions de inicialização.

2.  **Domain**: Core do microserviço. Contém Aggregates (Entidades, Requests, Responses), Interfaces de Repositório/Serviço, Enums e `SeedWork`.

3.  **Infra**: Implementação técnica. Contém Repositories, DAOs (Data Access Objects), integração com Bancos de Dados (EF Core) e serviços externos (AWS, Multilog).

  

## 🧩 Padrões de Código

  

### 1. Tratamento de Erros (Result Pattern)

Não use exceções para lógica de negócio. Utilize o padrão de retorno `Tuple<T?, ErrorResult>`.

  

```csharp

public async Task<Tuple<MyResponse?, ErrorResult>> DoSomethingAsync(MyRequest request)

{

    if (invalid)

        return new(null, new ErrorResult { Error = true, Message = "Erro", StatusCode = ErrorCode.BadRequest });

  

    return new(new MyResponse(), new());

}

```

  

### 2. Primary Constructors (C# 12)

Sempre prefira Primary Constructors para Injeção de Dependência:

  

```csharp

public class MyService(ILogger<MyService> logger, IMyRepository repository) : IMyService

{

    private readonly ILogger<MyService> _logger = logger;

    private readonly IMyRepository _repository = repository;

}

```

  

### 3. Mapeamento de Objetos (Mappers)

Evite AutoMapper. Use extensões explícitas `ToDomain()` e `FromDomain()` para converter entre DTOs/DAOs e objetos de Domínio.

- `FromDomain`: Converte Domain Request -> DTO/DAO (Infra).

- `ToDomain`: Converte DTO/DAO (Infra) -> Domain Response.

  

### 4. Configuração e Variáveis

Use a classe `EnvironmentKey` para centralizar todas as configurações, injetando-a onde necessário. Segredos devem vir do AWS Secret Manager via `AwsService`.

  

## 🛠️ Fluxo de Desenvolvimento

  

Ao criar um novo recurso (ex: "Processamento de Reembolso"):

  

1.  **Domain**:

    - Crie a pasta `Aggregates/Refund`.

    - Defina `RefundRequest`, `RefundResponse`.

    - Crie `IRefundService` e `IRefundRepository`.

2.  **Infra**:

    - Implemente `RefundRepository` usando um DAO.

    - Crie extensões de mapeamento em `Data/Refund/Extensions`.

3.  **App**:

    - Crie o Endpoint em `Extensions/Endpoints.cs`.

    - Registre as dependências em `Extensions/Services.cs`.

4.  **Tests**:

    - Crie testes unitários para o Serviço no projeto `Domain.Test`.

    - Crie testes de cobertura para o Repositório no projeto `Infra.Test`.

  

## 🧪 Estratégia de Testes

- **Mocks**: Centralize dados de teste em um projeto `Test.Mocks` usando a classe `MockData`.

- **Naming**: Use `MethodName_StateUnderTest_ExpectedBehavior`.