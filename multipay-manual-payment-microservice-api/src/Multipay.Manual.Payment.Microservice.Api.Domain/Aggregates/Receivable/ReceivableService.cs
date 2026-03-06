using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities.Filter;
using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable;

public class ReceivableService(IReceivableRepository receivableRepository) : IReceivableService
{
    private readonly IReceivableRepository _receivableRepository = receivableRepository;

    public async Task<Tuple<ReceivableResponse?, ErrorResult>> GetReceivableOrderByIdAsync(Guid id)
    {
        var filter = new ReceivableFilter
        {
            OrderId = id,
            RetrievePayments = RetrievePaymentsEnum.All,
            RetrieveRefunds = RetrieveRefundsEnum.All,
        };
        var (receivable, receivableError) = await _receivableRepository.GetReceivableOrderByFilterAsync(filter);

        return new(receivable, receivableError);
    }

    public async Task<ErrorResult> UpdateStatusAsync(Guid id, StatusRequest status) => await _receivableRepository.UpdateStatusAsync(id, status);
}