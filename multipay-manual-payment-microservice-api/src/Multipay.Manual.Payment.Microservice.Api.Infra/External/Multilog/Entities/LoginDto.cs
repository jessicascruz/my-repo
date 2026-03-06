using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog.Entities;
using Newtonsoft.Json;
using System.Text.Json.Serialization;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog.Entities;

public record struct LoginDto
{
    [JsonPropertyName("username")]
    public string Username { get; set; }
    [JsonPropertyName("password")]
    public string Password { get; set; }

    public static LoginDto ConvertFromLogin(Login login)
    {
        return new()
        {
            Password = login.Password,
            Username = login.Username
        };
    }
}
