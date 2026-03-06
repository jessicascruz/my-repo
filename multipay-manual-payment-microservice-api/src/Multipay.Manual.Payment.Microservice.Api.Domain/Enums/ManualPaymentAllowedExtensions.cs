namespace Multipay.Manual.Payment.Microservice.Api.Domain.Enums;

public static class ManualPaymentAllowedExtensions
{
    public static readonly HashSet<string> ValidExtensions =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ".pdf",
            ".png",
            ".jpg"
        };
}

