using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using System.Text.Json.Serialization;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dtos;

public class PaymentDto
{
    [JsonPropertyName("method")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public MethodEnum Method { get; set; }

    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("amount")]
    public double Amount { get; set; } = default;

    [JsonPropertyName("status")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public PaymentStatusEnum Status { get; set; }

    [JsonPropertyName("statusDetail")]
    public string StatusDetail { get; set; } = string.Empty;

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; } = default;

    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; } = default;

    [JsonPropertyName("authorizedAt")]
    public DateTime? AuthorizedAt { get; set; }

    [JsonPropertyName("approvedAt")]
    public DateTime? ApprovedAt { get; set; }

    [JsonPropertyName("pix")]
    public PaymentPixDto? Pix { get; set; }

    [JsonPropertyName("ticket")]
    public PaymentTicketDto? Ticket { get; set; }

    [JsonPropertyName("acquirer")]
    public PaymentAcquirerDto? Acquirer { get; set; }
}

public class PaymentPixDto
{
    [JsonPropertyName("qrCode")]
    public string QrCode { get; set; } = string.Empty;

    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;
}

public class PaymentTicketDto
{
    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;

    [JsonPropertyName("barCode")]
    public string BarCode { get; set; } = string.Empty;
}

public class PaymentAcquirerDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("paymentId")]
    public string PaymentId { get; set; } = string.Empty;

    [JsonPropertyName("nsu")]
    public string Nsu { get; set; } = string.Empty;

    [JsonPropertyName("transactionId")]
    public string TransactionId { get; set; } = string.Empty;
}