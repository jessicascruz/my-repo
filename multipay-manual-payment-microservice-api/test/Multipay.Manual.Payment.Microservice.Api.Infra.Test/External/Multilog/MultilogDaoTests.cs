using Microsoft.Extensions.Logging;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog.Entities;
using NSubstitute;
using System.Net;
using System.Text;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.External.Multilog;

public class MultilogDaoTests
{
    [Fact]
    public async Task Given_ValidLoginResponse_When_LoginIsCalled_Then_ShouldDeserializeTokenDto()
    {
        // Arrange
        var request = Substitute.For<IRequestWithoutLog>();
        var logger = Substitute.For<ILogger<MultilogDao>>();
        var env = new EnvironmentKey
        {
            MultilogInformation = new EnvironmentKey.Multilog { Endpoint = "https://multilog.local" }
        };

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("{\"token\":\"abc\",\"refreshToken\":\"r\",\"expiresIn\":120,\"user\":{\"id\":\"1\",\"name\":\"n\",\"username\":\"u\"},\"roles\":[\"admin\"]}", Encoding.UTF8, "application/json")
        };

        request.PostJsonAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CustomHeaders>(), Arg.Any<object>())
            .Returns(Task.FromResult(response));

        var dao = new MultilogDao(request, logger, env);

        // Act
        var token = await dao.Login(new LoginDto { Username = "u", Password = "p" });

        // Assert
        Assert.Equal("abc", token.Token);
        Assert.Equal("u", token.User.Username);
        Assert.Single(token.Roles);
    }

    [Fact]
    public async Task Given_InsertRequest_When_InsertIsCalled_Then_ShouldCallRequestWithAuthorizationHeader()
    {
        // Arrange
        var request = Substitute.For<IRequestWithoutLog>();
        var logger = Substitute.For<ILogger<MultilogDao>>();
        var env = new EnvironmentKey
        {
            MultilogInformation = new EnvironmentKey.Multilog { Endpoint = "https://multilog.local" }
        };

        request.PostJsonAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CustomHeaders>(), Arg.Any<object>())
            .Returns(Task.FromResult(new HttpResponseMessage(HttpStatusCode.Created)
            {
                Content = new StringContent("{}", Encoding.UTF8, "application/json")
            }));

        var dao = new MultilogDao(request, logger, env);

        // Act
        await dao.Insert(new MultilogDto
        {
            System = "system",
            Type = "create",
            Reference = "ref",
            ReferenceType = "order",
            CauserId = "1",
            CauserName = "name",
            Properties = new PropertiesDto { Request = "r", Response = "s" }
        }, "token-123");

        // Assert
        await request.Received(1).PostJsonAsync(
            "https://multilog.local",
            "v1/activities",
            Arg.Is<CustomHeaders>(x => x.AuthorizationOrdinaryToken == "token-123"),
            Arg.Any<object>());
    }
}
