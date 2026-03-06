using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS;

public sealed class AwsService(IAwsRepository awsRepository) : IAwsService
{
    private readonly IAwsRepository _awsRepository = awsRepository;
    public Task<Dictionary<string, string>> SelectAsync(string? secret, string? region) => _awsRepository.SelectSecretAsync(secret, region);
        
    public async Task<Tuple<S3UploadResult?, ErrorResult>> UploadFileToS3Async(byte[] fileBytes, string fileName) 
        => await _awsRepository.UploadFileToS3Async(fileBytes, fileName);

}
