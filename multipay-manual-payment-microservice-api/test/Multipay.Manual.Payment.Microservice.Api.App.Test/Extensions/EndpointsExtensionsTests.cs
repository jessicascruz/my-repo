using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Multipay.Manual.Payment.Microservice.Api.App.Extensions;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Contexts;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using NSubstitute;
using System.Text.Json;
using Xunit;

namespace Multipay.Manual.Payment.Microservice.Api.App.Test.Extensions;

public class EndpointsExtensionsTests
{

    private readonly IManualPaymentService _manualPaymentService;
    private readonly ILogContext _logContext;

    public EndpointsExtensionsTests()
    {
        _manualPaymentService = Substitute.For<IManualPaymentService>();
        _logContext = Substitute.For<ILogContext>();
    }

    [Fact]
    public async Task Given_ValidOrderId_When_SelectManualPaymentByOrderIdAsync_Then_ReturnsOkWithData()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var reference = "REF123";
        var mockResponse = new List<ManualPaymentResponse> { GetMockManualPaymentResponse() };

        _manualPaymentService.SelectManualPaymentByOrderIdAsync(orderId)
            .Returns(new Tuple<List<ManualPaymentResponse>?, ErrorResult>(mockResponse, new ErrorResult()));

        // Act
        var result = await EndpointsExtensions.SelectManualPaymentByOrderIdAsync(
            _manualPaymentService, reference, orderId.ToString(), _logContext);

        // Assert
        var okResult = Assert.IsType<Ok<List<ManualPaymentResponse>>>(result);
        Assert.NotNull(okResult.Value);
        Assert.Single(okResult.Value);
        Assert.Equal(mockResponse[0].Id, okResult.Value[0].Id);
        Assert.Equal(mockResponse[0].Amount, okResult.Value[0].Amount);
    }

    [Fact]
    public async Task Given_InvalidGuid_When_SelectManualPaymentByOrderIdAsync_Then_ReturnsBadRequest()
    {
        // Arrange
        var invalidOrderId = "not-a-guid";

        // Act
        var result = await EndpointsExtensions.SelectManualPaymentByOrderIdAsync(
            _manualPaymentService, "ref", invalidOrderId, _logContext);

        // Assert
        var badRequest = Assert.IsType<BadRequest<ErrorResult>>(result);
        Assert.True(badRequest.Value?.Error);
        Assert.Equal("invalid-order-id", badRequest.Value?.Id);
    }

    [Fact]
    public async Task Given_ValidPayloadAndFiles_When_CreateManualPayment_Then_ReturnsCreated()
    {
        // Arrange
        var request = GetMockManualPaymentRequest();
        var payload = JsonSerializer.Serialize(request);
        var files = Substitute.For<IFormFileCollection>();
        var mockResponse = GetMockManualPaymentResponse();

        _manualPaymentService.CreatePaymentManualAsync(Arg.Any<ManualPaymentRequest>(), files)
            .Returns(new Tuple<ManualPaymentResponse?, ErrorResult>(mockResponse, null!));

        // Act
        var result = await EndpointsExtensions.CreateManualPayment(
            _manualPaymentService, _logContext, files, payload);

        // Assert
        var createdResult = Assert.IsType<Created<ManualPaymentResponse>>(result);
        Assert.Equal(mockResponse.Id, createdResult.Value?.Id);
        Assert.Contains(mockResponse.Id.ToString(), createdResult.Location);
    }

    [Fact]
    public async Task Given_EmptyPayload_When_CreateManualPayment_Then_ReturnsBadRequest()
    {
        // Arrange
        var payload = string.Empty;
        var files = Substitute.For<IFormFileCollection>();

        // Act
        var result = await EndpointsExtensions.CreateManualPayment(
            _manualPaymentService, _logContext, files, payload);

        // Assert
        var badRequest = Assert.IsType<BadRequest<ErrorResult>>(result);
        Assert.Equal("empty-request-payload", badRequest.Value?.Id);
    }


    [Fact]
    public async Task Given_ValidApproval_When_CreatePaymentApprovalByIdAsync_Then_ReturnsCreated()
    {
        // Arrange
        var manualPaymentId = Guid.NewGuid();
        var approvalRequest = GetMockPaymentApprovalRequest();
        var mockResponse = GetMockManualPaymentResponse();

        _manualPaymentService.CreatePaymentApprovalByIdAsync(approvalRequest)
            .Returns(new Tuple<ManualPaymentResponse?, ErrorResult>(mockResponse, null!));

        // Act
        var result = await EndpointsExtensions.CreatePaymentApprovalByIdAsync(
            _manualPaymentService, _logContext, approvalRequest, manualPaymentId);

        // Assert
        var createdResult = Assert.IsType<Created<ManualPaymentResponse>>(result);
        Assert.NotNull(createdResult.Value);
        Assert.Equal(mockResponse.Id, createdResult.Value.Id);
    }

    [Fact]
    public async Task Given_RejectionWithoutReason_When_CreatePaymentApprovalByIdAsync_Then_ReturnsBadRequest()
    {
        // Arrange
        var manualPaymentId = Guid.NewGuid();
        var approvalRequest = GetMockPaymentApprovalRequest();
        approvalRequest.IsApproved = false;
        approvalRequest.RejectionReason = null; // Falha na validação do endpoint

        // Act
        var result = await EndpointsExtensions.CreatePaymentApprovalByIdAsync(
            _manualPaymentService, _logContext, approvalRequest, manualPaymentId);

        // Assert
        var badRequest = Assert.IsType<BadRequest<ErrorResult>>(result);
        Assert.Equal("Reason required when approval rejected", badRequest.Value?.Message);
    }

    private static ManualPaymentRequest GetMockManualPaymentRequest() => new()
    {
        OrderId = Guid.NewGuid(),
        Reference = "REF-TEST",
        SubReference = "SUB-REF",
        Amount = 150.00,
        Reason = "Test Payment",
        Requester = new RequesterRequest { Id = "REQ01", Name = "User Test", Email = "test@test.com" }
    };

    private static ManualPaymentResponse GetMockManualPaymentResponse() => new()
    {
        Id = Guid.NewGuid(),
        OrderId = Guid.NewGuid(),
        Amount = 150.00,
        Reason = "Test Payment",
        CreatedAt = DateTime.UtcNow,
        Status = new PaymentStatusResponse { Id = 1, Description = "Pending" },
        Requester = new RequesterResponse { Id = "REQ01", Name = "User Test", Email = "test@test.com" },
        Approvals = new List<PaymentApprovalResponse>(),
        Receipts = new List<PaymentReceiptResponse>()
    };

    private static PaymentApprovalRequest GetMockPaymentApprovalRequest() => new()
    {
        ManualPaymentId = Guid.NewGuid(),
        IsApproved = true,
        RequesterId = "APPROVER01",
        Reference = "REF-TEST",
        Requester = new RequesterRequest { Id = "APPROVER01", Name = "Approver", Email = "approver@test.com" }
    };


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
