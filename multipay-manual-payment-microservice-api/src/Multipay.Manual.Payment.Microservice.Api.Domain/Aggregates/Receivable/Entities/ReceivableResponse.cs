namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;

public class ReceivableResponse
{
    public Guid Id { get; set; }
    public string ReferenceId { get; set; } = string.Empty;
    //public string ConditionId { get; set; } = string.Empty;
    //public string SubReferenceId { get; set; } = string.Empty;
    //public DateTime CreatedAt { get; set; }
    //public DateTime UpdatedAt { get; set; }
    //public string PaymentLink { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    //public int SystemId { get; set; }
    //public ReceivableCompany Company { get; set; } = new();
    public double Amount { get; set; }
    public double Discount { get; set; }
    //public int ExpirationTime { get; set; }
    //public string CallbackUrl { get; set; } = string.Empty;
    public List<ReceivablePayment>? Payments { get; set; }
    public List<ReceivableRefund>? Refunds { get; set; }
    //public List<string> PaymentMethods { get; set; } = [];
    //public List<Item> Items { get; set; } = [];
    //public BusinessPartner BusinessPartner { get; set; } = new();
}
