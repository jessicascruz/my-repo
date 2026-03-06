using Microsoft.Extensions.Logging;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Cache;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog;

public class MultilogService(IMultilogRepository multilogRepository, IMemoryCacheHandler memoryCacheHandler, EnvironmentKey environmentKey) : IMultilogService
{
    private readonly IMultilogRepository _multilogRepository = multilogRepository;
    private readonly IMemoryCacheHandler _memoryCacheHandler = memoryCacheHandler;
    private readonly EnvironmentKey _environmentKey = environmentKey;
    public async Task<string> LoginAsync()
    {
        bool isInCache = _memoryCacheHandler.TryGetValue(Constant.APP_MULTILOG_CACHE_TOKEN_KEY, out string? cacheToken);
        if (!isInCache || string.IsNullOrEmpty(cacheToken))
        {
            Login login = new()
            {
                Username = _environmentKey.MultilogInformation.UserName,
                Password = _environmentKey.MultilogInformation.Password,
            };

            Token token = await _multilogRepository.LoginAsync(login);
            var originalExpiry = TimeSpan.FromSeconds(token.ExpiresIn);
            var reducedExpiry = originalExpiry - TimeSpan.FromMinutes(30);
            _memoryCacheHandler.SetValue(Constant.APP_MULTILOG_CACHE_TOKEN_KEY, token.AccessToken, reducedExpiry);
            return token.AccessToken;
        }
        else
        {
            return cacheToken!;
        }
    }
    public async Task InsertAsync(MultilogPayload multilog)
    {
        string token = await LoginAsync();
        await _multilogRepository.InsertAsync(multilog, token);
    }
}
