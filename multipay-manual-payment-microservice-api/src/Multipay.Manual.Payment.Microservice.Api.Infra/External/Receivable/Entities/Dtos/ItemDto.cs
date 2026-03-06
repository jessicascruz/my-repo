using System.Text.Json.Serialization;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dtos;

public class ItemDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("quantity")]
    public int Quantity { get; set; } = default;

    [JsonPropertyName("unitPrice")]
    public float UnitPrice { get; set; } = default;
    [JsonPropertyName("image")]
    public string Image { get; set; } = string.Empty;
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}