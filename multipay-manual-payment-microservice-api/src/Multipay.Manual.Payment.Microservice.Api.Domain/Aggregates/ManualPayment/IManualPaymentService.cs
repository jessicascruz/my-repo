using Microsoft.AspNetCore.Http;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment;

public interface IManualPaymentService
{
    Task<Tuple<List<ManualPaymentResponse>?, ErrorResult>> SelectManualPaymentByOrderIdAsync(Guid orderId);
    Task<Tuple<ManualPaymentResponse?, ErrorResult>> CreatePaymentManualAsync(ManualPaymentRequest manualPayment, IFormFileCollection files);
    Task<Tuple<ManualPaymentResponse?, ErrorResult>> CreatePaymentApprovalByIdAsync(PaymentApprovalRequest paymentApprovalRequest);
    
}
