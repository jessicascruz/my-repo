namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;

public class ReceivableResponse
{
    public Guid Id { get; set; }
    public string ReferenceId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public double Amount { get; set; }
    public double Discount { get; set; }
    public List<ReceivablePayment>? Payments { get; set; }
    public List<ReceivableRefund>? Refunds { get; set; }
}
