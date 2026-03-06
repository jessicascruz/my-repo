using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog.Entities;
using Newtonsoft.Json;
using System.Text.Json.Serialization;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog.Entities;

public record struct MultilogDto
{
    [JsonPropertyName("system")]
    public string System { get; set; }
    [JsonPropertyName("type")]
    public string Type { get; set; }
    [JsonPropertyName("reference")]
    public string Reference { get; set; }
    [JsonPropertyName("referenceType")]
    public string ReferenceType { get; set; }
    [JsonPropertyName("causerId")]
    public string CauserId { get; set; }
    [JsonPropertyName("causerName")]
    public string CauserName { get; set; }
    [JsonPropertyName("properties")]
    public PropertiesDto Properties { get; set; }
}

public static class MultilogDtoExtensions
{
    public static MultilogPayload MapToMultilog(this MultilogDto multilogDto)
    {
        return new MultilogPayload
        {
            System = multilogDto.System,
            Type = Enum.Parse<SystemType>(multilogDto.Type, true),
            Reference = multilogDto.Reference,
            ReferenceType = multilogDto.ReferenceType,
            CauserId = multilogDto.CauserId,
            CauserName = multilogDto.CauserName,
            Properties = multilogDto.Properties.MapToProperties()
        };
    }
    public static MultilogDto MapToMultilogDto(this MultilogPayload multilog)
    {
        return new MultilogDto
        {
            System = multilog.System,
            Type = multilog.Type.ToString().ToLower(),
            Reference = multilog.Reference,
            ReferenceType = multilog.ReferenceType,
            CauserId = multilog.CauserId,
            CauserName = multilog.CauserName,
            Properties = multilog.Properties.MapToPropertiesDto()
        };
    }
}