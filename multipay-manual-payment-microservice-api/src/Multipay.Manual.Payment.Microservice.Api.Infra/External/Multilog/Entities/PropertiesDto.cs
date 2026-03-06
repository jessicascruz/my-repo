using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog.Entities;
using Newtonsoft.Json;
using System.Text.Json.Serialization;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog.Entities;

public record struct PropertiesDto
{

    [JsonPropertyName("request")]
    public object Request { get; set; }
    [JsonPropertyName("response")]
    public object Response { get; set; }
}

public static class PropertiesExtensions
{
    public static PropertiesDto MapToPropertiesDto(this Properties properties)
    {
        return new PropertiesDto
        {
            Request = properties.Request,
            Response = properties.Response,
        };
    }
    public static Properties MapToProperties(this PropertiesDto propertiesDto)
    {
        return new Properties
        {
            Request = propertiesDto.Request,
            Response = propertiesDto.Response,
        };
    }
}