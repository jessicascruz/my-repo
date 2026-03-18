using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Extensions.Multipay.ManualPayment;

public static class ManualPaymentsExtensions
{
    public static ManualPaymentResponse ToDomain(this ManualPaymentDto manualPaymentDto) 
    {
        return new()
        {
            Id = manualPaymentDto.Id,
            ApprovedAt = manualPaymentDto.ApprovedAt,
            Amount = manualPaymentDto.Amount,
            Status = manualPaymentDto.Status.ToDomain(),
            OrderId = manualPaymentDto.OrderId,
            Reason = manualPaymentDto.Reason,
            Receipts = manualPaymentDto.Receipts.ToDomain(),            
            CreatedAt = manualPaymentDto.CreatedAt,    
            UpdatedAt = manualPaymentDto.UpdatedAt,
            Approvals = manualPaymentDto.Approvals.ToDomain(),
            Requester = manualPaymentDto.Requester?.ToDomain() 
                 
        };
    }

    public static List<ManualPaymentResponse> ToDomain(this List<ManualPaymentDto> manualPaymentDtoList) => manualPaymentDtoList.Select(ToDomain).ToList() ?? new List<ManualPaymentResponse>();

    public static ManualPaymentDto FromDomain(this ManualPaymentRequest manualPaymentRequest, Guid manualPaymentId)
    {
        return new()
        {
            Id = manualPaymentId,
            Amount = manualPaymentRequest.Amount,
            OrderId = manualPaymentRequest.OrderId,
            Reason = manualPaymentRequest.Reason,
            Approvals = manualPaymentRequest.Approvals.FromDomain(),
            Requester = manualPaymentRequest.Requester?.FromDomain(),
            RequesterId = manualPaymentRequest.Requester.Id
        };
    }
}
