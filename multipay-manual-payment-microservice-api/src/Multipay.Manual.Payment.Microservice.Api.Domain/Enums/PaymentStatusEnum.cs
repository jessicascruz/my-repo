namespace Multipay.Manual.Payment.Microservice.Api.Domain.Enums;

public enum PaymentStatusEnum
{
    CREATED = 1,
    VIEWED,
    PENDING,
    AUTHORIZED,
    CONFIRMED,
    DETECTION,
    RECOVERY,
    CANCELED,
    DENIED,
    REFUNDED,
    EXPIRED,
    CHARGED_BACK,
    MANUAL_CONFIRMED
}
