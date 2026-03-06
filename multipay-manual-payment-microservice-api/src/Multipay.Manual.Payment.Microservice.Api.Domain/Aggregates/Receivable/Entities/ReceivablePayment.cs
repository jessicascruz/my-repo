using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using System.Text.Json.Serialization;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;

public class ReceivablePayment
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public MethodEnum Method { get; set; }
    public Guid Id { get; set; }
    public double Amount { get; set; } = default;
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public PaymentStatusEnum Status { get; set; }
    public string StatusDetail { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = default;
    public DateTime UpdatedAt { get; set; } = default;
    public DateTime? AuthorizedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public PaymentPix? Pix { get; set; }
    public PaymentTicket? Ticket { get; set; }
    public PaymentAcquirer? Acquirer { get; set; }
}

public class PaymentPix
{
    public string QrCode { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}

public class PaymentTicket
{
    public string Url { get; set; } = string.Empty;
    public string BarCode { get; set; } = string.Empty;
}

public class PaymentAcquirer
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public string PaymentId { get; set; } = string.Empty;
    public string Nsu { get; set; } = string.Empty;
    public string TransactionId { get; set; } = string.Empty;
}

