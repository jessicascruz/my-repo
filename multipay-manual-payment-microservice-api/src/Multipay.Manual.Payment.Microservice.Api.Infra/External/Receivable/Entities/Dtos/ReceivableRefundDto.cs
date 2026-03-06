namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dtos;

public class ReceivableRefundDto
{
    public Guid Id { get; set; }
    public double Amount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ReceivableRefundRequesterDto Requester { get; set; } = new();
    public ReceivableRefundAcquirerDto Acquirer { get; set; } = new();
}

public class ReceivableRefundRequesterDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class ReceivableRefundAcquirerDto
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public string PaymentId { get; set; } = string.Empty;
    public string RefundId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string StatusDetail { get; set; } = string.Empty;
}