namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;

public class PaymentStatusRequest
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public RequesterRequest? Requester { get; set; } = new();
}