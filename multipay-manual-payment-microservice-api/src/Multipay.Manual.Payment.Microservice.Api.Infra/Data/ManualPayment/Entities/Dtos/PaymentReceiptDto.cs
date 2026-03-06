using System.ComponentModel.DataAnnotations.Schema;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;

[Table("PaymentReceipt", Schema = "Manual")]
public class PaymentReceiptDto
{
    public Guid Id { get; set; }

    public Guid ManualPaymentId { get; set; }

    public string DocumentName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public ManualPaymentDto ManualPayment { get; set; } = null!;

}
