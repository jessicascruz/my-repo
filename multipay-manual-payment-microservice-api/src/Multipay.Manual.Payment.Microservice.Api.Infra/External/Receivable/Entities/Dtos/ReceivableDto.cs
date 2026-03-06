using Multipay.Manual.Payment.Microservice.Api.Infra.Data.Multipay.Entities.Dtos;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dtos;


public class ReceivableDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("referenceId")]
    public string ReferenceId { get; set; } = string.Empty;

    [JsonPropertyName("conditionId")]
    public string ConditionId { get; set; } = string.Empty;

    [JsonPropertyName("subReferenceId")]
    public string SubReferenceId { get; set; } = string.Empty;

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [JsonPropertyName("paymentLink")]
    public string PaymentLink { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("systemId")]
    public int SystemId { get; set; }

    [JsonPropertyName("company")]
    public ReceivableCompanyDto Company { get; set; } = new();

    [JsonPropertyName("amount")]
    public double Amount { get; set; }

    [JsonPropertyName("discount")]
    public double Discount { get; set; }

    [JsonPropertyName("expirationTime")]
    public int ExpirationTime { get; set; }

    [JsonPropertyName("callbackUrl")]
    public string CallbackUrl { get; set; } = string.Empty;

    [JsonPropertyName("payments")]
    public List<PaymentDto>? Payments { get; set; }

    [JsonPropertyName("refunds")]
    public List<ReceivableRefundDto>? Refunds { get; set; }

    [JsonPropertyName("paymentMethods")]
    public List<string> PaymentMethods { get; set; } = [];

    [JsonPropertyName("items")]
    public List<ItemDto> Items { get; set; } = [];

    [JsonPropertyName("businessPartner")]
    public BusinessPartnerDto BusinessPartner { get; set; } = new();
}
