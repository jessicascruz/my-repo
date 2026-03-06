namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;

public sealed class StatusRequest
{
    public string Event { get; set; } = string.Empty;
    public string SubEvent { get; set; } = string.Empty;
    public int? AcquirerId { get; set; }
    public int? MethodId { get; set; }
}
