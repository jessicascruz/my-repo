using CSharpFunctionalExtensions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multipay.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable;
using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Enums;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP;
using System.Diagnostics.CodeAnalysis;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment;

public class ManualPaymentServices(
    ILogger<ManualPaymentServices> logger,
    IManualPaymentRepository manualPaymentRepository,
    IReceivableService receivableService,
    EnvironmentKey environment,
    IAwsRepository awsRepository) : IManualPaymentService
{
    private readonly IManualPaymentRepository _manualPaymentRepository = manualPaymentRepository;
    private readonly IReceivableService _receivableService = receivableService;
    private readonly ILogger<ManualPaymentServices> _logger = logger;
    private readonly EnvironmentKey _environment = environment;
    private readonly IAwsRepository _awsRepository = awsRepository;

    public async Task<Tuple<List<ManualPaymentResponse>?, ErrorResult>> SelectManualPaymentByOrderIdAsync(Guid orderId)
    {
        var (manualPayments, error) = await _manualPaymentRepository.SelectManualPaymentByOrderIdAsync(orderId);

        if (manualPayments is null || error.Error)
            return new(null, error);

        return new(manualPayments, new());
    }

    public async Task<Tuple<ManualPaymentResponse?, ErrorResult>> CreatePaymentManualAsync(ManualPaymentRequest manualPaymentRequest, IFormFileCollection files)
    {

        var fileValidationError = ValidateFiles(files);
        if (fileValidationError is not null)
            return new(null, fileValidationError);

        var requestValidationError = ValidateManualPaymentRequest(manualPaymentRequest);
        if (requestValidationError is not null)
            return new(null, requestValidationError);

        var orderValidationError =
            await ValidateOrderAsync(manualPaymentRequest.OrderId);

        if (orderValidationError is not null)
            return new(null, orderValidationError);

        var manualPaymentId = Guid.NewGuid();

        var uploadedDocuments = new List<string>();

        foreach (var file in files)
        {
            var documentName = BuildReceiptFileName(file.FileName);

            var s3Key =
                $"manual-payment/receipt/{manualPaymentRequest.OrderId}/{manualPaymentId}/{documentName}";

            byte[] fileBytes;
            using (var ms = new MemoryStream())
            {
                await file.CopyToAsync(ms);
                fileBytes = ms.ToArray();
            }

            var (uploadResult, uploadError) =
                await _awsRepository.UploadFileToS3Async(fileBytes, s3Key);

            if (uploadError?.Error == true)
                return new(null, uploadError);

            uploadedDocuments.Add(documentName);
        }

        var (paymentDto, insertError) =
            await _manualPaymentRepository.InsertManualPaymentAsync(
                manualPaymentId,
                manualPaymentRequest);

        if (insertError?.Error == true)
            return new(null, insertError);

        foreach (var documentName in uploadedDocuments)
        {
            var receipt = new PaymentReceiptRequest
            {
                Id = Guid.NewGuid(),
                ManualPaymentId = manualPaymentId,
                DocumentName = documentName,
                CreatedAt = DateTime.UtcNow
            };

            var (receiptResponse, receiptError) =
                await _manualPaymentRepository.InsertReceiptAsync(receipt);

            if (receiptError?.Error == true)
                return new(null, receiptError);
        }

        var (paymentResponse, selectError) =
            await _manualPaymentRepository.SelectByIdAsync(manualPaymentId);

        if (selectError?.Error == true)
            return new(null, selectError);

        return new(paymentResponse, null);
    }


    public async Task<Tuple<ManualPaymentResponse?, ErrorResult>> CreatePaymentApprovalByIdAsync(PaymentApprovalRequest paymentApprovalRequest)
    {
        var (manualPaymentResponse, selectError) = await _manualPaymentRepository.SelectByIdAsync(paymentApprovalRequest.ManualPaymentId);

        if (manualPaymentResponse is null)
            return new(null, selectError);

        if(manualPaymentResponse.Requester.Id == paymentApprovalRequest.RequesterId)
            return new(null, new ErrorResult
            {
                Error = true,
                StatusCode = ErrorCode.BadRequest,
                Message = "Approver must be different from the requester."
            });

        var approvalDupicated = manualPaymentResponse.Approvals
               .Any(a => a.RequesterId == manualPaymentResponse.Requester.Id);

        if (approvalDupicated is true)
                return new(null, new ErrorResult
                {
                    Error = true,
                    StatusCode = ErrorCode.BadRequest,
                    Message = $"User {paymentApprovalRequest.RequesterId} has already approved this payment."
                });


        if (manualPaymentResponse.Approvals.Count >= Constant.MINIMUN_APPROVALS)
                return new(null, new ErrorResult
                {
                    Error = true,
                    StatusCode = ErrorCode.UnprocessableEntity,
                    Message = "This payment has already reached the required number of approvals."
                });


        var paymentApprovalId = Guid.NewGuid();

        var (paymentApproval, insertError) =
            await _manualPaymentRepository.InsertPaymentApprovalAsync(
                paymentApprovalId,
                paymentApprovalRequest);

        if (insertError?.Error == true)
            return new(null, insertError);


        var (response, Error) = await _manualPaymentRepository.SelectByIdAsync(paymentApprovalRequest.ManualPaymentId);

        if (response?.Approvals.Count == Constant.MINIMUN_APPROVALS)
        {
            var (manualPayments, error) = await _manualPaymentRepository.SelectManualPaymentByOrderIdAsync(response.OrderId);
            if (insertError?.Error == true)
                return new(null, error);

            var (order, orderError) = await _receivableService.GetReceivableOrderByIdAsync(response.OrderId);

            if (insertError?.Error == true)
                return new(null, orderError);

            var paymentRejected = manualPayments.Any(a => a.Status.Id == (int)ManualPaymentStatusEnum.REJECTED);

            if (paymentRejected is false)
            {
                var amountOrder = order?.Amount;
                var amountPayments = (manualPayments ?? new()).Sum(p => p.Amount);

                if (Math.Round(amountPayments) < amountOrder)
                    return new(null, new ErrorResult
                    {
                        Error = true,
                        StatusCode = ErrorCode.BadRequest,
                        Message = "The sum of manual payments is not equal to or greater than the order amount."
                    });

                if (Math.Round(amountPayments) >= amountOrder)
                {
                    await _receivableService.UpdateStatusAsync(response.OrderId, new()
                   {
                       Event = ManualEventEnum.MANUAL_CONFIRMED.GetDescription(),
                       SubEvent = ManualEventEnum.MANUAL_CONFIRMED.GetDescription()
                   });
                }

            }

        }

        return new(response, new());
    }


    private string BuildReceiptFileName(string originalName)
    {
        const int maxLength = 200;

        var uuid = Guid.NewGuid().ToString();
        var extension = Path.GetExtension(originalName).ToLowerInvariant();
        var name = Path.GetFileNameWithoutExtension(originalName).ToLowerInvariant();

        var prefix = $"{uuid}-";

        var totalLength = prefix.Length + name.Length + extension.Length;

        if (totalLength > maxLength)
        {
            var excess = totalLength - maxLength;

            var newNameLength = name.Length - excess;

            if (newNameLength < 1)
                throw new InvalidOperationException("Invalid file name length.");

            name = name.Substring(0, newNameLength);
        }

        return $"{prefix}{name}{extension}";
    }

    private ErrorResult BuildBadRequest(string message)
    {
        return new ErrorResult
        {
            Error = true,
            Message = message,
            StatusCode = ErrorCode.BadRequest
        };
    }

    private ErrorResult BuildInternalError(string message)
    {
        return new ErrorResult
        {
            Error = true,
            Message = message,
            StatusCode = ErrorCode.InternalServerError
        };
    }

    private ErrorResult? ValidateFiles(IFormFileCollection files)
    {
        if (files is null || files.Count == 0)
        {
            _logger.LogError("At least one file must be sent.");
            return BuildBadRequest("At least one file must be sent.");
        }

        if (files.Count > 10)
        {
            _logger.LogError("Maximum 10 files allowed.");
            return BuildBadRequest("Maximum 10 files allowed.");
        }

        foreach (var file in files)
        {
            if (file.Length == 0)
                return BuildBadRequest("File cannot be empty.");

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!ManualPaymentAllowedExtensions.ValidExtensions.Contains(extension))
                return BuildBadRequest($"Invalid file extension '{extension}'.");
        }

        return null;
    }
    private ErrorResult? ValidateManualPaymentRequest(ManualPaymentRequest request)
    {
        if (request is null)
        {
            _logger.LogError("The request is null.");
            return BuildBadRequest("Manual payment request cannot be null.");
        }

        if (request.Requester is null)
        {
            _logger.LogError("Requester is required.");
            return BuildBadRequest("The requester cannot be null.");
        }

        if (request.Requester.Id is null)
        {
            _logger.LogError("Requester Id is required.");
            return BuildBadRequest("The requester Id cannot be null.");
        }

        if (string.IsNullOrWhiteSpace(request.Requester.Email))
        {
            _logger.LogError("Requester email is required.");
            return BuildBadRequest("The requester email cannot be null.");
        }

        if (request.Amount <= 0)
        {
            _logger.LogWarning($"Invalid manual payment amount. Amount: {request.Amount}, OrderId: {request.OrderId}");
            return BuildBadRequest("Payment amount must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            _logger.LogError("The reason is required for creating a manual payment.");
            return BuildBadRequest("The reason is required for creating a manual payment.");
        }

        return null;
    }

    private async Task<ErrorResult?> ValidateOrderAsync(Guid orderId)
    {
        var (order, orderError) =
            await _receivableService.GetReceivableOrderByIdAsync(orderId);

        if (orderError?.Error == true)
        {
            _logger.LogError($"Error retrieving order. OrderId: {orderId}, Error: {orderError.Message}");
            return BuildInternalError($"Error retrieving the specified order: {orderId}.");
        }

        if (!_environment.PersistenceInformation.ValidStatusOrder.Contains(order.Status))
        {
            _logger.LogWarning($"Manual payment not allowed for order status. OrderId: {orderId}, Status: {order.Status}");
            return BuildBadRequest(
                $"Manual payment cannot be created for an order with status '{order.Status}'.");
        }

        return null;
    }

}




