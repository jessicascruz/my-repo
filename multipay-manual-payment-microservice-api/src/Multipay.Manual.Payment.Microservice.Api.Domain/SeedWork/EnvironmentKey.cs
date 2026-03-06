using Microsoft.Extensions.Configuration;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog.Entities;
namespace Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;

public class EnvironmentKey : ObjectValidator
{
    public AWS AWSInformation { get; set; } = new();
    public static Type TypeInformation { get; set; } = GetEnvironment();
    public SqlServer SqlServerInformation { get; set; } = new();
    public Multilog MultilogInformation { get; set; } = new();
    public bool IsValid() => AllPropertiesAreFilled(this);
    public Persistence PersistenceInformation { get; set; } = new();
    public Gateway GatewayInformation { get; } = new();
    public Microservice MicroserviceInformation { get; } = new();

    public class Gateway    
    {
        public string ReceivableToken { get; set; } = string.Empty;
    }

    

    public class Microservice
    {
        public string ReceivableEndpoint { get; set; } = string.Empty;        
    }

    public class Persistence
    {
        public string ValidStatusOrder { get; set; } = string.Empty;         

    }

    public class AWS
    {
        public SecretManager SecretManagerInformation { get; set; } = new();

        public class SecretManager
        {
            public string SecretName { get; set; } = string.Empty;
            public string Region { get; set; } = string.Empty;
        }
        public AmazonS3 S3Information { get; set; } = new();
        public class AmazonS3
        {
            public string BucketName { get; set; } = string.Empty;
        }
    }

    public enum Type
    {
        DEV,
        QA,
        PROD
    }
    private static Type GetEnvironment()
    {
        string env = Environment.GetEnvironmentVariable(Constant.APP_ENV)!;
        return env switch
        {
            Constant.APP_ENV_QA => Type.QA,
            Constant.APP_ENV_PROD => Type.PROD,
            _ => Type.DEV,
        };
    }
    public static T GetVariable<T>(string constant, IConfiguration configuration)
    {
        try
        {
            if (constant is null) throw new ArgumentNullException(constant);

            if (TypeInformation != Type.DEV)
            {
                return (T)Convert.ChangeType(Environment.GetEnvironmentVariable(constant) ?? string.Empty, typeof(T));
            }
            else
            {
                return (T)Convert.ChangeType(configuration[constant] ?? string.Empty, typeof(T));
            }
        }
        catch (System.Exception)
        {
            throw new NotImplementedException($"Missing an environment variable: {constant}");
        }
    }

    public static T GetVariable<T>(string constant, IConfiguration configuration, Dictionary<string, string> secrets)
    {
        try
        {
            if (TypeInformation != Type.DEV)
            {
                return (T)Convert.ChangeType(secrets.GetValueOrDefault(constant) ?? string.Empty, typeof(T));
            }
            else
            {
                return (T)Convert.ChangeType(configuration[constant] ?? string.Empty, typeof(T));
            }
        }
        catch (System.Exception)
        {
            throw new NotImplementedException($"Missing an environment variable: {constant}");
        }
    }

    public class SqlServer
    {
        public string Server { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string DataBase { get; set; } = string.Empty;

        public string ConnectionString => $"SERVER={Server};UID={UserId};PWD={Password};DATABASE={DataBase};TrustServerCertificate=True";
    }
    public class Multilog
    {
        public string Endpoint { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

}
