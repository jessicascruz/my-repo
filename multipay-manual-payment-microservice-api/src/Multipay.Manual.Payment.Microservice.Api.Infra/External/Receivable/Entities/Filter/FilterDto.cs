using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities.Filter;
using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using System.Web;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Filter;

public class FilterDto
{
    public FilterPaging Paging { get; set; } = new();
    public Guid? OrderId { get; set; }
    public string? ReferenceId { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? Status { get; set; }
    public string? System { get; set; }
    public string? Company { get; set; }
    public Guid? BusinessPartnerId { get; set; }
    public string? BusinessPartnerEmail { get; set; }
    public string? BusinessPartnerDocumentNumber { get; set; }
    public RetrievePaymentsEnum RetrievePayments { get; set; }
    public RetrieveRefundsEnum RetrieveRefunds { get; set; }
    public DateRange? DateRange { get; set; }
}
public static class FilterExtensions
{
    public static FilterDto ToDto(this ReceivableFilter filter) => new() { OrderId = filter.OrderId, RetrievePayments = filter.RetrievePayments, RetrieveRefunds = filter.RetrieveRefunds };
    public static string ToQueryString(this FilterDto filter)
    {
        var properties = new List<string>();

        foreach (var property in filter.GetType().GetProperties())
        {
            var value = property.GetValue(filter, null);
            if (value == null || string.IsNullOrEmpty(value.ToString())) continue;

            switch (property.Name)
            {
                case nameof(FilterDto.Paging):
                    properties.AddRange(GetPagingProperties(value));
                    break;

                case nameof(FilterDto.DateRange):
                    properties.AddRange(GetDateRangeProperties(value));
                    break;
                default:
                    properties.Add($"{ToCamelCase(property.Name)}={HttpUtility.UrlEncode(value.ToString())}");
                    break;
            }
        }
        var queryString = string.Join("&", properties);
        return queryString;
    }

    private static IEnumerable<string> GetPagingProperties(object paging)
    {
        var pagingProperties = paging.GetType().GetProperties();
        foreach (var property in pagingProperties)
        {
            var value = property.GetValue(paging, null);
            if (value != null)
            {
                yield return $"{ToCamelCase(property.Name)}={HttpUtility.UrlEncode(value.ToString())}";
            }
        }
    }

    private static IEnumerable<string> GetDateRangeProperties(object dateRange)
    {
        var startProperty = dateRange.GetType().GetProperty("Start");
        var endProperty = dateRange.GetType().GetProperty("End");

        var start = startProperty?.GetValue(dateRange, null);
        var end = endProperty?.GetValue(dateRange, null);

        if (start != null)
        {
            yield return $"dateStart={HttpUtility.UrlEncode(((DateTime)start).ToString("yyyy/MM/dd"))}";
        }
        if (end != null)
        {
            yield return $"dateEnd={HttpUtility.UrlEncode(((DateTime)end).ToString("yyyy/MM/dd"))}";
        }
    }

    private static string ToCamelCase(string str)
    {
        if (string.IsNullOrEmpty(str) || str.Length < 2)
        {
            return str.ToLower();
        }
        return char.ToLower(str[0]) + str.Substring(1);
    }

}

