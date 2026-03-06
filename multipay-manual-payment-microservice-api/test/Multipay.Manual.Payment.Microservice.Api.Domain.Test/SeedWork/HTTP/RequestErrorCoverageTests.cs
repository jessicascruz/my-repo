using Microsoft.Extensions.Logging;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Contexts;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP;
using NSubstitute;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Test.SeedWork.HTTP;

public class RequestErrorCoverageTests
{
    [Fact]
    public async Task Given_RequestAndHandlerThrows_When_MethodsAreCalled_Then_ShouldReturnEmptyHttpResponseMessage()
    {
        // Arrange
        var throwingHandler = new ThrowingHttpMessageHandler();
        var httpClient = new HttpClient(throwingHandler);
        var request = new Request(
            httpClient,
            Substitute.For<ILogger<Request>>(),
            Substitute.For<IMultilogService>(),
            new LogContext());

        // Act
        var get = await request.GetAsync("https://server", "route", new CustomHeaders(), "a=1");
        var post = await request.PostAsync("https://server", "route", new CustomHeaders(), new { A = 1 });
        var patch = await request.PatchAsync("https://server", "route", new CustomHeaders(), new { A = 1 });

        // Assert
        Assert.NotNull(get);
        Assert.NotNull(post);
        Assert.NotNull(patch);
    }

    [Fact]
    public async Task Given_PostAsyncWithNullBody_When_Called_Then_ShouldReturnResponse()
    {
        // Arrange
        var handler = new SuccessHttpMessageHandler();
        var request = new Request(
            new HttpClient(handler),
            Substitute.For<ILogger<Request>>(),
            Substitute.For<IMultilogService>(),
            new LogContext());

        // Act
        var response = await request.PostAsync("https://server", "route", new CustomHeaders(), null);

        // Assert
        Assert.True(response.IsSuccessStatusCode);
    }

    [Fact]
    public async Task Given_RequestWithoutLogAndHandlerThrows_When_MethodsAreCalled_Then_ShouldReturnEmptyHttpResponseMessage()
    {
        // Arrange
        var request = new RequestWithoutLog(new HttpClient(new ThrowingHttpMessageHandler()), Substitute.For<ILogger<RequestWithoutLog>>());

        // Act
        var get = await request.GetAsync("https://server", "route", new CustomHeaders(), "a=1");
        var post = await request.PostJsonAsync("https://server", "route", new CustomHeaders(), new { A = 1 });

        // Assert
        Assert.NotNull(get);
        Assert.NotNull(post);
    }

    [Fact]
    public async Task Given_RequestWithoutLogPostJsonWithNullBody_When_Called_Then_ShouldReturnResponse()
    {
        // Arrange
        var request = new RequestWithoutLog(new HttpClient(new SuccessHttpMessageHandler()), Substitute.For<ILogger<RequestWithoutLog>>());

        // Act
        var response = await request.PostJsonAsync("https://server", "route", new CustomHeaders(), null);

        // Assert
        Assert.True(response.IsSuccessStatusCode);
    }

    private sealed class SuccessHttpMessageHandler : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            => Task.FromResult(new HttpResponseMessage(System.Net.HttpStatusCode.OK));
    }

    private sealed class ThrowingHttpMessageHandler : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            => throw new HttpRequestException("forced failure");
    }
}
