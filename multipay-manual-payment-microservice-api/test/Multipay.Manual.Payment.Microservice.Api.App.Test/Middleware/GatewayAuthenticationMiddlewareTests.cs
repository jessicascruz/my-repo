using Multipay.Manual.Payment.Microservice.Api.App.Middleware;
using System.Reflection;

namespace Multipay.Manual.Payment.Microservice.Api.App.Test.Middleware;

public class GatewayAuthenticationMiddlewareTests
{
    [Fact]
    public void Given_Middleware_When_Instantiated_Then_ShouldInitializeRoutesWithoutAuthentication()
    {
        // Arrange
        var middleware = new GatewayAuthenticationMiddleware();

        // Act
        var field = typeof(GatewayAuthenticationMiddleware)
            .GetField("_routesWithoutAuthentication", BindingFlags.NonPublic | BindingFlags.Instance);
        var routes = field!.GetValue(middleware) as List<string>;

        // Assert
        Assert.NotNull(routes);
        Assert.Single(routes!);
        Assert.Equal("/health", routes[0]);
    }
}
