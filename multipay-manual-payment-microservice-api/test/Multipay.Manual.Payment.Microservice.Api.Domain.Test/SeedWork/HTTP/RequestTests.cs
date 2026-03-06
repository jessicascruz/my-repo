using Microsoft.Extensions.Logging;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Contexts;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP;
using NSubstitute;
using System.Net;
using System.Text;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Test.SeedWork.HTTP;

public class RequestTests
{
    [Fact]
    public async Task Given_ValidInputs_When_GetAsyncIsCalled_Then_ShouldReturnResponseAndLogToMultilog()
    {
        // Arrange
        var handler = new FakeHttpMessageHandler(_ => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("ok", Encoding.UTF8, "application/json")
        }));
        var httpClient = new HttpClient(handler);
        var logger = Substitute.For<ILogger<Request>>();
        var multilog = Substitute.For<IMultilogService>();
        var logContext = new LogContext { CauserId = "1", CauserName = "Tester", Reference = "ref" };
        var request = new Request(httpClient, logger, multilog, logContext);

        // Act
        var response = await request.GetAsync("https://server", "route", new CustomHeaders
        {
            GatewayToken = "gateway",
            Headers = new Dictionary<string, string> { ["x-test"] = "v" }
        }, "a=1");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await multilog.Received(1).InsertAsync(Arg.Any<Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog.Entities.MultilogPayload>());
    }

    [Fact]
    public async Task Given_ValidInputs_When_PostAsyncAndPatchAsyncAreCalled_Then_ShouldReturnResponse()
    {
        // Arrange
        var handler = new FakeHttpMessageHandler(_ => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("ok", Encoding.UTF8, "application/json")
        }));
        var httpClient = new HttpClient(handler);
        var logger = Substitute.For<ILogger<Request>>();
        var multilog = Substitute.For<IMultilogService>();
        var logContext = new LogContext();
        var request = new Request(httpClient, logger, multilog, logContext);

        // Act
        var postResponse = await request.PostAsync("https://server", "route", new CustomHeaders { GatewayToken = "gw" }, new { Name = "Item" });
        var patchResponse = await request.PatchAsync("https://server", "route", new CustomHeaders { GatewayToken = "gw" }, new { Name = "Item" });

        // Assert
        Assert.Equal(HttpStatusCode.OK, postResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, patchResponse.StatusCode);
    }

    [Fact]
    public async Task Given_RequestWithoutLog_When_GetAndPostJsonAreCalled_Then_ShouldReturnResponse()
    {
        // Arrange
        var handler = new FakeHttpMessageHandler(_ => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("ok", Encoding.UTF8, "application/json")
        }));
        var httpClient = new HttpClient(handler);
        var logger = Substitute.For<ILogger<RequestWithoutLog>>();
        var request = new RequestWithoutLog(httpClient, logger);

        // Act
        var getResponse = await request.GetAsync("https://server", "route", new CustomHeaders { GatewayToken = "gw", AuthorizationOrdinaryToken = "auth" }, "x=1");
        var postResponse = await request.PostJsonAsync("https://server", "route", new CustomHeaders { GatewayToken = "gw" }, new { A = 1 });

        // Assert
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, postResponse.StatusCode);
    }

    private sealed class FakeHttpMessageHandler(Func<HttpRequestMessage, Task<HttpResponseMessage>> responder) : HttpMessageHandler
    {
        private readonly Func<HttpRequestMessage, Task<HttpResponseMessage>> _responder = responder;

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            => _responder(request);
    }
}

