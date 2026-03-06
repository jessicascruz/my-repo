namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;

public class RequesterRequest
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
