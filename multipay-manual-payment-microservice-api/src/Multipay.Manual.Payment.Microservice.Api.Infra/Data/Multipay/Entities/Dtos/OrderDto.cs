using System.ComponentModel.DataAnnotations.Schema;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Data.Multipay.Entities.Dtos;

[Table("Order", Schema = "Multipay")]
public class OrderDto
{
    public Guid Id { get; set; } = default;
    public Guid? ParentId { get; set; } = null;
    public string TypeId { get; set; } = string.Empty;
    public int SystemId { get; set; } = default;
    public Guid BusinessPartnerId { get; set; } = default;
    public Guid DeliveryAddressId { get; set; } = default;
    public Guid? BillingAddressId { get; set; } = null;
    public int StatusId { get; set; } = default;
    public int CompanyId { get; set; } = default;
    public string ReferenceId { get; set; } = string.Empty;
    public string SubReferenceId { get; set; } = string.Empty;
    public string ConditionId { get; set; } = string.Empty;
    public double Amount { get; set; } = default;
    public double Discount { get; set; } = default;
    public int ExpirationTime { get; set; } = default;
    public string CallbackUrl { get; set; } = string.Empty;
    public string Link { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = default;
    public DateTime UpdatedAt { get; set; } = default;
}
