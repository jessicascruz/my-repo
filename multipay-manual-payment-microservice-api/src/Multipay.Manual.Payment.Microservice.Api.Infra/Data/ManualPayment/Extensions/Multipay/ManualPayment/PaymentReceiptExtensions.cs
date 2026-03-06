using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multipay.Entities.Request;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Extensions.Multipay.ManualPayment;

public static class PaymentReceiptExtensions
{
    public static PaymentReceiptDto FromDomain(this PaymentReceiptResponse paymentReceiptResponse)
    {
        return new()
        {

            Id = paymentReceiptResponse.Id,
            DocumentName = paymentReceiptResponse.DocumentName,
            CreatedAt = paymentReceiptResponse.CreatedAt,
            ManualPaymentId = paymentReceiptResponse.ManualPaymentId
        };
    }

    public static PaymentReceiptResponse ToDomain(this PaymentReceiptDto paymentReceiptDto)
    {
        return new()
        {
            Id = paymentReceiptDto.Id,
            DocumentName = paymentReceiptDto.DocumentName,
            CreatedAt = paymentReceiptDto.CreatedAt,
            ManualPaymentId = paymentReceiptDto.ManualPaymentId
        };
    }


    public static List<PaymentReceiptResponse> ToDomain(this List<PaymentReceiptDto>? paymentReceiptDtoList) => paymentReceiptDtoList?.Select(ToDomain).ToList() ?? new List<PaymentReceiptResponse>();
   
    public static List<PaymentReceiptDto> FromDomain(this List<PaymentReceiptRequest> paymentReceiptList)
    {
        return paymentReceiptList?
            .Select(r => r.FromDomain())
            .ToList()
            ?? new List<PaymentReceiptDto>();
    }

    public static PaymentReceiptDto FromDomain(this PaymentReceiptRequest request)
    {
        return new PaymentReceiptDto
        {
            Id = request.Id,
            ManualPaymentId = request.ManualPaymentId,
            DocumentName = request.DocumentName,
            CreatedAt = request.CreatedAt
        };
    }

}




