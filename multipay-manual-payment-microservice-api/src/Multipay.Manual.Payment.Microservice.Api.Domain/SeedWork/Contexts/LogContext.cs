namespace Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Contexts;

public class LogContext : ILogContext
{
    public string CauserId { get; set; } = string.Empty;
    public string CauserName { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
}
