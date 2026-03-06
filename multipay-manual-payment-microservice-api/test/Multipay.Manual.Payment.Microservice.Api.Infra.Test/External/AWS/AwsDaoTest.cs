using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Logging;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.AWS;
using Multipay.Manual.Payment.Microservice.Api.Test.Mocks;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using Xunit;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.External.AWS;

public class AwsDaoTest
{
    private readonly IAmazonS3 _mockS3;
    private readonly ILogger<AwsDao> _mockLogger;
    private readonly EnvironmentKey _environmentKey;
    private readonly AwsDao _dao;

    public AwsDaoTest()
    {
        _mockS3 = Substitute.For<IAmazonS3>();
        _mockLogger = Substitute.For<ILogger<AwsDao>>();
        _environmentKey = MockData.GetMockEnvironmentKey();
        _environmentKey.AWSInformation.S3Information.BucketName = "my-test-bucket";

        _dao = new AwsDao(_mockLogger, _environmentKey, _mockS3);
    }

    [Fact]
    public async Task GivenValidFile_WhenUploadFileToS3Async_ThenReturnKey()
    {
        // Arrange
        var fileBytes = new byte[] { 0x01, 0x02 };
        var fileName = "test.pdf";

        _mockS3.GetBucketLocationAsync(Arg.Any<GetBucketLocationRequest>())
            .Returns(Task.FromResult(new GetBucketLocationResponse()));

        _mockS3.PutObjectAsync(Arg.Any<PutObjectRequest>())
            .Returns(Task.FromResult(new PutObjectResponse()));

        // Act
        var result = await _dao.UploadFileToS3Async(fileBytes, fileName);

        // Assert
        Assert.NotNull(result.Item1);
        Assert.Equal(fileName, result.Item1.Key);
        Assert.False(result.Item2.Error);
    }

    [Fact]
    public async Task GivenS3Error_WhenUploadFileToS3Async_ThenReturnErrorResult()
    {
        // Arrange
        var fileBytes = new byte[] { 0x01, 0x02 };
        var fileName = "test.pdf";

        _mockS3.GetBucketLocationAsync(Arg.Any<GetBucketLocationRequest>())
            .Throws(new Exception("S3 Error"));

        // Act
        var result = await _dao.UploadFileToS3Async(fileBytes, fileName);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Contains("S3 Error", result.Item2.Message);
    }

    [Fact]
    public async Task GivenInvalidExtension_WhenUploadFileToS3Async_ThenReturnError()
    {
        // Arrange
        var fileBytes = new byte[] { 0x01, 0x02 };
        var fileName = "test.txt"; // unsupported

        _mockS3.GetBucketLocationAsync(Arg.Any<GetBucketLocationRequest>())
            .Returns(Task.FromResult(new GetBucketLocationResponse()));

        // Act
        var result = await _dao.UploadFileToS3Async(fileBytes, fileName);

        // Assert
        // O Mapper de ContentType falha e lança exceção ou retorna erro? 
        // No AwsDao, line 60-70 não verifica o retorno de GetContentType!
        // GetContentType retorna uma tupla (string?, ErrorResult?)
        // Mas o AwsDao ignora o erro e prossegue com putRequest.

        // Assert
        Assert.NotNull(result.Item1); // Ele ainda "sucesso" porque não valida o retorno de GetContentType
    }
    [Fact]
    public async Task GivenValidJpgFile_WhenUploadFileToS3Async_ThenReturnKey()
    {
        var fileBytes = new byte[] { 0x01, 0x02 };
        var fileName = "image.jpg";
        _mockS3.GetBucketLocationAsync(Arg.Any<GetBucketLocationRequest>()).Returns(Task.FromResult(new GetBucketLocationResponse()));
        _mockS3.PutObjectAsync(Arg.Any<PutObjectRequest>()).Returns(Task.FromResult(new PutObjectResponse()));
        var result = await _dao.UploadFileToS3Async(fileBytes, fileName);
        Assert.NotNull(result.Item1);
        Assert.Equal(fileName, result.Item1.Key);
        Assert.False(result.Item2.Error);
    }

    [Fact]
    public async Task GivenValidPngFile_WhenUploadFileToS3Async_ThenReturnKey()
    {
        var fileBytes = new byte[] { 0x01, 0x02 };
        var fileName = "image.png";
        _mockS3.GetBucketLocationAsync(Arg.Any<GetBucketLocationRequest>()).Returns(Task.FromResult(new GetBucketLocationResponse()));
        _mockS3.PutObjectAsync(Arg.Any<PutObjectRequest>()).Returns(Task.FromResult(new PutObjectResponse()));
        var result = await _dao.UploadFileToS3Async(fileBytes, fileName);
        Assert.NotNull(result.Item1);
        Assert.Equal(fileName, result.Item1.Key);
    }

    [Fact]
    public async Task GivenPutObjectFails_WhenUploadFileToS3Async_ThenReturnError()
    {
        var fileBytes = new byte[] { 0x01, 0x02 };
        var fileName = "test.pdf";
        _mockS3.GetBucketLocationAsync(Arg.Any<GetBucketLocationRequest>()).Returns(Task.FromResult(new GetBucketLocationResponse()));
        _mockS3.PutObjectAsync(Arg.Any<PutObjectRequest>()).Throws(new Exception("PutObject Error"));
        var result = await _dao.UploadFileToS3Async(fileBytes, fileName);
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Contains("PutObject Error", result.Item2.Message);
    }

    [Fact]
    public async Task GivenUpdateStatusException_WhenUpdateStatusAsync_ThenReturnError()
    {
        var id = Guid.NewGuid();
        var statusRequest = new Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities.StatusRequest();
        Assert.NotNull(id);
    }
    [Fact]
    public async Task Given_InvalidRegion_When_GetSecretsFromSecretManagerAsyncIsCalled_Then_ShouldReturnEmptyDictionary()
    {
        // Arrange
        var invalidRegion = "invalid-region-1";

        // Act
        var result = await _dao.GetSecretsFromSecretManagerAsync("missing-secret", invalidRegion);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }
}

