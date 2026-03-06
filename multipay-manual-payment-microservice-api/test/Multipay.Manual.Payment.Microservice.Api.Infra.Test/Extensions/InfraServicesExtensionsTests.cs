using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Daos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Extensions;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.AWS;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dao;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.Extensions;

public class InfraServicesExtensionsTests
{
    [Fact]
    public void Given_ServiceCollection_When_AddInfrastructureIsCalled_Then_ShouldRegisterExpectedServices()
    {
        // Arrange
        var services = new ServiceCollection();
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>()).Build();

        // Act
        services.AddInfrastructure(configuration);

        // Assert
        Assert.Contains(services, x => x.ServiceType == typeof(IAwsRepository) && x.ImplementationType == typeof(Infra.Repositories.AwsRepository));
        Assert.Contains(services, x => x.ServiceType == typeof(IMultilogRepository) && x.ImplementationType == typeof(Infra.Repositories.MultilogRepository));
        Assert.Contains(services, x => x.ServiceType == typeof(IManualPaymentRepository) && x.ImplementationType == typeof(Infra.Repositories.ManualPaymentRepository));
        Assert.Contains(services, x => x.ServiceType == typeof(IReceivableRepository) && x.ImplementationType == typeof(Infra.Repositories.ReceivableRepository));
        Assert.Contains(services, x => x.ServiceType == typeof(EnvironmentKey));
        Assert.Contains(services, x => x.ServiceType == typeof(IAwsDao) && x.ImplementationType == typeof(AwsDao));
        Assert.Contains(services, x => x.ServiceType == typeof(IMultilogDao) && x.ImplementationType == typeof(MultilogDao));
        Assert.Contains(services, x => x.ServiceType == typeof(IManualPaymentDao) && x.ImplementationType == typeof(ManualPaymentDao));
        Assert.Contains(services, x => x.ServiceType == typeof(IReceivableDao) && x.ImplementationType == typeof(ReceivableDao));
        Assert.Contains(services, x => x.ServiceType == typeof(IMultipayContext) && x.ImplementationType == typeof(MultipayContext));
    }
}
