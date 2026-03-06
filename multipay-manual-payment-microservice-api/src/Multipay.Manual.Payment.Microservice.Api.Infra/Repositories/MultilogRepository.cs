using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog.Entities;
using Newtonsoft.Json.Linq;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Repositories;

public class MultilogRepository(IMultilogDao multilogDAO) : IMultilogRepository
{
    private readonly IMultilogDao _multilogDAO = multilogDAO;

    public async Task<Token> LoginAsync(Login login)
    {
        LoginDto loginDto = LoginDto.ConvertFromLogin(login);
        TokenDto tokenDto = await _multilogDAO.Login(loginDto);

        if (tokenDto == new TokenDto())
            return new();

        return TokenDto.ConvertToToken(tokenDto);
    }
    public async Task InsertAsync(MultilogPayload multilog, string token)
    {
        var multilogDto = multilog.MapToMultilogDto();
        await _multilogDAO.Insert(multilogDto, token);
    }
}
