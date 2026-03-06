namespace Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;

public sealed class Constant
{
    public const string APP_NAME = "MULTIPAY-MANUAL-PAYMENT-MICROSERVICE-API";
    public const string APP_ENV = "APP_ENV";
    public const string APP_ENV_DEV = "DEV";
    public const string APP_ENV_QA = "QA";
    public const string APP_ENV_PROD = "PROD";
    public const int MINIMUN_APPROVALS = 1;

    public const string AWS_SECRET_MANAGER_NAME = "AWS_SECRET_MANAGER_NAME";
    public const string AWS_SECRET_MANAGER_REGION = "AWS_SECRET_MANAGER_REGION";
    public const string AWS_S3_BUCKET_NAME = "AWS_S3_BUCKET_NAME";

    //TESTE
    public const string AWS_ACCESS_KEY_ID = "AWS_ACCESS_KEY_ID";
    public const string AWS_SECRET_ACCESS_KEY = "AWS_SECRET_ACCESS_KEY";
    public const string AWS_SESSION_TOKEN = "AWS_SESSION_TOKEN";

    public const string MULTILOG_REQUEST_ENDPOINT = "MULTILOG_REQUEST_ENDPOINT";
    public const string APP_MULTILOG_SYSTEM_NAME = "multipay";
    public const string MULTILOG_CAUSER_NAME = "system";
    public const string APP_MULTILOG_REFERENCE_TYPE = "multipay-manual-payment-microservice-api";
    public const string APP_MULTILOG_CACHE_TOKEN_KEY = "APP_MULTILOG_CACHE_TOKEN_KEY";
    public const string AWS_SECRET_MANAGER_MULTILOG_USERNAME = "multilog-username";
    public const string AWS_SECRET_MANAGER_MULTILOG_PASSWORD = "multilog-password";

    public const string AWS_SECRET_MANAGER_SQL_SERVER = "sql-server";
    public const string AWS_SECRET_MANAGER_SQL_USER = "sql-user";
    public const string AWS_SECRET_MANAGER_SQL_PASSWORD = "sql-password";
    public const string AWS_SECRET_MANAGER_SQL_DATABASE = "sql-database";
    

    public const string MICROSERVICE_RECEIVABLE_REQUEST_ENDPOINT = "MICROSERVICE_RECEIVABLE_REQUEST_ENDPOINT";
    public const string AWS_SECRET_MANAGER_RECEIVABLE_GATEWAY_TOKEN = "receivable-gateway-token";
    public const string SELECT_RECEIVABLE_ORDER = "SELECT_RECEIVABLE_ORDER";

    public const string VALID_STATUS_ORDER = "VALID_STATUS_ORDER";
    public const string ACCEPTABLE_FORMATS = "ACCEPTABLE_FORMATS";




}
