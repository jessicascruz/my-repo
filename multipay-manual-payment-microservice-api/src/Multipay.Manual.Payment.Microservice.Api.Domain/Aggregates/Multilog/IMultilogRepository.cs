using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Newtonsoft.Json.Linq;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog;

public interface IMultilogRepository
{
    Task<Token> LoginAsync(Login login);
    Task InsertAsync(MultilogPayload multilog, string token);
}