namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multipay.Entities.Request;

public sealed class RequesterRequest : IRequesterRequest
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}