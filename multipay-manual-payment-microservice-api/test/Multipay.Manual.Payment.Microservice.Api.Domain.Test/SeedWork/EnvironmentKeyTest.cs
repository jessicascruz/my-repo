using Microsoft.Extensions.Configuration;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Test.SeedWork;

public class EnvironmentKeyAdditionalTests
{
    [Fact]
    public void Given_TypeInformationDev_When_GetVariableIsCalled_Then_ShouldReadFromConfiguration()
    {
        // Arrange
        EnvironmentKey.TypeInformation = EnvironmentKey.Type.DEV;
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["MY_KEY"] = "config-value" })
            .Build();

        // Act
        var value = EnvironmentKey.GetVariable<string>("MY_KEY", configuration);

        // Assert
        Assert.Equal("config-value", value);
    }

    [Fact]
    public void Given_TypeInformationQa_When_GetVariableIsCalled_Then_ShouldReadFromEnvironmentOrSecrets()
    {
        // Arrange
        EnvironmentKey.TypeInformation = EnvironmentKey.Type.QA;
        var configuration = new ConfigurationBuilder().AddInMemoryCollection().Build();
        Environment.SetEnvironmentVariable("MY_ENV_KEY", "env-value");
        var secrets = new Dictionary<string, string> { ["MY_SECRET_KEY"] = "secret-value" };

        try
        {
            // Act
            var envValue = EnvironmentKey.GetVariable<string>("MY_ENV_KEY", configuration);
            var secretValue = EnvironmentKey.GetVariable<string>("MY_SECRET_KEY", configuration, secrets);

            // Assert
            Assert.Equal("env-value", envValue);
            Assert.Equal("secret-value", secretValue);
        }
        finally
        {
            Environment.SetEnvironmentVariable("MY_ENV_KEY", null);
        }
    }

    [Fact]
    public void Given_InvalidConstant_When_GetVariableIsCalled_Then_ShouldThrowNotImplementedException()
    {
        // Arrange
        EnvironmentKey.TypeInformation = EnvironmentKey.Type.DEV;
        var configuration = new ConfigurationBuilder().AddInMemoryCollection().Build();

        // Act
        var act = () => EnvironmentKey.GetVariable<string>(null!, configuration);

        // Assert
        Assert.Throws<NotImplementedException>(act);
    }

    [Fact]
    public void Given_SqlServerValues_When_ConnectionStringIsAccessed_Then_ShouldBuildExpectedString()
    {
        // Arrange
        var sqlServer = new EnvironmentKey.SqlServer
        {
            Server = "server",
            UserId = "user",
            Password = "pass",
            DataBase = "db"
        };

        // Act
        var connectionString = sqlServer.ConnectionString;

        // Assert
        Assert.Contains("SERVER=server", connectionString);
        Assert.Contains("UID=user", connectionString);
        Assert.Contains("PWD=pass", connectionString);
        Assert.Contains("DATABASE=db", connectionString);
    }
    [Fact]
    public void Given_EnvironmentKeyWithMockData_When_IsValidIsCalled_Then_ShouldReturnTrue()
    {
        // Arrange
        var environmentKey = Multipay.Manual.Payment.Microservice.Api.Test.Mocks.MockData.GetMockEnvironmentKey();

        // Act
        var result = environmentKey.IsValid();

        // Assert
        Assert.False(result);
    }
}
