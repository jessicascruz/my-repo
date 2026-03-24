namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;

public class ManualPaymentResponse
{

    public Guid Id { get; set; }

    public Guid OrderId { get; set; }

    public double Amount { get; set; }

    public string Reason { get; set; } = string.Empty;

    public DateTime? ApprovedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public RequesterResponse Requester { get; set; } = new();

    public PaymentStatusResponse Status { get; set; } = new PaymentStatusResponse();

    public List<PaymentApprovalResponse> Approvals { get; set; } = new List<PaymentApprovalResponse>();

    public List<PaymentReceiptResponse> Receipts { get; set; } = new List<PaymentReceiptResponse>();

}
public class PaymentApprovalResponse
{
    public Guid Id { get; set; }

    public Guid ManualPaymentId { get; set; }

    public bool IsApproved { get; set; }

    public string? RequesterId { get; set; }

    public string? RejectionReason { get; set; }

    public DateTime CreatedAt { get; set; }

    public RequesterResponse? Requester { get; set; }

}

public class PaymentStatusResponse
{
    public int Id { get; set; }

    public string Description { get; set; } = string.Empty;

}

public class RequesterResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}


