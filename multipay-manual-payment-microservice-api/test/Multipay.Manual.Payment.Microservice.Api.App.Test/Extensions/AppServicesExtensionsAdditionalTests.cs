using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Multipay.Manual.Payment.Microservice.Api.App.Extensions;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Cache;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dao;

namespace Multipay.Manual.Payment.Microservice.Api.App.Test.Extensions;

public class AppServicesExtensionsAdditionalTests
{
    [Fact]
    public void Given_ServiceCollection_When_AddCustomServicesIsCalled_Then_ShouldRegisterApplicationDomainAndInfraServices()
    {
        // Arrange
        var services = new ServiceCollection();
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>()).Build();

        // Act
        services.AddCustomServices(configuration);

        // Assert
        Assert.Contains(services, x => x.ServiceType == typeof(IReceivableService));
        Assert.Contains(services, x => x.ServiceType == typeof(IMemoryCacheHandler));
        Assert.Contains(services, x => x.ServiceType == typeof(IRequest));
        Assert.Contains(services, x => x.ServiceType == typeof(IRequestWithoutLog));
        Assert.Contains(services, x => x.ServiceType == typeof(IReceivableDao));
    }
}
