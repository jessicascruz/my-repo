using System.Text.Json.Serialization;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Paging;

public interface ISearch<T>
{
    [JsonPropertyName("paging")]
    Paging Paging { get; set; }

    [JsonPropertyName("data")]
    List<T> Data { get; set; }
}
