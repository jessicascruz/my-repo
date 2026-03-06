using System.ComponentModel;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Enums
{
    public enum ManualEventEnum
    {
        [Description("MANUAL-VIEWED")]
        MANUAL_VIEWED,
        [Description("MANUAL-AUTHORIZED")]
        MANUAL_AUTHORIZED,
        [Description("MANUAL-DETECTION")]
        MANUAL_DETECTION,
        [Description("MANUAL-CANCELED")]
        MANUAL_CANCELED,
        [Description("MANUAL-CONFIRMED")]
        MANUAL_CONFIRMED,
        [Description("MANUAL-PENDING")]
        MANUAL_PENDING,
        [Description("MANUAL-REFUNDED")]
        MANUAL_REFUNDED,
        [Description("MANUAL-RECOVERY")]
        MANUAL_RECOVERY
    }
}
