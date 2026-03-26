using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Extensions.Multipay.ManualPayment;

public static class PaymentStatusExtensions
{
    public static PaymentStatusDto FromDomain(this PaymentStatusResponse paymentStatusResponse)
    {
        return new()
        {
            Description = paymentStatusResponse.Description,
        };
    }

    public static PaymentStatusDto FromDomain(this PaymentStatusRequest paymentStatusRequest)
    {
        return new()
        {
            Id = paymentStatusRequest.Id,
            Description = paymentStatusRequest.Description,
        };
    }

    public static PaymentStatusResponse ToDomain(this PaymentStatusDto paymentStatusDto)
    {
        return new()
        {
            Id = paymentStatusDto.Id,
            Description = paymentStatusDto.Description,
        };
    }   

}
