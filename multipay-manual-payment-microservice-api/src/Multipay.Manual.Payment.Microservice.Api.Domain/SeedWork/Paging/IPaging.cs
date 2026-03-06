using System.Text.Json.Serialization;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Paging;

public interface IPaging
{
    [JsonPropertyName("total")]
    int Total { get; set; }
    [JsonPropertyName("currentPage")]
    int CurrentPage { get; set; }
    [JsonPropertyName("perPage")]
    int PerPage { get; set; }
    [JsonPropertyName("pages")]
    int Pages { get; set; }
}