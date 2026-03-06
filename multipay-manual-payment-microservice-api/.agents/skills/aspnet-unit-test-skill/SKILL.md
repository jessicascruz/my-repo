---
name: aspnet-unit-test-skill
description: Generates comprehensive unit tests for ASP.NET 10 projects with maximum coverage, using NSubstitute mocks, xUnit, Gherkin naming, and AAA organization. Use when you need to create or expand unit tests for services, entities, DTOs, or any class in a .NET microservice project.
---

# ASP.NET 10 Unit Test Skill

Detailed instructions for generating high-coverage, well-structured unit tests in ASP.NET 10 projects following team conventions.

## When to use this skill

- Use this when creating unit tests for a service, handler, repository, or any class in an ASP.NET 10 project
- Use this when expanding test coverage to reach >80% of class properties and related entities
- Use this when tests need mocks for database access, external dependencies, or argument substitution
- Use this when the team requires Gherkin naming conventions and AAA (Arrange / Act / Assert) structure
- Use this when working with `Task<Tuple<T?, ErrorResult>>` return types and NSubstitute mocks

---

## How to use it

### 1. Project & Namespace Convention

All test classes must be placed in the appropriate namespace:

```csharp
namespace Multipay.Receivable.Microservice.Api.Domain.Test.Data.Multipay.Entities.Services;
// or
namespace Multipay.Receivable.Microservice.Api.App.Test.Data.Multipay.Entities.Services;
```

Choose the namespace that matches the layer being tested (Domain vs App).

---

### 2. Dependencies (NuGet packages)

Every test project must reference these packages in the `.csproj`:

```xml
<ItemGroup>
  <PackageReference Include="coverlet.collector" Version="8.0.0">
    <PrivateAssets>all</PrivateAssets>
    <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
  </PackageReference>
  <PackageReference Include="coverlet.msbuild" Version="8.0.0">
    <PrivateAssets>all</PrivateAssets>
    <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
  </PackageReference>
  <PackageReference Include="JunitXml.TestLogger" Version="8.0.0" />
  <PackageReference Include="Microsoft.AspNetCore.Http.Abstractions" Version="2.3.9" />
  <PackageReference Include="Microsoft.NET.Test.Sdk" Version="18.3.0" />
  <PackageReference Include="NSubstitute" Version="5.3.0" />
  <PackageReference Include="xunit" Version="2.9.3" />
  <PackageReference Include="xunit.runner.visualstudio" Version="3.1.5">
    <PrivateAssets>all</PrivateAssets>
    <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
  </PackageReference>
</ItemGroup>
```

---

### 3. Test Naming Convention (Gherkin)

All test methods must follow the Gherkin `Given_When_Then` pattern:

```
Given_[context]_When_[action]_Then_[expectedResult]
```

**Examples:**
```csharp
public async Task Given_ValidPayment_When_ProcessIsCalled_Then_ShouldReturnSuccess()
public async Task Given_InvalidId_When_GetByIdIsCalled_Then_ShouldReturnErrorResult()
public async Task Given_NullEntity_When_SaveIsCalled_Then_ShouldReturnError()
```

---

### 4. AAA (Arrange / Act / Assert) Organization

Every test **must** be structured with the three sections, clearly commented:

```csharp
[Fact]
public async Task Given_ValidInput_When_ExecuteIsCalled_Then_ShouldReturnSuccess()
{
    // Arrange
    var mockDependency = Substitute.For<IMyDependency>();
    var input = MockData.GetMockMyEntity();
    mockDependency.DoSomething(Arg.Any<MyEntity>())
        .Returns(Task.FromResult(Tuple.Create<MyEntity?, ErrorResult>(input, new ErrorResult())));

    var service = new MyService(mockDependency);

    // Act
    var result = await service.Execute(input);

    // Assert
    Assert.NotNull(result.Item1);
    Assert.Equivalent(new ErrorResult(), result.Item2);
}
```

---

### 5. Mocking Rules

#### 5.1 Entities and Interfaces — use `Substitute.For<T>`
```csharp
var mockRepository = Substitute.For<IMyRepository>();
var mockEntity = Substitute.For<MyEntity>();
```

#### 5.2 Method arguments — always use `Arg.Any<T>()`
```csharp
mockRepository.GetById(Arg.Any<int>())
    .Returns(Task.FromResult(entity));
```

> ⚠️ **Never** pass concrete values in mock argument matchers. Always use `Arg.Any<T>()`.

#### 5.3 Async methods returning `Task<T>`
```csharp
mockService.GetAsync(Arg.Any<int>())
    .Returns(Task.FromResult(myObject));
```

#### 5.4 Async methods returning `Task<Tuple<T?, ErrorResult>>`
```csharp
mockService.ExecuteAsync(Arg.Any<MyEntity>())
    .Returns(Task.FromResult(Tuple.Create<MyEntity?, ErrorResult>(myEntity, new ErrorResult())));
```

#### 5.5 Asserting empty `ErrorResult` (success case)
```csharp
Assert.Equivalent(new ErrorResult(), result.Item2);
```

#### 5.6 Context — no mock needed when third constructor argument is `true`
```csharp
var context = new MyDbContext(options, schema, true); // true = in-memory / test mode, no mock needed
```

---

### 6. MockData Class Convention

Use a centralized `MockData` static class to provide all test data. **Never** instantiate test data inline in test methods.

**Naming pattern:** `MockData.GetMock{ClassName}()`

