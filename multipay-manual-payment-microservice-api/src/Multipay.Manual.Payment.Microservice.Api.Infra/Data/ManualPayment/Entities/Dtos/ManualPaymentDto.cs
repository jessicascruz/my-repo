using Multipay.Manual.Payment.Microservice.Api.Infra.Data.Multipay.Entities.Dtos;
using System.ComponentModel.DataAnnotations.Schema;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;

[Table("Payment", Schema = "Manual")]
public class ManualPaymentDto
{
    public Guid Id { get; set; }

    public Guid OrderId { get; set; }

    public double Amount { get; set; }

    public string Reason { get; set; } = string.Empty;

    public DateTime? ApprovedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
    public string RequesterId { get; set; } = string.Empty;

    public RequesterDto? Requester { get; set; } 
    public int StatusId { get; set; }

    public PaymentStatusDto? Status { get; set; }

    public List<PaymentApprovalDto> Approvals { get; set; } = new List<PaymentApprovalDto>();

    public List<PaymentReceiptDto> Receipts { get; set; } = new List<PaymentReceiptDto>();

}
