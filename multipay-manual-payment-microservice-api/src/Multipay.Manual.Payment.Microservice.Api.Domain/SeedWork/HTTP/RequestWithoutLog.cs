using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Text;
using JsonSerializer = System.Text.Json.JsonSerializer;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP;

public class RequestWithoutLog(HttpClient httpClient, ILogger<RequestWithoutLog> logger) : IRequestWithoutLog
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly ILogger<RequestWithoutLog> _logger = logger;

    public async Task<HttpResponseMessage> GetAsync(string server, string route, CustomHeaders customHeaders, string? parameters = null)
    {
        try
        {
            AddHeaders(customHeaders);

            var result = await _httpClient.GetAsync($"{server}/{route}?{parameters}");

            LogCurlAndResponse(server, route, customHeaders, null, result);

            return result;
        }
        catch (System.Exception e)
        {
            var exceptionObject = new { Exception = e, RequestParameters = new { server, route, parameters } };

            _logger.LogError(JsonConvert.SerializeObject(exceptionObject));
            return new HttpResponseMessage();
        }
    }

    public async Task<HttpResponseMessage> PostJsonAsync(string server, string route, CustomHeaders customHeaders, object? body = default)
    {
        try
        {
            AddHeaders(customHeaders);

            HttpContent bodyContent;

            if (body != null)
            {
                string jsonContent = JsonSerializer.Serialize(body);
                bodyContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");
            }
            else
            {
                bodyContent = new StringContent("{}", Encoding.UTF8, "application/json");
            }
            var result = await _httpClient.PostAsync($"{server}/{route}", bodyContent);

            await LogCurlAndResponse(server, route, customHeaders, body, result);

            return result;
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

        if (!string.IsNullOrEmpty(customHeaders.AuthorizationOrdinaryToken))
            _httpClient.DefaultRequestHeaders.Add("Authorization", customHeaders.AuthorizationOrdinaryToken);


        //if (customHeaders.Headers != null)
        //{
        //    foreach (var header in customHeaders.Headers)
        //    {
        //        if (header.Key is null || header.Value is null)
        //            continue;

        //        _httpClient.DefaultRequestHeaders.Add(header.Key, header.Value);
        //    }
        //}
    }

    private async Task LogCurlAndResponse(string server, string route, CustomHeaders customHeaders, object? body, HttpResponseMessage response)
    {
        var url = $"{server}/{route}";
        var headers = new Dictionary<string, string>();

        if (!string.IsNullOrEmpty(customHeaders.GatewayToken))
            headers.Add("Gateway-Authentication", customHeaders.GatewayToken);

        if (!string.IsNullOrEmpty(customHeaders.AuthorizationOrdinaryToken))
            headers.Add("Authorization", customHeaders.AuthorizationOrdinaryToken);

        //if (customHeaders.Headers != null)
        //{
        //    foreach (var header in customHeaders.Headers)
        //    {
        //        if (header.Key is null || header.Value is null)
        //            continue;

        //        headers[header.Key] = header.Value;
        //    }
        //}

        headers["Content-Type"] = "application/json";

        var sb = new StringBuilder();
        sb.Append("curl -X POST");

        foreach (var header in headers)
        {
            sb.Append($" -H \"{header.Key}: {header.Value}\"");
        }

        if (body != null)
        {
            var jsonBody = JsonConvert.SerializeObject(body);
            sb.Append($" -d '{jsonBody}'");
        }

        sb.Append($" \"{url}\"");
        string responseMessage = await response.Content.ReadAsStringAsync() ?? "";
        _logger.LogInformation("Generated cURL: {CurlCommand}", sb.ToString());
        _logger.LogInformation($"status:{response.StatusCode} \n body: {responseMessage}");
    }

}
