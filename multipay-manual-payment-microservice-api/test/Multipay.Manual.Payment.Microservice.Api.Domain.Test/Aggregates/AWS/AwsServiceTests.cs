using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Multipay.Manual.Payment.Microservice.Api.Test.Mocks;
using NSubstitute;
using Xunit;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Test.Aggregates.AWS;

public class AwsServiceTests
{
    private readonly IAwsRepository _mockAwsRepository;
    private readonly AwsService _awsService;

    public AwsServiceTests()
    {
        _mockAwsRepository = Substitute.For<IAwsRepository>();
        _awsService = new AwsService(_mockAwsRepository);
    }

    [Fact]
    public async Task Given_ValidSecretAndRegion_When_SelectAsyncIsCalled_Then_ShouldReturnSecretsDictionary()
    {
        // Arrange
        var secret = "test/secret";
        var region = "us-east-1";
        var expectedResult = new Dictionary<string, string> { { "key1", "value1" } };
        _mockAwsRepository.SelectSecretAsync(Arg.Any<string>(), Arg.Any<string>())
            .Returns(Task.FromResult(expectedResult));

        // Act
        var result = await _awsService.SelectAsync(secret, region);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(expectedResult.Count, result.Count);
        Assert.Equal(expectedResult["key1"], result["key1"]);
    }

    [Fact]
    public async Task Given_ValidFileData_When_UploadFileToS3AsyncIsCalled_Then_ShouldReturnS3UploadResult()
    {
        // Arrange
        var fileBytes = MockData.GetMockFileBytes();
        var fileName = "test_file.png";
        var s3Result = MockData.GetMockS3UploadResult();
        _mockAwsRepository.UploadFileToS3Async(Arg.Any<byte[]>(), Arg.Any<string>())
            .Returns(Task.FromResult(Tuple.Create<S3UploadResult?, ErrorResult>(s3Result, new ErrorResult())));

        // Act
        var result = await _awsService.UploadFileToS3Async(fileBytes, fileName);

        // Assert
        Assert.NotNull(result.Item1);
        Assert.Equal(s3Result.Key, result.Item1!.Key);
        Assert.Equivalent(new ErrorResult(), result.Item2);
    }

    [Fact]
    public async Task Given_ErrorFromRepository_When_UploadFileToS3AsyncIsCalled_Then_ShouldReturnErrorResult()
    {
        // Arrange
        var fileBytes = MockData.GetMockFileBytes();
        var fileName = "invalid_file.png";
        var expectedError = MockData.GetMockErrorResult(true);
        _mockAwsRepository.UploadFileToS3Async(Arg.Any<byte[]>(), Arg.Any<string>())
            .Returns(Task.FromResult(Tuple.Create<S3UploadResult?, ErrorResult>(null, expectedError)));

        // Act
        var result = await _awsService.UploadFileToS3Async(fileBytes, fileName);

        // Assert
        Assert.Null(result.Item1);
        Assert.NotNull(result.Item2);
        Assert.True(result.Item2.Error);
        Assert.Equal(expectedError.Message, result.Item2.Message);
    }

}
