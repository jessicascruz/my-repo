using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP;
using System.Text.Json;
//using Newtonsoft.Json;

namespace Multipay.Manual.Payment.Microservice.Api.App.Extensions;
public static class ApplicationBuilderExtensions
{
    public static void FillEnvironmentKeys(EnvironmentKey environmentKey, IConfiguration configuration)
    {
        environmentKey.AWSInformation.SecretManagerInformation.SecretName =
            EnvironmentKey.GetVariable<string>(Constant.AWS_SECRET_MANAGER_NAME, configuration);
        environmentKey.AWSInformation.SecretManagerInformation.Region =
            EnvironmentKey.GetVariable<string>(Constant.AWS_SECRET_MANAGER_REGION, configuration);
        environmentKey.MultilogInformation.Endpoint =
             EnvironmentKey.GetVariable<string>(Constant.MULTILOG_REQUEST_ENDPOINT, configuration);
        environmentKey.MicroserviceInformation.ReceivableEndpoint =
             EnvironmentKey.GetVariable<string>(Constant.MICROSERVICE_RECEIVABLE_REQUEST_ENDPOINT, configuration);
        environmentKey.PersistenceInformation.ValidStatusOrder =
             EnvironmentKey.GetVariable<string>(Constant.VALID_STATUS_ORDER, configuration);
        environmentKey.MultilogInformation.Endpoint =
             EnvironmentKey.GetVariable<string>(Constant.MULTILOG_REQUEST_ENDPOINT, configuration);
        environmentKey.AWSInformation.S3Information.BucketName = 
            EnvironmentKey.GetVariable<string>(Constant.AWS_S3_BUCKET_NAME, configuration);


    }

    public static async Task FillSecretManagerInformation(EnvironmentKey environmentKey, IApplicationBuilder applicationBuilder, IConfiguration configuration)
    {
        Dictionary<string, string> secrets = [];

        if (EnvironmentKey.TypeInformation != EnvironmentKey.Type.DEV)
        {
            using IServiceScope scope = applicationBuilder.ApplicationServices.CreateScope();
            IAwsService awsService = scope.ServiceProvider.GetRequiredService<IAwsService>();

            secrets = await awsService.SelectAsync(environmentKey.AWSInformation.SecretManagerInformation.SecretName,
                environmentKey.AWSInformation.SecretManagerInformation.Region);
        }

        FillSecretManagerSqlServerKeys(environmentKey, configuration, secrets);
        FillSecretManagerMultilogKeys(environmentKey, configuration, secrets);

        environmentKey.SqlServerInformation.Server = EnvironmentKey.GetVariable<string>
            (Constant.AWS_SECRET_MANAGER_SQL_SERVER, configuration, secrets);

        environmentKey.SqlServerInformation.DataBase = EnvironmentKey.GetVariable<string>
            (Constant.AWS_SECRET_MANAGER_SQL_DATABASE, configuration, secrets);

        environmentKey.SqlServerInformation.UserId = EnvironmentKey.GetVariable<string>
            (Constant.AWS_SECRET_MANAGER_SQL_USER, configuration, secrets);

        environmentKey.SqlServerInformation.Password = EnvironmentKey.GetVariable<string>
            (Constant.AWS_SECRET_MANAGER_SQL_PASSWORD, configuration, secrets);

        environmentKey.MultilogInformation.Password =
            EnvironmentKey.GetVariable<string>(Constant.AWS_SECRET_MANAGER_MULTILOG_PASSWORD, configuration, secrets);

        environmentKey.MultilogInformation.UserName =
            EnvironmentKey.GetVariable<string>(Constant.AWS_SECRET_MANAGER_MULTILOG_USERNAME, configuration, secrets);
        environmentKey.GatewayInformation.ReceivableToken =
            EnvironmentKey.GetVariable<string>(Constant.AWS_SECRET_MANAGER_RECEIVABLE_GATEWAY_TOKEN, configuration, secrets);

    }

    public static async Task FillEnvironmentVariables(this IApplicationBuilder app, IConfiguration configuration)
    {
        EnvironmentKey environmentKey = app.ApplicationServices.GetRequiredService<EnvironmentKey>();

        FillEnvironmentKeys(environmentKey, configuration);
        await FillSecretManagerInformation(environmentKey, app, configuration);
        ValidateConfigurationBeforeStart(environmentKey, app.ApplicationServices);

    }

    private static void FillSecretManagerSqlServerKeys(EnvironmentKey environmentKey, IConfiguration configuration, Dictionary<string, string> secrets)
    {
        environmentKey.SqlServerInformation.Server = EnvironmentKey.GetVariable<string>
            (Constant.AWS_SECRET_MANAGER_SQL_SERVER, configuration, secrets);

        environmentKey.SqlServerInformation.DataBase = EnvironmentKey.GetVariable<string>
            (Constant.AWS_SECRET_MANAGER_SQL_DATABASE, configuration, secrets);

        environmentKey.SqlServerInformation.UserId = EnvironmentKey.GetVariable<string>
            (Constant.AWS_SECRET_MANAGER_SQL_USER, configuration, secrets);

        environmentKey.SqlServerInformation.Password = EnvironmentKey.GetVariable<string>
            (Constant.AWS_SECRET_MANAGER_SQL_PASSWORD, configuration, secrets);
    }
    private static void FillSecretManagerMultilogKeys(EnvironmentKey environmentKey, IConfiguration configuration, Dictionary<string, string> secrets)
    {
        environmentKey.MultilogInformation.Password = EnvironmentKey.GetVariable<string>
            (Constant.AWS_SECRET_MANAGER_MULTILOG_PASSWORD, configuration, secrets);

        environmentKey.MultilogInformation.UserName = EnvironmentKey.GetVariable<string>
            (Constant.AWS_SECRET_MANAGER_MULTILOG_USERNAME, configuration, secrets);
    }


    private static void ValidateConfigurationBeforeStart(EnvironmentKey environmentKey, IServiceProvider serviceProvider)
    {
        if (!environmentKey.IsValid())
            throw new Exception(SafeLogHelper.SanitizeResponseBody(JsonSerializer.Serialize(new { ErrorMessage = "Some environment variables are not configured", DetailedError = environmentKey })));
    }
}