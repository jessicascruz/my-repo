namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multipay.Entities.Request;

public interface IRequesterRequest
{
    string Id { get; set; }
    string Name { get; set; }
    string Email { get; set; }
}
