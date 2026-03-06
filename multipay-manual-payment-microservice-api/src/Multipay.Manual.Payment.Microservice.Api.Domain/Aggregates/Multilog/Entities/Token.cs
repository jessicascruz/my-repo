namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog.Entities;

public class Token
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
    public User User { get; set; } = new();
    public List<string> Roles { get; set; } = [];
}

public class User
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
}
