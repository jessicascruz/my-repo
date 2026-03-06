using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities.Filter;

public class ReceivableFilter
{
    public Guid? OrderId { get; set; }
    public RetrievePaymentsEnum RetrievePayments { get; set; }
    public RetrieveRefundsEnum RetrieveRefunds { get; set; }

}