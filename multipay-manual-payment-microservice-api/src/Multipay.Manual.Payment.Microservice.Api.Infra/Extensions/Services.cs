using Amazon.S3;
using Amazon.SecretsManager;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Daos;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.AWS;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dao;
using Multipay.Manual.Payment.Microservice.Api.Infra.Repositories;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Extensions;

public static class InfraServicesExtensions
{
    public static void AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        AddRepositories(services);
        AddEnvironmentKey(services);
        AddDaos(services);
        services.AddPersistence();
        services.AddAws(configuration);
    }

    private static void AddRepositories(IServiceCollection services)
    {
        services.AddScoped<IAwsRepository, AwsRepository>();
        services.AddScoped<IMultilogRepository, MultilogRepository>();
        services.AddScoped<IManualPaymentRepository, ManualPaymentRepository>();
        services.AddScoped<IReceivableRepository, ReceivableRepository>();
    }

    private static void AddEnvironmentKey(IServiceCollection services)
    {
        services.AddSingleton<EnvironmentKey>();
    }

    private static void AddDaos(IServiceCollection services)
    {
        services.AddScoped<HttpClient>();
        services.AddScoped<IAwsDao, AwsDao>();
        services.AddScoped<IMultilogDao, MultilogDao>();
        services.AddScoped<IManualPaymentDao, ManualPaymentDao>();
        services.AddScoped<IReceivableDao, ReceivableDao>();
    }

    private static void AddPersistence(this IServiceCollection serviceCollection)
    {
        serviceCollection.AddDbContext<IMultipayContext, MultipayContext>();       
    }

    private static void AddAws(this IServiceCollection services, IConfiguration configuration)
    {
        //services.AddDefaultAWSOptions(configuration.GetAWSOptions());
        //services.AddAWSService<IAmazonSecretsManager>();
        //services.AddAWSService<IAmazonS3>();
        services.AddScoped<IAmazonS3, AmazonS3Client>();

    }
}
