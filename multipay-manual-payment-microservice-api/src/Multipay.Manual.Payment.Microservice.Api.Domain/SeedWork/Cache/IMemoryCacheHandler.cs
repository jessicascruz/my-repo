namespace Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Cache;

public interface IMemoryCacheHandler
{
    void SetValue(string key, string value, TimeSpan expirationInSeconds);

    void RemoveValue(string key);

    bool TryGetValue(string key, out string? value);
}