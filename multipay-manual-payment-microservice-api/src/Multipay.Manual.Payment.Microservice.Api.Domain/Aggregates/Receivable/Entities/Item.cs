namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;

public class Item
{
    public Guid Id { get; set; }
    public int Quantity { get; set; } = default;
    public float UnitPrice { get; set; } = default;
    public string Image { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}
