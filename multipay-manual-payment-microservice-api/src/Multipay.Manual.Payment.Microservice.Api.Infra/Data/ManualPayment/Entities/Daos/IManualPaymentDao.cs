using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Daos;

public interface IManualPaymentDao
{
    Task<Tuple<List<ManualPaymentDto>?, ErrorResult>> SelectManualPaymentByOrderIdAsync(Guid orderId);
    Task<Tuple<ManualPaymentDto?, ErrorResult>> InsertManualPaymentAsync(Guid manualPaymentId, ManualPaymentDto manualPaymentDto);
    Task<Tuple<PaymentReceiptDto?, ErrorResult>> InsertReceiptAsync(PaymentReceiptRequest receipt);
    Task<Tuple<ManualPaymentResponse?, ErrorResult>> SelectByIdAsync(Guid manualPaymentId);
    Task<Tuple<PaymentApprovalDto, ErrorResult>> InsertPaymentApprovalAsync(Guid paymentApprovalId, PaymentApprovalDto paymentApprovalDto);
}