using Microsoft.Extensions.DependencyInjection;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Contexts;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Paging;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Extensions;

public static class DomainServicesExtensions
{
    private static void AddEntities(this IServiceCollection serviceCollection)
    {
        serviceCollection.AddTransient<IPaging, Paging>();
        serviceCollection.AddScoped<ILogContext, LogContext>();
    }

    private static void AddDomainServices(this IServiceCollection serviceCollection)
    {
        serviceCollection.AddScoped<IAwsService, AwsService>();
        serviceCollection.AddScoped<IMultilogService, MultilogService>();
        serviceCollection.AddScoped<IManualPaymentService, ManualPaymentServices>();
    }
    private static void AddSeedWork(this IServiceCollection serviceCollection)
    {
        serviceCollection.AddSingleton<EnvironmentKey>();
        
    }
    public static void AddDomain(this IServiceCollection serviceCollection)
    {
        serviceCollection.AddEntities();
        serviceCollection.AddDomainServices();
        serviceCollection.AddSeedWork();
    }
}