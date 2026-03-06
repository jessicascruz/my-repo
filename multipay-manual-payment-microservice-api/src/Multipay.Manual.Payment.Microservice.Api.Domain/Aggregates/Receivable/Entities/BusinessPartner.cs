using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using System.Text.Json.Serialization;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;

public class BusinessPartner
{
    public Guid Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public DocumentTypeEnum DocumentType { get; set; }

    public string DocumentNumber { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string? BillingEmail { get; set; }

    public string? BillingPhoneNumber { get; set; }
    public Address DeliveryAddress { get; set; } = new();
}
