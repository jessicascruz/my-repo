using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable;

public interface IReceivableService
{
    Task<Tuple<ReceivableResponse?, ErrorResult>> GetReceivableOrderByIdAsync(Guid id);
    Task<ErrorResult> UpdateStatusAsync(Guid id, StatusRequest status);
}