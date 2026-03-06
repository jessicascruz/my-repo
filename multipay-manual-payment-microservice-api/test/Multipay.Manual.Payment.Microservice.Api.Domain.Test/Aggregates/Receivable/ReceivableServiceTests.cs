using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities.Filter;
using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Multipay.Manual.Payment.Microservice.Api.Test.Mocks;
using NSubstitute;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Test.Aggregates.Receivable;

public class ReceivableServiceTests
{
    private readonly IReceivableRepository _receivableRepository;
    private readonly ReceivableService _service;

    public ReceivableServiceTests()
    {
        _receivableRepository = Substitute.For<IReceivableRepository>();
        _service = new ReceivableService(_receivableRepository);
    }

    [Fact]
    public async Task Given_ValidOrderId_When_GetReceivableOrderByIdAsyncIsCalled_Then_ShouldBuildExpectedFilterAndReturnResult()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var expectedResponse = MockData.GetMockReceivableResponse();
        expectedResponse.Id = orderId;

        _receivableRepository
            .GetReceivableOrderByFilterAsync(Arg.Any<ReceivableFilter>())
            .Returns(Task.FromResult(Tuple.Create<ReceivableResponse?, ErrorResult>(expectedResponse, new ErrorResult())));

        // Act
        var result = await _service.GetReceivableOrderByIdAsync(orderId);

        // Assert
        await _receivableRepository.Received(1)
            .GetReceivableOrderByFilterAsync(Arg.Is<ReceivableFilter>(x =>
                x.OrderId == orderId &&
                x.RetrievePayments == RetrievePaymentsEnum.All &&
                x.RetrieveRefunds == RetrieveRefundsEnum.All));

        Assert.NotNull(result.Item1);
        Assert.Equal(orderId, result.Item1!.Id);
        Assert.Equivalent(new ErrorResult(), result.Item2);
    }

    [Fact]
    public async Task Given_StatusRequest_When_UpdateStatusAsyncIsCalled_Then_ShouldCallRepositoryAndReturnErrorResult()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var statusRequest = MockData.GetMockStatusRequest();
        var expectedError = MockData.GetMockErrorResult(false);

        _receivableRepository.UpdateStatusAsync(Arg.Any<Guid>(), Arg.Any<StatusRequest>())
            .Returns(Task.FromResult(expectedError));

        // Act
        var result = await _service.UpdateStatusAsync(orderId, statusRequest);

        // Assert
        await _receivableRepository.Received(1).UpdateStatusAsync(orderId, statusRequest);
        Assert.Equal(expectedError.Error, result.Error);
        Assert.Equal(expectedError.StatusCode, result.StatusCode);
    }
}
