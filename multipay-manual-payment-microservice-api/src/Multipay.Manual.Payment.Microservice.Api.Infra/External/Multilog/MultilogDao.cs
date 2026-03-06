using Microsoft.Extensions.Logging;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog.Entities;
using Newtonsoft.Json;
using JsonSerializer = System.Text.Json.JsonSerializer;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog;
public class MultilogDao(IRequestWithoutLog request, ILogger<MultilogDao> logger, EnvironmentKey environmentKey) : IMultilogDao
{
    private readonly IRequestWithoutLog _request = request;
    private readonly ILogger<MultilogDao> _logger = logger;
    private readonly EnvironmentKey _environmentKey = environmentKey;

    public async Task<TokenDto> Login(LoginDto loginDto)
    {
        try
        {
            var response = await _request.PostJsonAsync(_environmentKey.MultilogInformation.Endpoint, "v1/auth/login", new CustomHeaders(), loginDto);
            string responseData = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"Failed to log in with status {response.StatusCode}: {responseData}");
                return new();
            }

            if (string.IsNullOrEmpty(responseData))
            {
                _logger.LogWarning("Received empty response data in Login.");
                return new();
            }
            var result = JsonSerializer.Deserialize<TokenDto>(responseData)!;
            return result;
        }
        catch (Exception e)
        {
            _logger.LogError(JsonConvert.SerializeObject(e));
            return new();
        }
    }

    public async Task Insert(MultilogDto multilogDto, string token)
    {
        try
        {
            var response = await _request.PostJsonAsync(_environmentKey.MultilogInformation.Endpoint, "v1/activities", new CustomHeaders() { AuthorizationOrdinaryToken = token }, multilogDto);
            string responseData = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"Failed to insert multilog {response.StatusCode}: {responseData}");
            }

        }
        catch (Exception e)
        {
            _logger.LogError(JsonConvert.SerializeObject(e));
        }
    }
}