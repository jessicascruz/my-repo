using Microsoft.Extensions.Logging;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Contexts;
using Newtonsoft.Json;
using System.Text;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP;

public class Request(HttpClient httpClient, ILogger<Request> logger, IMultilogService multilogService, ILogContext logContext) : IRequest
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly ILogger<Request> _logger = logger;
    private readonly IMultilogService _multilogService = multilogService;
    private readonly ILogContext _logContext = logContext;

    public async Task<HttpResponseMessage> GetAsync(string server, string route, CustomHeaders customHeaders, string? parameters = null)
    {
        try
        {
            AddHeaders(customHeaders);

            var result = await _httpClient.GetAsync($"{server}/{route}?{parameters}");

            await LogCurlAndResponse(server, route, customHeaders, null, result, parameters);

            return result;
        }
        catch (System.Exception e)
        {
            var exceptionObject = new { Exception = e, RequestParameters = new { server, route, parameters } };

            _logger.LogError(JsonConvert.SerializeObject(exceptionObject));
            return new HttpResponseMessage();
        }
    }

    public async Task<HttpResponseMessage> PostAsync(string server, string route, CustomHeaders authentication, object? body = default)
    {
        try
        {
            AddHeaders(authentication);

            HttpContent bodyContent;

            if (body != null)
            {
                string jsonContent = JsonConvert.SerializeObject(body);
                bodyContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");
            }
            else
            {
                bodyContent = new StringContent("{}", Encoding.UTF8, "application/json");
            }

            return await _httpClient.PostAsync($"{server}/{route}", bodyContent);
        }
        catch (Exception e)
        {
            var exceptionObject = new { Exception = e, RequestParameters = new { server, route, body } };

            _logger.LogError(JsonConvert.SerializeObject(exceptionObject));
            return new HttpResponseMessage();
        }
    }

    private void AddHeaders(CustomHeaders customHeaders)
    {
        _httpClient.DefaultRequestHeaders.Clear();

        if (!string.IsNullOrEmpty(customHeaders.GatewayToken))
            _httpClient.DefaultRequestHeaders.Add("Gateway-Authentication", customHeaders.GatewayToken);

        //if (!string.IsNullOrEmpty(customHeaders.AuthorizationOrdinaryToken))
        //    _httpClient.DefaultRequestHeaders.Add("Authorization", customHeaders.AuthorizationOrdinaryToken);


        if (customHeaders.Headers != null)
        {
            foreach (var header in customHeaders.Headers)
            {
                if (header.Key is null || header.Value is null)
                    continue;

                _httpClient.DefaultRequestHeaders.Add(header.Key, header.Value);
            }
        }
    }
    private async Task LogCurlAndResponse(string server, string route, CustomHeaders customHeaders, object? body, HttpResponseMessage response, string? parameters = null)
    {
        var url = $"{server}/{route}?{parameters}";
        var method = response.RequestMessage?.Method.Method.ToUpperInvariant() ?? "GET";

        var headers = new Dictionary<string, string>();

        if (!string.IsNullOrEmpty(customHeaders.GatewayToken))
            headers.Add("Gateway-Authentication", customHeaders.GatewayToken);

        if (!string.IsNullOrEmpty(customHeaders.AuthorizationOrdinaryToken))
            headers.Add("Authorization", customHeaders.AuthorizationOrdinaryToken);


        headers["Content-Type"] = "application/json";

        var sb = new StringBuilder();
        sb.AppendLine($"curl --location --request {method} '{url}' \\");

        foreach (var header in headers)
        {
            sb.AppendLine($"--header '{header.Key}: {header.Value}' \\");
        }

        if (body != null)
        {
            var jsonBody = JsonConvert.SerializeObject(body, Formatting.Indented);
            sb.AppendLine($"--data-raw '{jsonBody}'");
        }

        await _multilogService.InsertAsync(new()
        {
            Type = SystemType.Create,
            CauserName = _logContext.CauserName,
            CauserId = _logContext.CauserId,
            Reference = _logContext.Reference,
            System = Constant.APP_MULTILOG_SYSTEM_NAME,
            ReferenceType = Constant.APP_MULTILOG_REFERENCE_TYPE,
            Properties = new()
            {
                Request = sb.ToString(),
                Response = new Dictionary<string, object>{
                    { "response", response },
                    { "responseBody", response.Content.ReadAsStringAsync() }
                },
            }
        });
    }

    public async Task<HttpResponseMessage> PatchAsync(string server, string route, CustomHeaders authentication, object body)
    {
        try
        {
            AddHeaders(authentication);

            HttpContent bodyContent = new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json");

            var result = await _httpClient.PatchAsync($"{server}/{route}", bodyContent);

            await LogCurlAndResponse(server, route, authentication, body, result);

            return result;
        }
        catch (Exception e)
        {
            var exceptionObject = new { Exception = e, RequestParameters = new { server, route, body } };

            _logger.LogError(JsonConvert.SerializeObject(exceptionObject));
            return new HttpResponseMessage();
        }
    }
}


