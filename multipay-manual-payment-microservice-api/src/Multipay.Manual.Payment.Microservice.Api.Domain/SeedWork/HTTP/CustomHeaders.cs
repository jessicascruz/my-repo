namespace Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP;

public class CustomHeaders
{
    public Dictionary<string, string>? Headers { get; set; }
    public string GatewayToken { get; set; } = string.Empty;
    public string AuthorizationOrdinaryToken { get; set; } = string.Empty;

}
