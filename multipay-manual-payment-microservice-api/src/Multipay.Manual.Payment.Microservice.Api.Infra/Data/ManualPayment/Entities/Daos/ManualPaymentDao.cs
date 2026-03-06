using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.Multipay.Entities.Dtos;
using Newtonsoft.Json;
using System.Linq.Expressions;
using static Amazon.S3.Util.S3EventNotification;
using IRequest = Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP.IRequest;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Daos;

public class ManualPaymentDao(ILogger<ManualPaymentDao> logger, IMultipayContext multipayContext) : IManualPaymentDao
{
    private readonly ILogger<ManualPaymentDao> _logger = logger;
    private readonly IMultipayContext _multipayContext = multipayContext;  

    public async Task<Tuple<List<ManualPaymentDto>?, ErrorResult>> SelectManualPaymentByOrderIdAsync(Guid orderId) 
    {
        await using var transaction = 
            await _multipayContext.Database.BeginTransactionAsync();
        try
        {
            var paymentsResponse = await _multipayContext.ManualPayments
                .Where(p => p.OrderId == orderId)
                .AsNoTracking()
                .Select(p => new ManualPaymentDto
                {
                    Id = p.Id,
                    OrderId = p.OrderId,
                    Amount = p.Amount,
                    Reason = p.Reason,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    ApprovedAt = p.ApprovedAt,
                    StatusId = p.StatusId,

                    Requester = new RequesterDto
                    {
                        Id = p.Requester.Id,
                        Name = p.Requester.Name,
                        Email = p.Requester.Email
                    },


                    Status = new PaymentStatusDto
                    {
                        Id = p.Status.Id,
                        Description = p.Status.Description,

                    },

                    Receipts = p.Receipts
                    .Select(rp => new PaymentReceiptDto
                    {
                        Id = rp.Id,
                        DocumentName = rp.DocumentName,                        
                        ManualPaymentId = rp.ManualPaymentId,
                        CreatedAt = DateTime.UtcNow
                    })
                    .ToList(),

                    Approvals = p.Approvals
                    .Select(a => new PaymentApprovalDto
                    {
                        Id = a.Id,
                        IsApproved = a.IsApproved,
                        RequesterId = a.RequesterId,
                        RejectionReason = a.RejectionReason,
                        ManualPaymentId = a.ManualPaymentId,
                    })
                    .ToList()
                })
                .ToListAsync();

            await transaction.CommitAsync();
            return new(paymentsResponse, new());
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error querying manual payments. OrderId: {OrderId}",
                orderId);

            return new(null, new()
            {
                Error = true,
                Message = $"Error querying manual payments, order: {orderId}",
                StatusCode = ErrorCode.InternalServerError
            });
        }
    }

    public async Task<Tuple<ManualPaymentDto?, ErrorResult>> InsertManualPaymentAsync(Guid manualPaymentId, ManualPaymentDto manualPaymentDto)
    {
        await using var transaction = 
            await _multipayContext.Database.BeginTransactionAsync();
        try
        {   
            var manualPayment = new ManualPaymentDto 
            {
                Id = manualPaymentId,
                OrderId = manualPaymentDto.OrderId,
                StatusId = (int)ManualPaymentStatusEnum.PENDING_APPROVAL,
                Amount = manualPaymentDto.Amount,
                Reason = manualPaymentDto.Reason,
                Receipts = manualPaymentDto.Receipts,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                RequesterId = manualPaymentDto.RequesterId,
            };
                        
            var requesterDto = manualPaymentDto.Requester ?? throw new InvalidOperationException("Requester is required.");
                        
            var requester = await _multipayContext.Requesters.FirstOrDefaultAsync(x => x.Id == requesterDto.Id);

            if (requester == null || requester.Id == default)
            {                
                requester = requesterDto;
                _multipayContext.Requesters.Add(requester);                
            }
                        
            manualPayment.RequesterId = requester.Id;
            manualPayment.Requester = null;

            var result = await _multipayContext.ManualPayments.AddAsync(manualPayment);
            await _multipayContext.SaveChangesAsync();

            
            if (result is null || result.Entity is null)
                return Tuple.Create<ManualPaymentDto?, ErrorResult>(null, new()
                {
                    Error = true,
                    StatusCode = ErrorCode.InternalServerError,
                    Message = $"Failed to insert manual payment {JsonConvert.SerializeObject(manualPaymentDto)}"
                });
                        
            var insertedPayment = await  _multipayContext.ManualPayments
                .AsNoTracking()
                .Include(x => x.Status)
                .Include(x => x.Requester)
                .Include(x => x.Receipts)
                .FirstOrDefaultAsync(x => x.Id == manualPayment.Id);
         

            if (insertedPayment is null)
            {
                return Tuple.Create<ManualPaymentDto?, ErrorResult>(null, new ErrorResult
                {
                    Error = true,
                    StatusCode = ErrorCode.InternalServerError,
                    Message = "ManualPayment was inserted, but not found in the select statement."
                });
            }
                        
            if (insertedPayment.StatusId != (int)ManualPaymentStatusEnum.PENDING_APPROVAL)
            {
                return Tuple.Create<ManualPaymentDto?, ErrorResult>(null, new ErrorResult
                {
                    Error = true,
                    StatusCode = ErrorCode.InternalServerError,
                    Message = "Invalid status after creating the ManualPayment."
                });
            }
            
            var resultDto = new ManualPaymentDto
            {
                Id = insertedPayment.Id,
                OrderId = insertedPayment.OrderId,
                StatusId = insertedPayment.StatusId,
                Status = insertedPayment.Status,
                Amount = insertedPayment.Amount,
                Reason = insertedPayment.Reason,
                Requester = insertedPayment.Requester,
                Receipts = insertedPayment.Receipts,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            await transaction.CommitAsync();
            return Tuple.Create<ManualPaymentDto?, ErrorResult>(resultDto, new ErrorResult());

        }
        catch (Exception e)
        {
            _logger.LogError(JsonConvert.SerializeObject(e));
            return Tuple.Create<ManualPaymentDto?, ErrorResult>(null, new()
            {
                Error = true,
                StatusCode = ErrorCode.InternalServerError,
                Message = $"Failed to insert manual payment with error: {JsonConvert.SerializeObject(e)}"
            });
        }
    }

    public async Task<Tuple<PaymentReceiptDto?, ErrorResult>> InsertReceiptAsync(PaymentReceiptRequest receipt)
    {
        await using var transaction = await _multipayContext.Database.BeginTransactionAsync();

        try
        {
            var entity = new PaymentReceiptDto
            {       
                Id = receipt.Id,
                ManualPaymentId = receipt.ManualPaymentId,
                DocumentName = receipt.DocumentName,
                CreatedAt = DateTime.UtcNow

            };

            _multipayContext.PaymentReceipts.Add(entity);
            await _multipayContext.SaveChangesAsync();

            await transaction.CommitAsync();

            return new(
                entity,
                new ErrorResult
                {
                    Error = false,
                    Message = "Receipt successfully inserted."
                }
            );
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();

            _logger.LogError(ex, "Error inserting the receipt into the database");

            return new(
                null,
                new ErrorResult
                {
                    Error = true,
                    Message = "Error inserting the receipt into the database.",
                    StatusCode = ErrorCode.InternalServerError
                }
            );
        }
    }

    public async Task<Tuple<ManualPaymentResponse?, ErrorResult>> SelectByIdAsync(Guid manualPaymentId)
    {
        await using var transaction = await _multipayContext.Database.BeginTransactionAsync();
        try
        {
            var payment = await _multipayContext.ManualPayments
                .AsNoTracking()
                .Where(p => p.Id == manualPaymentId)
                .Select(p => new ManualPaymentResponse
                {
                    Id = p.Id,
                    OrderId = p.OrderId,
                    Amount = p.Amount,
                    Reason = p.Reason,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,

                    Status = new PaymentStatusResponse
                    {
                        Id = p.StatusId,
                        Description = p.Status!.Description
                    },

                    Receipts = p.Receipts
                            .Select(r => new PaymentReceiptResponse
                            {
                                Id = r.Id,
                                ManualPaymentId = r.ManualPaymentId,
                                DocumentName = r.DocumentName,
                                CreatedAt = DateTime.UtcNow
                            })
                            .ToList(),

                    Requester = new RequesterResponse
                    {
                        Id = p.Requester!.Id,
                        Name = p.Requester.Name,
                        Email = p.Requester.Email
                    },

                    Approvals = p.Approvals
                        .Select(a => new PaymentApprovalResponse
                        {
                            Id = a.Id,
                            ManualPaymentId = a.ManualPaymentId,
                            IsApproved = a.IsApproved,
                            RequesterId = a.RequesterId,
                            RejectionReason = a.RejectionReason,
                            CreatedAt = DateTime.UtcNow
                        })
                        .ToList()

                })
                .FirstOrDefaultAsync();

            if (payment is null)
            {
                return new(
                    payment,
                    new ErrorResult
                    {
                        Error = true,
                        Message = "Manual payment not found.",
                        StatusCode = ErrorCode.NotFound
                    }
                );
            }
            await transaction.CommitAsync();
            return new(payment, new ErrorResult());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,$"Error selecting manual payment by Id {manualPaymentId}");

            return new(
                null,
                new ErrorResult
                {
                    Error = true,
                    Message = "Error retrieving manual payment.",
                    StatusCode = ErrorCode.InternalServerError
                }
            );
        }
    }

    public async Task<Tuple<PaymentApprovalDto, ErrorResult>> InsertPaymentApprovalAsync(Guid paymentApprovalId, PaymentApprovalDto paymentApprovalDto)
    {
        await using var transaction = await _multipayContext.Database.BeginTransactionAsync();

        try
        {
            var paymentApproval = new PaymentApprovalDto
            {
                Id = paymentApprovalId,
                ManualPaymentId = paymentApprovalDto.ManualPaymentId,
                IsApproved = paymentApprovalDto.IsApproved,
                RequesterId = paymentApprovalDto.RequesterId,
                RejectionReason = paymentApprovalDto.RejectionReason,
                Requester = paymentApprovalDto.Requester,
            };

            var requesterDto = paymentApprovalDto.Requester ?? throw new InvalidOperationException("Requester is required.");
            var requester = await _multipayContext.Requesters.FirstOrDefaultAsync(x => x.Id == requesterDto.Id);

            if (requester == null || requester.Id == default)
            {
                requester = requesterDto;
                _multipayContext.Requesters.Add(requester);
            }

            paymentApproval.RequesterId = requester.Id;
            paymentApproval.Requester = null;


            var manualPayment = await _multipayContext.ManualPayments
                .FirstOrDefaultAsync(x => x.Id == paymentApproval.ManualPaymentId);

            if (manualPayment == null)
            {
                return Tuple.Create<PaymentApprovalDto, ErrorResult>(null, new()
                {
                    Error = true,
                    StatusCode = ErrorCode.NotFound, 
                    Message = "Payment approval failed."
                });
            } 

            manualPayment.StatusId = paymentApprovalDto.IsApproved ? (int)ManualPaymentStatusEnum.APPROVED : (int)ManualPaymentStatusEnum.REJECTED;
            manualPayment.ApprovedAt = DateTime.UtcNow; 

            await _multipayContext.PaymentApprovals.AddAsync(paymentApproval);

            await _multipayContext.SaveChangesAsync();

            await transaction.CommitAsync();

            return Tuple.Create<PaymentApprovalDto, ErrorResult>(paymentApproval, new ErrorResult());

        }
        catch (Exception e)
        {
            await transaction.RollbackAsync();
            _logger.LogError(JsonConvert.SerializeObject(e));
            return Tuple.Create<PaymentApprovalDto, ErrorResult>(null, new()
            {
                Error = true,
                StatusCode = ErrorCode.InternalServerError,
                Message = $"Failed to insert payment approval with error: {JsonConvert.SerializeObject(e)}"
            });
        }
    }
}

