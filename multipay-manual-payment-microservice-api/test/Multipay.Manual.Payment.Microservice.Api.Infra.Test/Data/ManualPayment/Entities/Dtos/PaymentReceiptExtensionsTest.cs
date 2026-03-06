using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Extensions.Multipay.ManualPayment;
using Xunit;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.Data.ManualPayment.Entities.Dtos
{
    public class PaymentReceiptExtensionsTest
    {
        [Fact]
        public void GivenPaymentReceiptResponse_WhenConvertFromDomain_ThenValuesShouldMatch()
        {
            // Arrange
            var response = new PaymentReceiptResponse
            {
                Id = Guid.NewGuid(),
                DocumentName = "nota_fiscal_servico.pdf",
                CreatedAt = DateTime.UtcNow,
                ManualPaymentId = Guid.NewGuid()
            };

            // Act
            var dto = response.FromDomain();

            // Assert
            Assert.Equal(response.Id, dto.Id);
            Assert.Equal(response.DocumentName, dto.DocumentName);
            Assert.Equal(response.CreatedAt, dto.CreatedAt);
            Assert.Equal(response.ManualPaymentId, dto.ManualPaymentId);
        }

        [Fact]
        public void GivenPaymentReceiptDto_WhenConvertToDomain_ThenValuesShouldMatch()
        {
            // Arrange
            var dto = new PaymentReceiptDto
            {
                Id = Guid.NewGuid(),
                DocumentName = "comprovante_pix.png",
                CreatedAt = DateTime.UtcNow.AddMinutes(-10),
                ManualPaymentId = Guid.NewGuid()
            };

            // Act
            var response = dto.ToDomain();

            // Assert
            Assert.Equal(dto.Id, response.Id);
            Assert.Equal(dto.DocumentName, response.DocumentName);
            Assert.Equal(dto.CreatedAt, response.CreatedAt);
            Assert.Equal(dto.ManualPaymentId, response.ManualPaymentId);
        }

        [Fact]
        public void GivenPaymentReceiptRequest_WhenConvertFromDomain_ThenValuesShouldMatch()
        {
            // Arrange
            var request = new PaymentReceiptRequest
            {
                Id = Guid.NewGuid(),
                ManualPaymentId = Guid.NewGuid(),
                DocumentName = "fatura_cartao.pdf",
                CreatedAt = DateTime.UtcNow
            };

            // Act
            var dto = request.FromDomain();

            // Assert
            Assert.Equal(request.Id, dto.Id);
            Assert.Equal(request.ManualPaymentId, dto.ManualPaymentId);
            Assert.Equal(request.DocumentName, dto.DocumentName);
            Assert.Equal(request.CreatedAt, dto.CreatedAt);
        }

        [Fact]
        public void GivenPaymentReceiptDtoList_WhenConvertToDomainList_ThenValuesShouldMatch()
        {
            // Arrange
            var dtoList = new List<PaymentReceiptDto>
            {
                new() { Id = Guid.NewGuid(), DocumentName = "Doc1.pdf" },
                new() { Id = Guid.NewGuid(), DocumentName = "Doc2.png" }
            };

            // Act
            var responseList = dtoList.ToDomain();

            // Assert
            Assert.Equal(dtoList.Count, responseList.Count);
            Assert.Equal(dtoList[0].Id, responseList[0].Id);
            Assert.Equal(dtoList[1].DocumentName, responseList[1].DocumentName);
        }

        [Fact]
        public void GivenPaymentReceiptRequestList_WhenConvertFromDomainList_ThenValuesShouldMatch()
        {
            // Arrange
            var requestList = new List<PaymentReceiptRequest>
            {
                new() { Id = Guid.NewGuid(), DocumentName = "Req1.pdf" },
                new() { Id = Guid.NewGuid(), DocumentName = "Req2.pdf" }
            };

            // Act
            var dtoList = requestList.FromDomain();

            // Assert
            Assert.Equal(requestList.Count, dtoList.Count);
            Assert.Equal(requestList[0].Id, dtoList[0].Id);
            Assert.Equal(requestList[1].DocumentName, dtoList[1].DocumentName);
        }

        [Fact]
        public void GivenNullRequestList_WhenConvertFromDomainList_ThenShouldReturnEmptyList()
        {
            // Arrange
            List<PaymentReceiptRequest> nullList = null!;

            // Act
            var result = nullList.FromDomain();

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }
    }
}