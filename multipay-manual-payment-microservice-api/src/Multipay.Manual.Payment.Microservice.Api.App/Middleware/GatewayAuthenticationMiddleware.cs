namespace Multipay.Manual.Payment.Microservice.Api.App.Middleware;

public sealed class GatewayAuthenticationMiddleware()
{
    private readonly List<string> _routesWithoutAuthentication = ["/health"];
}
