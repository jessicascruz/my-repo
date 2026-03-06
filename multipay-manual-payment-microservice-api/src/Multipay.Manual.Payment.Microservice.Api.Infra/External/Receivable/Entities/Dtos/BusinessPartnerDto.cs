using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using System.Text.Json.Serialization;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dtos;

public class BusinessPartnerDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("firstName")]
    public string FirstName { get; set; } = string.Empty;

    [JsonPropertyName("lastName")]
    public string LastName { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("documentType")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public DocumentTypeEnum DocumentType { get; set; }

    [JsonPropertyName("documentNumber")]
    public string DocumentNumber { get; set; } = string.Empty;

    [JsonPropertyName("phoneNumber")]
    public string PhoneNumber { get; set; } = string.Empty;

    [JsonPropertyName("billingPhoneNumber")]
    public string? BillingPhoneNumber { get; set; }

    [JsonPropertyName("billingEmail")]
    public string? BillingEmail { get; set; }

    [JsonPropertyName("deliveryAddress")]
    public AddressDto DeliveryAddress { get; set; } = new();
}
