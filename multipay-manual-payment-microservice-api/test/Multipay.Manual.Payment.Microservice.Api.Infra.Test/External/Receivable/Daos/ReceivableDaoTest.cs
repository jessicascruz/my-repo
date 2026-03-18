using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Paging;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dao;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Filter;
using Multipay.Manual.Payment.Microservice.Api.Test.Mocks;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using Xunit;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.External.Receivable.Daos;

public class ReceivableDaoTest
{
    private readonly IRequest _mockRequest;
    private readonly ILogger<IReceivableDao> _mockLogger;
    private readonly EnvironmentKey _environmentKey;
    private readonly ReceivableDao _dao;

    public ReceivableDaoTest()
    {
        _mockRequest = Substitute.For<IRequest>();
        _mockLogger = Substitute.For<ILogger<IReceivableDao>>();
        _environmentKey = MockData.GetMockEnvironmentKey();
        _environmentKey.MicroserviceInformation.ReceivableEndpoint = "http://api.test";
        _environmentKey.GatewayInformation.ReceivableToken = "token-123";

        _dao = new ReceivableDao(_mockRequest, _mockLogger, _environmentKey);
    }

    [Fact]
    public async Task GivenValidFilter_WhenGetReceivableOrderByFilterAsync_ThenReturnReceivableDto()
    {
        // Arrange
        var filter = new FilterDto { OrderId = Guid.NewGuid() };
        var receivableDto = new ReceivableDto { Id = filter.OrderId.Value, Status = "APPROVED", Amount = 100.0 };
        var searchResult = new Search<ReceivableDto> { Data = new List<ReceivableDto> { receivableDto } };

        var responseMessage = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(searchResult))
        };

        _mockRequest.GetAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CustomHeaders>(), Arg.Any<string>())
            .Returns(responseMessage);

        // Act
        var result = await _dao.GetReceivableOrderByFilterAsync(filter);

        // Assert
        Assert.NotNull(result.Item1);
        Assert.Equal(receivableDto.Id, result.Item1.Id);
        Assert.False(result.Item2.Error);
    }

    [Fact]
    public async Task GivenApiError_WhenGetReceivableOrderByFilterAsync_ThenReturnErrorResult()
    {
        // Arrange
        var filter = new FilterDto { OrderId = Guid.NewGuid() };
        var responseMessage = new HttpResponseMessage(HttpStatusCode.BadRequest)
        {
            Content = new StringContent("Bad Request Error")
        };

        _mockRequest.GetAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CustomHeaders>(), Arg.Any<string>())
            .Returns(responseMessage);

        // Act
        var result = await _dao.GetReceivableOrderByFilterAsync(filter);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Equal("Bad Request Error", result.Item2.Message);
    }

    [Fact]
    public async Task GivenException_WhenGetReceivableOrderByFilterAsync_ThenReturnInternalError()
    {
        // Arrange
        var filter = new FilterDto { OrderId = Guid.NewGuid() };
        _mockRequest.GetAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CustomHeaders>(), Arg.Any<string>())
            .Throws(new Exception("Connection Error"));

        // Act
        var result = await _dao.GetReceivableOrderByFilterAsync(filter);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
    }

    [Fact]
    public async Task GivenValidData_WhenUpdateStatusAsync_ThenReturnSuccess()
    {
        // Arrange
        var id = Guid.NewGuid();
        var statusRequest = new StatusRequest();
        var responseMessage = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("Success")
        };

        _mockRequest.PatchAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CustomHeaders>(), Arg.Any<object>())
            .Returns(responseMessage);

        // Act
        var result = await _dao.UpdateStatusAsync(id, statusRequest);

        // Assert
        Assert.False(result.Error);
    }

    [Fact]
    public async Task GivenApiError_WhenUpdateStatusAsync_ThenReturnErrorResult()
    {
        // Arrange
        var id = Guid.NewGuid();
        var statusRequest = new StatusRequest();
        var responseMessage = new HttpResponseMessage(HttpStatusCode.NotFound)
        {
            Content = new StringContent("Not Found")
        };

        _mockRequest.PatchAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CustomHeaders>(), Arg.Any<object>())
            .Returns(responseMessage);

        // Act
        var result = await _dao.UpdateStatusAsync(id, statusRequest);

        // Assert
        Assert.True(result.Error);
        Assert.Equal("Not Found", result.Message);
    }
    [Fact]
    public async Task GivenException_WhenUpdateStatusAsync_ThenReturnInternalError()
    {
        // Arrange
        var id = Guid.NewGuid();
        var statusRequest = new StatusRequest();
        _mockRequest.PatchAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CustomHeaders>(), Arg.Any<object>())
            .Throws(new Exception("Patch failed"));

        // Act
        var result = await _dao.UpdateStatusAsync(id, statusRequest);

        // Assert
        Assert.True(result.Error);
    }

    [Fact]
    public async Task GivenUnmappedStatusCode_WhenGetReceivableOrderByFilterAsync_ThenReturnError()
    {
        // Arrange
        var filter = new FilterDto { OrderId = Guid.NewGuid() };
        
        var responseMessage = new HttpResponseMessage((System.Net.HttpStatusCode)0)
        {
            Content = new StringContent("Unknown Error")
        };

        _mockRequest.GetAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CustomHeaders>(), Arg.Any<string>())
            .Returns(responseMessage);

        // Act
        var result = await _dao.GetReceivableOrderByFilterAsync(filter);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
    }
}
