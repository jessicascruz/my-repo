using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Filter;

public class FilterPaging
{
    public int Page { get; set; } = 1;
    public int PerPage { get; set; } = 10;
    public FilterSortEnum Sort { get; set; } = FilterSortEnum.Date;
    public FilterSortCriteriaEnum SortCriteria { get; set; } = FilterSortCriteriaEnum.Ascending;
}
