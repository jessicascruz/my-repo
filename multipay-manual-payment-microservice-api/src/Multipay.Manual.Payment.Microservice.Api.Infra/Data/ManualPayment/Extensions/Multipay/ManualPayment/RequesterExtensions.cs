using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.Multipay.Entities.Dtos;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Extensions.Multipay.ManualPayment;

public static class RequesterExtensions
{
    public static RequesterDto FromDomain(this RequesterResponse requesterResponse) => new()
    {
        Id = requesterResponse.Id,
        Name = requesterResponse.Name,
        Email = requesterResponse.Email,
    };

    public static RequesterResponse ToDomain(this RequesterDto requesterDto) => new()
    {
        Id = requesterDto.Id,
        Name = requesterDto.Name,
        Email = requesterDto.Email,
    };

    public static RequesterDto FromDomain(this RequesterRequest requester) => new()
    {
        Id = requester.Id,
        Name = requester.Name,
        Email = requester.Email,
    };


}
