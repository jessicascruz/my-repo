using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multipay.Entities.Request;
using Newtonsoft.Json;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;

public sealed class StatusRequest
{
    public string Event { get; set; }
    public string SubEvent { get; set; }
    public int? AcquirerId { get; set; }
    public int? MethodId { get; set; }
    public RequesterRequest? Requester { get; set; }
}
