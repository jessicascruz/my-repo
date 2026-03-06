using Microsoft.Extensions.Logging;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog.Entities;
using NSubstitute;
using System.Net;
using System.Text;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.External.Multilog;

public class MultilogDaoBranchesTests
{
    [Fact]
    public async Task Given_LoginNonSuccessOrEmptyOrException_When_LoginIsCalled_Then_ShouldReturnDefaultTokenDto()
    {
        // Arrange
        var logger = Substitute.For<ILogger<MultilogDao>>();
        var env = new EnvironmentKey
        {
            MultilogInformation = new EnvironmentKey.Multilog { Endpoint = "https://multilog.local" }
        };

        var requestNonSuccess = Substitute.For<IRequestWithoutLog>();
        requestNonSuccess.PostJsonAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CustomHeaders>(), Arg.Any<object>())
            .Returns(Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent("bad", Encoding.UTF8, "application/json")
            }));

        var requestEmpty = Substitute.For<IRequestWithoutLog>();
        requestEmpty.PostJsonAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CustomHeaders>(), Arg.Any<object>())
            .Returns(Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(string.Empty, Encoding.UTF8, "application/json")
            }));

        var requestThrows = Substitute.For<IRequestWithoutLog>();
        requestThrows.PostJsonAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CustomHeaders>(), Arg.Any<object>())
            .Returns<Task<HttpResponseMessage>>(_ => throw new Exception("boom"));

        // Act
        var resultNonSuccess = await new MultilogDao(requestNonSuccess, logger, env).Login(new LoginDto());
        var resultEmpty = await new MultilogDao(requestEmpty, logger, env).Login(new LoginDto());
        var resultException = await new MultilogDao(requestThrows, logger, env).Login(new LoginDto());

        // Assert
        Assert.Equal(default, resultNonSuccess.Token);
        Assert.Equal(default, resultEmpty.Token);
        Assert.Equal(default, resultException.Token);
    }

    [Fact]
    public async Task Given_InsertNonSuccessOrException_When_InsertIsCalled_Then_ShouldNotThrow()
    {
        // Arrange
        var logger = Substitute.For<ILogger<MultilogDao>>();
        var env = new EnvironmentKey
        {
            MultilogInformation = new EnvironmentKey.Multilog { Endpoint = "https://multilog.local" }
        };

        var requestNonSuccess = Substitute.For<IRequestWithoutLog>();
        requestNonSuccess.PostJsonAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CustomHeaders>(), Arg.Any<object>())
            .Returns(Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent("error", Encoding.UTF8, "application/json")
            }));

        var requestThrows = Substitute.For<IRequestWithoutLog>();
        requestThrows.PostJsonAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CustomHeaders>(), Arg.Any<object>())
            .Returns<Task<HttpResponseMessage>>(_ => throw new Exception("boom"));

        var dto = new MultilogDto
        {
            System = "s",
            Type = "create",
            Reference = "r",
            ReferenceType = "t",
            CauserId = "1",
            CauserName = "n",
            Properties = new PropertiesDto { Request = "req", Response = "res" }
        };

        // Act
        await new MultilogDao(requestNonSuccess, logger, env).Insert(dto, "token");
        await new MultilogDao(requestThrows, logger, env).Insert(dto, "token");

        // Assert
        Assert.True(true);
    }
}
