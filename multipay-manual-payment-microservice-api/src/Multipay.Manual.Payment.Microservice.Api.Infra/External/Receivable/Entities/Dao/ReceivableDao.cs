using Microsoft.Extensions.Logging;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Paging;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Filter;
using Newtonsoft.Json;
using JsonSerializer = System.Text.Json.JsonSerializer;


namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dao;

public class ReceivableDao(IRequest request, ILogger<IReceivableDao> logger, EnvironmentKey environmentKey) : IReceivableDao
{
    private readonly IRequest _request = request;
    private readonly ILogger<IReceivableDao> _logger = logger;
    private readonly EnvironmentKey _environmentKey = environmentKey;

    public async Task<Tuple<ReceivableDto?, ErrorResult>> GetReceivableOrderByFilterAsync(FilterDto filter)
    {
        try
        {
            var response = await _request.GetAsync(
                _environmentKey.MicroserviceInformation.ReceivableEndpoint,
                $"v1/order/single",
                new CustomHeaders { GatewayToken = _environmentKey.GatewayInformation.ReceivableToken },
                $"{filter.ToQueryString()}");
            string responseData = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError(responseData);

                if (Enum.TryParse(((int)response.StatusCode).ToString(), out ErrorCode statusCode))
                    return new(null, new()
                    {
                        Error = true,
                        Message = responseData,
                        StatusCode = statusCode
                    });

                return new(null, new()
                {
                    Error = true,
                    Id = filter.OrderId.ToString(),
                    Message = $"Something unwaited happened when trying to retrieve your order : {responseData}",
                    StatusCode = statusCode
                });
            }

            Search<ReceivableDto> searchResponse = JsonSerializer.Deserialize<Search<ReceivableDto>>(responseData)!;
            return new(searchResponse.Data[0], new());
        }
        catch (Exception e)
        {
            _logger.LogError(JsonConvert.SerializeObject(e));
            return new(null, new()
            {
                Error = true,
                Message = JsonConvert.SerializeObject(e),
                StatusCode = ErrorCode.InternalServerError,
            });
        }
    }

    public async Task<ErrorResult> UpdateStatusAsync(Guid id, StatusRequest request)
    {
        try
        {
            var response = await _request.PatchAsync(
                _environmentKey.MicroserviceInformation.ReceivableEndpoint,
                $"v1/order/status/{id}",
                new CustomHeaders { GatewayToken = _environmentKey.GatewayInformation.ReceivableToken },
                request);

            string responseData = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError(responseData);

                if (Enum.TryParse(((int)response.StatusCode).ToString(), out ErrorCode statusCode))
                    return new()
                    {
                        Error = true,
                        Id = id.ToString(),
                        Message = responseData,
                        StatusCode = statusCode
                    };

                return new()
                {
                    Error = true,
                    Id = id.ToString(),
                    Message = responseData,
                    StatusCode = ErrorCode.NotFound
                };
            }

            return new();
        }
        catch (Exception e)
        {
            _logger.LogError(JsonConvert.SerializeObject(e));
            return new()
            {
                Error = true,
                Id = id.ToString(),
                Message = JsonConvert.SerializeObject(e),
                StatusCode = ErrorCode.InternalServerError,
            };
        }
    }
}
