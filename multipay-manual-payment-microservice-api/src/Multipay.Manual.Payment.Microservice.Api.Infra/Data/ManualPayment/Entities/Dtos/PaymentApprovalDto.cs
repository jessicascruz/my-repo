using Multipay.Manual.Payment.Microservice.Api.Infra.Data.Multipay.Entities.Dtos;
using System.ComponentModel.DataAnnotations.Schema;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;

[Table("PaymentApproval", Schema = "Manual")]
public class PaymentApprovalDto
{
    public Guid Id { get; set; }

    public Guid ManualPaymentId { get; set; }

    public bool IsApproved { get; set; }

    public string? RequesterId { get; set; }

    public string? RejectionReason { get; set; }

    public RequesterDto Requester { get; set; } = null!;

    public ManualPaymentDto ManualPayment { get; set; } = null!;
}
