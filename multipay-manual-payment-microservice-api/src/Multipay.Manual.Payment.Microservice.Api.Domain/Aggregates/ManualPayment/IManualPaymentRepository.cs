using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment;

public interface IManualPaymentRepository
{
    Task<Tuple<List<ManualPaymentResponse>?, ErrorResult>> SelectManualPaymentByOrderIdAsync(Guid orderId);
    Task<Tuple<ManualPaymentResponse?, ErrorResult>> InsertManualPaymentAsync(Guid manualPaymentId, ManualPaymentRequest manualPaymentRequest);
    Task<Tuple<PaymentReceiptResponse?, ErrorResult>> InsertReceiptAsync(PaymentReceiptRequest receipt);
    Task<Tuple<ManualPaymentResponse?, ErrorResult>> SelectByIdAsync(Guid manualPaymentId);
    Task<Tuple<PaymentApprovalResponse?, ErrorResult>> InsertPaymentApprovalAsync(Guid paymentApprovalId, PaymentApprovalRequest paymentApprovalRequest);
    Task<Tuple<ManualPaymentResponse?, ErrorResult>> UpdateStatusToCanceledAsync(Guid manualPaymentId, PaymentStatusRequest paymentStatusRequest);
}
