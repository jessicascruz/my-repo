using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog.Entities;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog;

public interface IMultilogDao
{
    Task<TokenDto> Login(LoginDto loginDto);
    Task Insert(MultilogDto multilogDto, string token);
}
