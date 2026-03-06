using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog.Entities;
using System.Text.Json.Serialization;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog.Entities;

public record struct UserDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; }
    [JsonPropertyName("name")]
    public string Name { get; set; }
    [JsonPropertyName("username")]
    public string Username { get; set; }

    public static User ConvertToUser(UserDto userDto)
    {
        return new()
        {
            Id = userDto.Id,
            Name = userDto.Name,
            Username = userDto.Username,
        };
    }
}