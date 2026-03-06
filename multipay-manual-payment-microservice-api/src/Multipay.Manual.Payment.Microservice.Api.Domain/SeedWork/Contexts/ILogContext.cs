namespace Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Contexts;

public interface ILogContext
{
    string CauserId { get; set; }
    string CauserName { get; set; }
    string Reference { get; set; }
}
