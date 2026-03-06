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

        #region SelectManualPaymentByOrderIdAsync Tests

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

        #endregion

        #region CreateManualPayment Tests

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

        #endregion

        #region CreatePaymentApprovalByIdAsync Tests

        [Fact]
        public async Task Given_ValidApproval_When_CreatePaymentApprovalByIdAsync_Then_ReturnsCreated()
        {
            // Arrange
            var manualPaymentId = Guid.NewGuid();
            var approvalRequest = GetMockPaymentApprovalRequest();
            var mockResponse = GetMockManualPaymentResponse();
            // Nota: O endpoint retorna o ManualPaymentResponse após aprovação

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

        #endregion

        #region Mocks

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

        #endregion
}
