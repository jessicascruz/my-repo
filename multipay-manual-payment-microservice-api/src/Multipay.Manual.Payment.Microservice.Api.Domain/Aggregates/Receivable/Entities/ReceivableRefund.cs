namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;

public class ReceivableRefund
{
    public Guid Id { get; set; }
    public double Amount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ReceivableRefundRequester Requester { get; set; } = new();
    public ReceivableRefundAcquirer Acquirer { get; set; } = new();
}

public class ReceivableRefundRequester
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class ReceivableRefundAcquirer
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public string PaymentId { get; set; } = string.Empty;
    public string RefundId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string StatusDetail { get; set; } = string.Empty;
}