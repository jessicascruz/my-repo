using Microsoft.Extensions.Caching.Memory;
namespace Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Cache;

public class MemoryCacheHandler(IMemoryCache memoryCache) : IMemoryCacheHandler
{
    private readonly IMemoryCache _memoryCache = memoryCache;

    public void SetValue(string key, string value, TimeSpan expirationInSeconds) => _memoryCache.Set(key, value, expirationInSeconds);

    public void RemoveValue(string key) => _memoryCache.Remove(key);

    public bool TryGetValue(string key, out string? value) => _memoryCache.TryGetValue(key, out value);
}