```csharp
public static class MockData
{
    public static MyEntity GetMockMyEntity() => new MyEntity
    {
        Id = 1,
        Name = "Test Entity",
        Status = EntityStatus.Active,
        CreatedAt = DateTime.UtcNow,
        // All properties must be filled
    };

    public static MyDto GetMockMyDto() => new MyDto
    {
        Id = 1,
        Name = "Test DTO",
        // All properties must be filled
    };
}
```

> ⚠️ **All** properties of the class must be populated in the mock. Partial mocks are not acceptable.

---

### 7. Coverage Requirements

- **>80%** of all properties of the class under test and its **first-degree related entities** must be exercised across tests
- **100%** of `EnvironmentKey` class properties must be assigned with a constant value
- **Every** related entity must have at least one test covering it
- DTO conversion tests are **only** required if the DTO has an explicit conversion method (e.g., `ToEntity()`, `FromEntity()`)
- Do **not** write trivial tests that only validate object construction without exercising behavior

---

### 8. Test Structure Template

```csharp
using NSubstitute;
using Xunit;
// ... other usings

namespace Multipay.Receivable.Microservice.Api.App.Test.Data.Multipay.Entities.Services;

public class MyServiceTests
{
    private readonly IMyDependency _mockDependency;
    private readonly MyService _service;

    public MyServiceTests()
    {
        _mockDependency = Substitute.For<IMyDependency>();
        _service = new MyService(_mockDependency);
    }

    #region Success Scenarios

    [Fact]
    public async Task Given_ValidEntity_When_CreateIsCalled_Then_ShouldReturnCreatedEntity()
    {
        // Arrange
        var entity = MockData.GetMockMyEntity();
        _mockDependency.SaveAsync(Arg.Any<MyEntity>())
            .Returns(Task.FromResult(Tuple.Create<MyEntity?, ErrorResult>(entity, new ErrorResult())));

        // Act
        var result = await _service.Create(entity);

        // Assert
        Assert.NotNull(result.Item1);
        Assert.Equal(entity.Id, result.Item1!.Id);
        Assert.Equal(entity.Name, result.Item1.Name);
        Assert.Equal(entity.Status, result.Item1.Status);
        Assert.Equivalent(new ErrorResult(), result.Item2);
    }

    #endregion

    #region Error Scenarios

    [Fact]
    public async Task Given_NullEntity_When_CreateIsCalled_Then_ShouldReturnError()
    {
        // Arrange
        var expectedError = new ErrorResult { Code = "ERR001", Message = "Entity is null" };
        _mockDependency.SaveAsync(Arg.Any<MyEntity>())
            .Returns(Task.FromResult(Tuple.Create<MyEntity?, ErrorResult>(null, expectedError)));

        // Act
        var result = await _service.Create(null);

        // Assert
        Assert.Null(result.Item1);
        Assert.NotNull(result.Item2);
        Assert.Equal(expectedError.Code, result.Item2.Code);
    }

    #endregion
}
```

---

### 9. Related Entities Coverage

When the class under test has first-degree related entities (e.g., `Order` has `OrderItems`, `Payment` has `PaymentMethod`):

- Use the related entity's `MockData.GetMock{RelatedEntity}()` to populate data
- Assert properties of the related entity in at least one test
- Example:

```csharp
[Fact]
public async Task Given_ValidOrder_When_ProcessIsCalled_Then_ShouldReturnOrderWithItems()
{
    // Arrange
    var order = MockData.GetMockOrder(); // includes OrderItems populated
    _mockOrderRepository.GetByIdAsync(Arg.Any<int>())
        .Returns(Task.FromResult(order));

    // Act
    var result = await _orderService.Process(order.Id);

    // Assert
    Assert.NotNull(result);
    Assert.NotEmpty(result.OrderItems); // related entity coverage
    Assert.Equal(order.OrderItems.First().ProductId, result.OrderItems.First().ProductId);
}
```

---

### 10. EnvironmentKey Coverage

If the class involves `EnvironmentKey`, ensure **100%** of its properties are set with constants:

```csharp
public static class MockEnvironmentKey
{
    public const string ApiKey       = "test-api-key-123";
    public const string BaseUrl      = "https://test.api.example.com";
    public const string Timeout      = "30";
    public const string DatabaseName = "TestDatabase";
    // Every property in EnvironmentKey must have a corresponding constant here
}
```

---

### 11. Checklist before submitting tests

- [ ] All test methods follow `Given_When_Then` Gherkin naming
- [ ] All tests use AAA structure with `// Arrange`, `// Act`, `// Assert` comments
- [ ] All mocked interfaces use `Substitute.For<T>()`
- [ ] All mock method arguments use `Arg.Any<T>()`
- [ ] All async mocks use `Returns(Task.FromResult(...))`
- [ ] All `Tuple<T?, ErrorResult>` mocks use `Tuple.Create<T?, ErrorResult>(value, value)`
- [ ] All success assertions on `ErrorResult` use `Assert.Equivalent(new ErrorResult(), result.Item2)`
- [ ] All test data comes from `MockData.GetMock{ClassName}()`
- [ ] `MockData` methods populate **all** properties of the class
- [ ] >80% of class and first-degree related entity properties are covered
- [ ] Every related entity has at least one test
- [ ] `EnvironmentKey` properties are 100% covered with constants
- [ ] DTO conversion tests exist **only** if a conversion method is present
- [ ] Namespace matches the correct layer (`Domain.Test` or `App.Test`)
- [ ] DbContext is not mocked when third constructor argument is `true`
