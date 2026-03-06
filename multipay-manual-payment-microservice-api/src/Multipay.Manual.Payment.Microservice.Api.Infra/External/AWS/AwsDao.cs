using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;
using Microsoft.Extensions.Logging;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Newtonsoft.Json;
using System.IO;


namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.AWS;

public sealed class AwsDao(ILogger<AwsDao> logger, 
    EnvironmentKey environmentKey,
    IAmazonS3 s3) : IAwsDao
{
    private readonly ILogger<AwsDao> _logger = logger;
    private readonly IAmazonS3 _s3 = s3;
    private readonly EnvironmentKey _environmentKey = environmentKey;

    public async Task<Dictionary<string, string>> GetSecretsFromSecretManagerAsync(string? secret = null, string? region = null)
    {
        try
        {
            var client = new AmazonSecretsManagerClient(Amazon.RegionEndpoint.GetBySystemName(region ?? environmentKey.AWSInformation.SecretManagerInformation.Region));
            var response = await client
                          .GetSecretValueAsync(new GetSecretValueRequest { SecretId = secret ?? environmentKey.AWSInformation.SecretManagerInformation.SecretName });

            return JsonConvert.DeserializeObject<Dictionary<string, string>>(response.SecretString) ?? [];
        }
        catch (System.Exception e)
        {
            logger.LogError(JsonConvert.SerializeObject(e));
        }

        return [];
    }

    //BUCKET AWS
    public async Task<Tuple<S3UploadResult?, ErrorResult>> UploadFileToS3Async(
    byte[] fileBytes,
    string fileName)
    {
        try
        {


            var request = new GetBucketLocationRequest
            {
                BucketName = _environmentKey.AWSInformation.S3Information.BucketName
            };


            var response = _s3.GetBucketLocationAsync(request).Result;

            var contentType = GetContentType(fileName);

            using var stream = new MemoryStream(fileBytes);

            var putRequest = new PutObjectRequest
            {
                BucketName = _environmentKey.AWSInformation.S3Information.BucketName,
                Key = fileName,
                InputStream = stream
            };

            var response2 = await _s3.PutObjectAsync(putRequest);

            return new(new()
            {
                Key = fileName                
            }, new());
        }
        catch (Exception ex)
        {
            var error = JsonConvert.SerializeObject(ex);
            _logger.LogError(error);

            return new(null, new()
            {
                Error = true,
                Message = $"Error uploading file to S3: {error}",
                StatusCode = ErrorCode.InternalServerError,
            });
        }
    }
    private static (string? ContentType, ErrorResult? Error) GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();

        switch (extension)
        {
            case ".pdf":
                return ("application/pdf", null);

            case ".jpg":
                return ("image/jpg", null);

            case ".png":
                return ("image/png", null);

            default:
                return (null, new ErrorResult
                {
                    Error = true,
                    Message = $"File type '{extension}' is not supported.",
                    StatusCode = ErrorCode.UnprocessableEntity,
                    Id = "unsupported-file-type"
                });
        }
    }
}

