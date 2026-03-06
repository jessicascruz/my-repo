using Azure;
using Azure.Core;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Extensions.Multipay.ManualPayment;

public static class PaymentApprovalExtensions
{

    public static PaymentApprovalDto FromDomain(this PaymentApprovalResponse response)
    {
        return new PaymentApprovalDto
        {
            Id = response.Id,
            ManualPaymentId = response.ManualPaymentId,
            IsApproved = response.IsApproved,
            RequesterId = response.RequesterId,
            RejectionReason = response.RejectionReason,
            Requester = response.Requester?.FromDomain(),
        };
    }

    public static PaymentApprovalDto FromDomain(this PaymentApprovalRequest request, Guid? paymentApprovalId = null)
    {
        return new PaymentApprovalDto
        {
            Id = paymentApprovalId ?? Guid.NewGuid(),
            ManualPaymentId = request.ManualPaymentId,
            IsApproved = request.IsApproved,
            RequesterId = request.RequesterId,
            RejectionReason = request.RejectionReason,
            Requester = request.Requester?.FromDomain(),
        };
    }

    public static PaymentApprovalResponse ToDomain(this PaymentApprovalDto paymentApprovalDto)
    {
        return new PaymentApprovalResponse
        {
            Id = paymentApprovalDto.Id,
            ManualPaymentId = paymentApprovalDto.ManualPaymentId,
            IsApproved = paymentApprovalDto.IsApproved,
            RequesterId = paymentApprovalDto.RequesterId,
            RejectionReason = paymentApprovalDto.RejectionReason,
            Requester = paymentApprovalDto.Requester?.ToDomain(),
        };
    }

    public static List<PaymentApprovalResponse> ToDomain(this List<PaymentApprovalDto> paymentApprovalDtoList)
    {
        return paymentApprovalDtoList?.Select(d => d.ToDomain()).ToList() ?? new List<PaymentApprovalResponse>();
    } 

    public static List<PaymentApprovalDto> FromDomain(this List<PaymentApprovalResponse> paymentApprovalList)
    {
        return paymentApprovalList?
            .Select(r => r.FromDomain())
            .ToList()
            ?? new List<PaymentApprovalDto>();
    }

}


