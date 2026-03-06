namespace Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP;

public interface IRequestWithoutLog
{
    Task<HttpResponseMessage> GetAsync(string server, string route, CustomHeaders authentication, string? parameters = null);
    Task<HttpResponseMessage> PostJsonAsync(string server, string route, CustomHeaders authentication, object? body = default);
}
