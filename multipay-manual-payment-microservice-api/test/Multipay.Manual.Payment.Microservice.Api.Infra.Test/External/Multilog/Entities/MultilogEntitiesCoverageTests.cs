using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog.Entities;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog.Entities;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.External.Multilog.Entities;

public class MultilogEntitiesCoverageTests
{
    [Fact]
    public void Given_Login_When_ConvertFromLoginIsCalled_Then_ShouldMapProperties()
    {
        // Arrange
        var login = new Login { Username = "user", Password = "pass" };

        // Act
        var loginDto = LoginDto.ConvertFromLogin(login);

        // Assert
        Assert.Equal("user", loginDto.Username);
        Assert.Equal("pass", loginDto.Password);
    }

    [Fact]
    public void Given_UserDto_When_ConvertToUserIsCalled_Then_ShouldMapProperties()
    {
        // Arrange
        var dto = new UserDto { Id = "1", Name = "Name", Username = "username" };

        // Act
        var result = UserDto.ConvertToUser(dto);

        // Assert
        Assert.Equal(dto.Id, result.Id);
        Assert.Equal(dto.Name, result.Name);
        Assert.Equal(dto.Username, result.Username);
    }

    [Fact]
    public void Given_TokenDto_When_ConvertToTokenIsCalled_Then_ShouldMapProperties()
    {
        // Arrange
        var dto = new TokenDto
        {
            Token = "token",
            RefreshToken = "refresh",
            ExpiresIn = 3600,
            User = new UserDto { Id = "1", Name = "Name", Username = "username" },
            Roles = new List<string> { "admin" }
        };

        // Act
        var result = TokenDto.ConvertToToken(dto);

        // Assert
        Assert.Equal(dto.Token, result.AccessToken);
        Assert.Equal(dto.RefreshToken, result.RefreshToken);
        Assert.Equal(dto.ExpiresIn, result.ExpiresIn);
        Assert.Equal(dto.User.Username, result.User.Username);
        Assert.Equal(dto.Roles, result.Roles);
    }

    [Fact]
    public void Given_MultilogPayload_When_MapToMultilogDtoIsCalled_Then_ShouldMapProperties()
    {
        // Arrange
        var payload = new MultilogPayload
        {
            System = "manual-payment",
            Type = SystemType.Create,
            Reference = "ref",
            ReferenceType = "order",
            CauserId = "1",
            CauserName = "tester",
            Properties = new Properties { Request = "request", Response = "response" }
        };

        // Act
        var result = payload.MapToMultilogDto();

        // Assert
        Assert.Equal(payload.System, result.System);
        Assert.Equal("create", result.Type);
        Assert.Equal(payload.Reference, result.Reference);
        Assert.Equal(payload.CauserId, result.CauserId);
        Assert.Equal("request", result.Properties.Request);
    }

    [Fact]
    public void Given_MultilogDto_When_MapToMultilogIsCalled_Then_ShouldMapProperties()
    {
        // Arrange
        var dto = new MultilogDto
        {
            System = "manual-payment",
            Type = "create",
            Reference = "ref",
            ReferenceType = "order",
            CauserId = "1",
            CauserName = "tester",
            Properties = new PropertiesDto { Request = "request", Response = "response" }
        };

        // Act
        var result = dto.MapToMultilog();

        // Assert
        Assert.Equal(dto.System, result.System);
        Assert.Equal(SystemType.Create, result.Type);
        Assert.Equal(dto.ReferenceType, result.ReferenceType);
        Assert.Equal("response", result.Properties.Response);
    }
}
