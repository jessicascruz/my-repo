using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Multipay.Manual.Payment.Microservice.Api.App.Extensions;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Contexts;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using NSubstitute;

namespace Multipay.Manual.Payment.Microservice.Api.App.Test.Extensions;

public class EndpointsExtensionsErrorMappingTests
{
    [Fact]
    public void Given_AllErrorCodes_When_GenerateErrorResultIsCalled_Then_ShouldAlwaysReturnIResult()
    {
        // Arrange
        var errorCodes = Enum.GetValues<ErrorCode>();

        // Act
        var results = errorCodes.Select(code => EndpointsExtensions.GenerateErrorResult(new ErrorResult
        {
            Error = true,
            Message = $"error-{code}",
            StatusCode = code,
            Id = "id"
        })).ToList();

        // Assert
        Assert.Equal(errorCodes.Length, results.Count);
        Assert.All(results, Assert.NotNull);
    }

    [Fact]
    public async Task Given_InvalidJsonPayload_When_CreateManualPaymentIsCalled_Then_ShouldReturnBadRequest()
    {
        // Arrange
        var service = Substitute.For<IManualPaymentService>();
        var logContext = Substitute.For<ILogContext>();
        var files = Substitute.For<IFormFileCollection>();

        // Act
        var result = await EndpointsExtensions.CreateManualPayment(service, logContext, files, "{not-valid-json}");

        // Assert
        var badRequest = Assert.IsType<BadRequest<ErrorResult>>(result);
        Assert.Equal("invalid-json-payload", badRequest.Value?.Id);
    }

    [Fact]
    public async Task Given_NullJsonPayload_When_CreateManualPaymentIsCalled_Then_ShouldReturnBadRequest()
    {
        // Arrange
        var service = Substitute.For<IManualPaymentService>();
        var logContext = Substitute.For<ILogContext>();
        var files = Substitute.For<IFormFileCollection>();

        // Act
        var result = await EndpointsExtensions.CreateManualPayment(service, logContext, files, "null");

        // Assert
        var badRequest = Assert.IsType<BadRequest<ErrorResult>>(result);
        Assert.Equal("null-manual-payment-request", badRequest.Value?.Id);
    }

    [Fact]
    public async Task Given_ServiceError_When_CreateManualPaymentIsCalled_Then_ShouldReturnMappedErrorResult()
    {
        // Arrange
        var service = Substitute.For<IManualPaymentService>();
        var logContext = Substitute.For<ILogContext>();
        var files = Substitute.For<IFormFileCollection>();
        var payload = "{\"orderId\":\"c9f3db38-9c72-4db8-bb3c-e72ec6c93909\",\"reference\":\"ref\",\"subReference\":\"sub\",\"amount\":100,\"reason\":\"x\",\"requester\":{\"id\":\"1\",\"name\":\"n\",\"email\":\"a@a.com\"}}";

        service.CreatePaymentManualAsync(Arg.Any<ManualPaymentRequest>(), Arg.Any<IFormFileCollection>())
            .Returns(Task.FromResult(Tuple.Create<Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response.ManualPaymentResponse?, ErrorResult>(null, new ErrorResult
            {
                Error = true,
                StatusCode = ErrorCode.BadRequest,
                Message = "failure"
            })));

        // Act
        var result = await EndpointsExtensions.CreateManualPayment(service, logContext, files, payload);

        // Assert
        Assert.IsType<BadRequest<ErrorResult>>(result);
    }
}

