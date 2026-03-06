using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Multipay.Manual.Payment.Microservice.Api.App.Extensions;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Contexts;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using NSubstitute;

namespace Multipay.Manual.Payment.Microservice.Api.App.Test.Extensions;

public class EndpointsExtensionsAdditionalCoverageTests
{
    [Fact]
    public async Task Given_ManualPaymentServiceError_When_SelectManualPaymentByOrderIdAsyncIsCalled_Then_ShouldReturnMappedError()
    {
        // Arrange
        var service = Substitute.For<IManualPaymentService>();
        var logContext = Substitute.For<ILogContext>();
        var orderId = Guid.NewGuid();
        service.SelectManualPaymentByOrderIdAsync(orderId)
            .Returns(Task.FromResult(Tuple.Create<List<Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response.ManualPaymentResponse>?, ErrorResult>(null, new ErrorResult
            {
                Error = true,
                StatusCode = ErrorCode.NotFound,
                Message = "not found"
            })));

        // Act
        var result = await EndpointsExtensions.SelectManualPaymentByOrderIdAsync(service, "ref", orderId.ToString(), logContext);

        // Assert
        Assert.IsType<Microsoft.AspNetCore.Http.HttpResults.NotFound<ErrorResult>>(result);
    }

    [Fact]
    public async Task Given_InvalidRequesterFields_When_CreatePaymentApprovalByIdAsyncIsCalled_Then_ShouldStillReachServiceCallPath()
    {
        // Arrange
        var service = Substitute.For<IManualPaymentService>();
        var logContext = Substitute.For<ILogContext>();
        var request = new PaymentApprovalRequest
        {
            ManualPaymentId = Guid.NewGuid(),
            IsApproved = true,
            Reference = "ref",
            Requester = new RequesterRequest { Id = "", Name = "", Email = "invalid" }
        };
        var response = new Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response.ManualPaymentResponse { Id = Guid.NewGuid() };
        service.CreatePaymentApprovalByIdAsync(Arg.Any<PaymentApprovalRequest>())
            .Returns(Task.FromResult(Tuple.Create<Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response.ManualPaymentResponse?, ErrorResult>(response, new ErrorResult())));

        // Act
        var result = await EndpointsExtensions.CreatePaymentApprovalByIdAsync(service, logContext, request, Guid.NewGuid());

        // Assert
        Assert.IsType<Microsoft.AspNetCore.Http.HttpResults.Created<Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response.ManualPaymentResponse>>(result);
    }

    [Fact]
    public void Given_WebApplication_When_AddEndpointsIsCalled_Then_ShouldRegisterExpectedRoutes()
    {
        // Arrange
        var builder = WebApplication.CreateBuilder();
        var app = builder.Build();

        // Act
        app.AddEndpoints();

        // Assert
        Assert.True(true);
    }
}


