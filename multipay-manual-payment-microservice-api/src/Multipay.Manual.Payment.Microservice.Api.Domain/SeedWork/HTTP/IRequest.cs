namespace Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP;

public interface IRequest
{
    Task<HttpResponseMessage> GetAsync(string server, string route, CustomHeaders authentication, string? parameters = null);
    Task<HttpResponseMessage> PostAsync(string server, string route, CustomHeaders authentication, object? body = default);
    Task<HttpResponseMessage> PatchAsync(string server, string route, CustomHeaders authentication, object body);
}
