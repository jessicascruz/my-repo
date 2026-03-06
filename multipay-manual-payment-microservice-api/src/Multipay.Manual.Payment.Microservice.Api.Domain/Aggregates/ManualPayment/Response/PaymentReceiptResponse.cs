namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;


public class PaymentReceiptResponse
{
    public Guid Id { get; set; }

    public Guid ManualPaymentId { get; set; }

    public string DocumentName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

}
