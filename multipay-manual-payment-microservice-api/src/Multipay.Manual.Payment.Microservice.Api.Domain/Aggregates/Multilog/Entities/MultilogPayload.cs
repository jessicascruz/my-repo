namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog.Entities;

public class MultilogPayload
{
    public string System { get; set; } = string.Empty;
    public SystemType Type { get; set; }
    public string Reference { get; set; } = string.Empty;
    public string ReferenceType { get; set; } = string.Empty;
    public string CauserId { get; set; } = string.Empty;
    public string CauserName { get; set; } = string.Empty;
    public Properties Properties { get; set; } = new();

}

public class Properties
{
    public object Request { get; set; } = new();
    public object Response { get; set; } = new();
}
