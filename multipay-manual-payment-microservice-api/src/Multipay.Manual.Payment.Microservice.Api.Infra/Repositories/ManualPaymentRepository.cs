
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Daos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Extensions.Multipay.ManualPayment;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Repositories;

public class ManualPaymentRepository(IManualPaymentDao manualPaymentDao) : IManualPaymentRepository
{
    private readonly IManualPaymentDao _manualPaymentDao = manualPaymentDao;

    public async Task<Tuple<List<ManualPaymentResponse>?, ErrorResult>> SelectManualPaymentByOrderIdAsync(Guid orderId)
    {

        var (manualPayment, error) = await _manualPaymentDao.SelectManualPaymentByOrderIdAsync(orderId);

        if (manualPayment is null || error.Error)
            return new(null, error);

        return new(manualPayment.ToDomain(), new());
    }

    public async Task<Tuple<ManualPaymentResponse?, ErrorResult>> InsertManualPaymentAsync(
        Guid manualPaymentId,
        ManualPaymentRequest manualPaymentRequest)
    {
        var manualPaymentDto =
            manualPaymentRequest.FromDomain(manualPaymentId);

        var (paymentManualResult, error) =
            await _manualPaymentDao.InsertManualPaymentAsync(
                manualPaymentId,
                manualPaymentDto);

        if (paymentManualResult is null || error?.Error == true)
            return new(null, error);

        return new(paymentManualResult.ToDomain(), new ErrorResult());
    }

    public async Task<Tuple<PaymentReceiptResponse?, ErrorResult>> InsertReceiptAsync(
    PaymentReceiptRequest receipt)
    {
        var (reponse, error) = await _manualPaymentDao.InsertReceiptAsync(receipt);

        if (reponse is null)
        {
            return new( null,
                error ?? new ErrorResult
                {
                    Error = true,
                    Message = "Failed to insert payment receipt.",
                    StatusCode = ErrorCode.InternalServerError
                }
            );
        } 
        return new(reponse.ToDomain(), new());  
    }

    public async Task<Tuple<ManualPaymentResponse?, ErrorResult>> SelectByIdAsync(Guid manualPaymentId)
    {
        var (payment, error) = await _manualPaymentDao.SelectByIdAsync(manualPaymentId);

        if (payment is null)
        {
            return new(null, error ?? new ErrorResult
                {
                    Error = true,
                    Message = "Manual payment not found.",
                    StatusCode = ErrorCode.NotFound
                }
            );
        }

        return new(payment, new ErrorResult());
    }

    public async Task<Tuple<PaymentApprovalResponse?, ErrorResult>> InsertPaymentApprovalAsync(Guid paymentApprovalId, PaymentApprovalRequest paymentApprovalRequest)
    {
        var paymentApprovalDto = paymentApprovalRequest.FromDomain(paymentApprovalId);

        var (paymentApprovalResult, error) = 
        await _manualPaymentDao.InsertPaymentApprovalAsync(paymentApprovalId, paymentApprovalDto);

        if (paymentApprovalResult is null || error?.Error == true)
            return new(null, error);

        return new(paymentApprovalResult.ToDomain(), new ErrorResult());
    }

    public async Task<Tuple<ManualPaymentResponse?, ErrorResult>> UpdateStatusToCanceledAsync(Guid manualPaymentId, PaymentStatusRequest paymentStatusRequest)
    {
         var paymentStatusDto = new PaymentStatusDto
         {
            Id = paymentStatusRequest.Id,
            Description = paymentStatusRequest.Description
         };

        var (paymentManualResult, error) =
            await _manualPaymentDao.UpdateStatusToCanceledAsync(
                manualPaymentId,
                paymentStatusDto);

        if (paymentManualResult is null || error?.Error == true)
            return new(null, error);

        return new(paymentManualResult.ToDomain(), new ErrorResult());
    }
}
