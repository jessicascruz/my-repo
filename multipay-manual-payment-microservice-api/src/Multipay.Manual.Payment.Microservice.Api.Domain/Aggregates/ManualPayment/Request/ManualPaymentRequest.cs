using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;

public class ManualPaymentRequest
{
    public Guid OrderId { get; set; }
    public string Reference { get; set; } = string.Empty;
    public string SubReference { get; set; } = string.Empty;
    public double Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public RequesterRequest? Requester { get; set; } = new();
    public List<PaymentApprovalResponse> Approvals { get; set; } = null!;

}

