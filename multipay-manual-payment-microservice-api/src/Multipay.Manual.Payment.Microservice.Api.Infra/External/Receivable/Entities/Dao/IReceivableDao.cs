using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Filter;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dao;

public interface IReceivableDao
{
    Task<Tuple<ReceivableDto?, ErrorResult>> GetReceivableOrderByFilterAsync(FilterDto filter);
    Task<ErrorResult> UpdateStatusAsync(Guid id, StatusRequest request);
}
