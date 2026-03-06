using Microsoft.Extensions.DependencyInjection;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog;
using Multipay.Manual.Payment.Microservice.Api.Domain.Extensions;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Contexts;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Paging;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Test.Extensions;

public class DomainServicesExtensionsTests
{
    [Fact]
    public void Given_ServiceCollection_When_AddDomainIsCalled_Then_ShouldRegisterExpectedServices()
    {
        // Arrange
        var services = new ServiceCollection();

        // Act
        services.AddDomain();

        // Assert
        Assert.Contains(services, x => x.ServiceType == typeof(IPaging) && x.ImplementationType == typeof(Paging));
        Assert.Contains(services, x => x.ServiceType == typeof(ILogContext) && x.ImplementationType == typeof(LogContext));
        Assert.Contains(services, x => x.ServiceType == typeof(IAwsService) && x.ImplementationType == typeof(AwsService));
        Assert.Contains(services, x => x.ServiceType == typeof(IMultilogService) && x.ImplementationType == typeof(MultilogService));
        Assert.Contains(services, x => x.ServiceType == typeof(IManualPaymentService) && x.ImplementationType == typeof(ManualPaymentServices));
        Assert.Contains(services, x => x.ServiceType == typeof(EnvironmentKey) && x.Lifetime == ServiceLifetime.Singleton);
    }
}
