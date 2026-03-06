using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable;
using Multipay.Manual.Payment.Microservice.Api.Domain.Extensions;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Cache;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Contexts;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP;
using Multipay.Manual.Payment.Microservice.Api.Infra.Extensions;
using System.Text.Json.Serialization;

namespace Multipay.Manual.Payment.Microservice.Api.App.Extensions;

public static class AppServicesExtensions
{
    public static void AddApplication(this IServiceCollection services)
    {
        AddServices(services);
        AddHttpClient(services);
        AddEntities(services);
        AddMemoryCache(services);
       

    }
    private static void AddServices(IServiceCollection services)
    {
        services.AddSingleton<EnvironmentKey>();
        services.AddScoped<IAwsService, AwsService>();        
        services.AddScoped<IMultilogService, MultilogService>();
        services.AddScoped<IManualPaymentService, ManualPaymentServices>();
        services.AddScoped<IReceivableService, ReceivableService>();

        services.ConfigureHttpJsonOptions(options =>
        {
            options.SerializerOptions.PropertyNameCaseInsensitive = true;
            options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
            options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
        });

    }
    private static void AddHttpClient(IServiceCollection services)
    {
        services.AddHttpClient<IRequest, Request>();
        services.AddHttpClient<IRequestWithoutLog, RequestWithoutLog>();
    }
    private static void AddEntities(IServiceCollection services)
    {
        services.AddScoped<ILogContext, LogContext>();
    }
    private static void AddMemoryCache(IServiceCollection services)
    {
        services.AddScoped<IMemoryCacheHandler, MemoryCacheHandler>();
        services.AddMemoryCache();
    }
    public static void AddCustomServices(this IServiceCollection serviceCollection, IConfiguration configuration)
    {
        serviceCollection.AddDomain();
        serviceCollection.AddApplication();
        serviceCollection.AddInfrastructure(configuration);
    }

}
