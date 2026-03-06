using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS;

public interface IAwsService
{
    Task<Dictionary<string, string>> SelectAsync(string? secret = null, string? region = null);   
    Task<Tuple<S3UploadResult?, ErrorResult>> UploadFileToS3Async(byte[] fileBytes, string fileName);
}
