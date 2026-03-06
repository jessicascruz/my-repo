using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog.Entities;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog;

public interface IMultilogService
{

    Task InsertAsync(MultilogPayload multilog);
}