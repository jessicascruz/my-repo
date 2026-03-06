using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities.Filter;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dao;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Filter;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Mappers;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Repositories;

public class ReceivableRepository(IReceivableDao receivableDao) : IReceivableRepository
{
    private readonly IReceivableDao _receivableDao = receivableDao;

    public async Task<Tuple<ReceivableResponse?, ErrorResult>> GetReceivableOrderByFilterAsync(ReceivableFilter filter)
    {
        var (receivable, error) = await _receivableDao.GetReceivableOrderByFilterAsync(filter.ToDto());

        if (receivable is null || error.Error)
            return new(null, error);
        return new(receivable.ToDomain(), new());
    }

    public async Task<ErrorResult> UpdateStatusAsync(Guid id, StatusRequest request) => await _receivableDao.UpdateStatusAsync(id, request);
}
