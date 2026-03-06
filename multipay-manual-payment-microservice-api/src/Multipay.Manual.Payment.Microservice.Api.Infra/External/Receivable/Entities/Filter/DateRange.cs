namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Filter;

public class DateRange(DateTime? start, DateTime? end)
{
    public DateTime? Start { get; set; } = start;
    public DateTime? End { get; set; } = end;
}