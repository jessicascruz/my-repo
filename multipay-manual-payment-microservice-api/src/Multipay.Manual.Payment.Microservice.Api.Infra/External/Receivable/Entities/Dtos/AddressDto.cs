using System.Text.Json.Serialization;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dtos;

public class AddressDto
{
    [JsonPropertyName("street")]
    public string Street { get; set; } = string.Empty;

    [JsonPropertyName("number")]
    public string Number { get; set; } = string.Empty;

    [JsonPropertyName("complement")]
    public string Complement { get; set; } = string.Empty;

    [JsonPropertyName("neighbourhood")]
    public string Neighbourhood { get; set; } = string.Empty;

    [JsonPropertyName("city")]
    public string City { get; set; } = string.Empty;

    [JsonPropertyName("state")]
    public string State { get; set; } = string.Empty;

    [JsonPropertyName("postalCode")]
    public string PostalCode { get; set; } = string.Empty;
}