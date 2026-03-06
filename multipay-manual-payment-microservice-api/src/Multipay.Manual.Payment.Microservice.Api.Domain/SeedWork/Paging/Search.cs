using System.Text.Json.Serialization;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Paging;

public class Search<T>() : ISearch<T>
{
    [JsonPropertyName("paging")]
    public Paging Paging { get; set; } = new Paging();

    [JsonPropertyName("data")]
    public List<T> Data { get; set; } = [];
}
