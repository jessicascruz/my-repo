using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Extensions.Multipay.ManualPayment;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.Multipay.Entities.Dtos;
using Xunit;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.Data.ManualPayment.Entities.Dtos
{
    public class PaymentApprovalExtensionsTest
    {
        [Fact]
        public void GivenPaymentApprovalResponse_WhenConvertFromDomain_ThenValuesShouldMatch()
        {
            // Arrange
            var response = new PaymentApprovalResponse
            {
                Id = Guid.NewGuid(),
                ManualPaymentId = Guid.NewGuid(),
                IsApproved = true,
                RequesterId = "user-123",
                RejectionReason = null,
                Requester = new RequesterResponse { Id = "user-123", Name = "Admin", Email = "admin@test.com" }
            };

            // Act
            var dto = response.FromDomain();

            // Assert
            Assert.Equal(response.Id, dto.Id);
            Assert.Equal(response.ManualPaymentId, dto.ManualPaymentId);
            Assert.Equal(response.IsApproved, dto.IsApproved);
            Assert.Equal(response.RequesterId, dto.RequesterId);
            Assert.Equal(response.RejectionReason, dto.RejectionReason);
            Assert.NotNull(dto.Requester);
            Assert.Equal(response.Requester.Id, dto.Requester.Id);
        }

        [Fact]
        public void GivenPaymentApprovalRequest_WhenConvertFromDomainWithId_ThenValuesShouldMatch()
        {
            // Arrange
            var manualPaymentId = Guid.NewGuid();
            var approvalId = Guid.NewGuid();
            var request = new PaymentApprovalRequest
            {
                ManualPaymentId = manualPaymentId,
                IsApproved = false,
                RequesterId = "req-456",
                RejectionReason = "Documentação incompleta",
                Requester = new RequesterRequest { Id = "req-456", Name = "Manager" }
            };

            // Act
            var dto = request.FromDomain(approvalId);

            // Assert
            Assert.Equal(approvalId, dto.Id);
            Assert.Equal(request.ManualPaymentId, dto.ManualPaymentId);
            Assert.Equal(request.IsApproved, dto.IsApproved);
            Assert.Equal(request.RequesterId, dto.RequesterId);
            Assert.Equal(request.RejectionReason, dto.RejectionReason);
            Assert.Equal(request.Requester.Id, dto.Requester?.Id);
        }

        [Fact]
        public void GivenPaymentApprovalDto_WhenConvertToDomain_ThenValuesShouldMatch()
        {
            // Arrange
            var dto = new PaymentApprovalDto
            {
                Id = Guid.NewGuid(),
                ManualPaymentId = Guid.NewGuid(),
                IsApproved = true,
                RequesterId = "auth-789",
                RejectionReason = "N/A",
                Requester = new RequesterDto { Id = "auth-789", Name = "Reviewer" }
            };

            // Act
            var response = dto.ToDomain();

            // Assert
            Assert.Equal(dto.Id, response.Id);
            Assert.Equal(dto.ManualPaymentId, response.ManualPaymentId);
            Assert.Equal(dto.IsApproved, response.IsApproved);
            Assert.Equal(dto.RequesterId, response.RequesterId);
            Assert.Equal(dto.RejectionReason, response.RejectionReason);
            Assert.NotNull(response.Requester);
            Assert.Equal(dto.Requester.Name, response.Requester.Name);
        }

        [Fact]
        public void GivenPaymentApprovalDtoList_WhenConvertToDomainList_ThenListValuesShouldMatch()
        {
            // Arrange
            var dtoList = new List<PaymentApprovalDto>
            {
                new() { Id = Guid.NewGuid(), IsApproved = true },
                new() { Id = Guid.NewGuid(), IsApproved = false }
            };

            // Act
            var responseList = dtoList.ToDomain();

            // Assert
            Assert.Equal(dtoList.Count, responseList.Count);
            Assert.Equal(dtoList[0].Id, responseList[0].Id);
            Assert.Equal(dtoList[1].IsApproved, responseList[1].IsApproved);
        }

        [Fact]
        public void GivenPaymentApprovalResponseList_WhenConvertFromDomainList_ThenListValuesShouldMatch()
        {
            // Arrange
            var responseList = new List<PaymentApprovalResponse>
            {
                new() { Id = Guid.NewGuid(), RequesterId = "1" },
                new() { Id = Guid.NewGuid(), RequesterId = "2" }
            };

            // Act
            var dtoList = responseList.FromDomain();

            // Assert
            Assert.Equal(responseList.Count, dtoList.Count);
            Assert.Equal(responseList[0].Id, dtoList[0].Id);
            Assert.Equal(responseList[1].RequesterId, dtoList[1].RequesterId);
        }

        [Fact]
        public void GivenNullDtoList_WhenConvertToDomain_ThenShouldReturnEmptyList()
        {
            // Arrange
            List<PaymentApprovalDto> nullList = null!;

            // Act
            var result = nullList.ToDomain();

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }
    }
}