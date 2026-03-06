using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities.Filter;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable;

    public interface IReceivableRepository
    {
        Task<Tuple<ReceivableResponse?, ErrorResult>> GetReceivableOrderByFilterAsync(ReceivableFilter filter);
        Task<ErrorResult> UpdateStatusAsync(Guid id, StatusRequest status);
}