using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.AWS;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Repositories;

public sealed class AwsRepository (IAwsDao AWS) : IAwsRepository
{
    private readonly IAwsDao _awsDAO = AWS;
    public async Task<Dictionary<string, string>> SelectSecretAsync(string? secret = null, string? region = null) => await _awsDAO.GetSecretsFromSecretManagerAsync(secret, region);
     
    public async Task<Tuple<S3UploadResult?, ErrorResult>> UploadFileToS3Async(byte[] fileBytes, string fileName) 
        => await _awsDAO.UploadFileToS3Async(fileBytes, fileName);
}
