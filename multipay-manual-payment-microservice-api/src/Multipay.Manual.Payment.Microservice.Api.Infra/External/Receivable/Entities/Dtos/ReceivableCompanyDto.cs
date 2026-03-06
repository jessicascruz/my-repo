using System.Text.Json.Serialization;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dtos;

public class ReceivableCompanyDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }
    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;
    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;
}
