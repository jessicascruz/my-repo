using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog.Entities;
using System.Text.Json.Serialization;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog.Entities;

public record struct TokenDto
{
    [JsonPropertyName("token")]
    public string Token { get; set; }

    [JsonPropertyName("refreshToken")]
    public string RefreshToken { get; set; }

    [JsonPropertyName("expiresIn")]
    public int ExpiresIn { get; set; }

    [JsonPropertyName("user")]
    public UserDto User { get; set; }

    [JsonPropertyName("roles")]
    public List<string> Roles { get; set; }

    public static Token ConvertToToken(TokenDto tokenDto)
    {
        return new()
        {
            AccessToken = tokenDto.Token,
            RefreshToken = tokenDto.RefreshToken,
            ExpiresIn = tokenDto.ExpiresIn,
            User = UserDto.ConvertToUser(tokenDto.User),
            Roles = tokenDto.Roles
        };
    }
}
