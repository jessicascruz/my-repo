namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;

public class ReceivableCompany
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}