using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Extensions.Multipay.ManualPayment;
using Xunit;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.Data.ManualPayment.Entities.Dtos
{
    public class PaymentStatusExtensionsTest
    {
        [Fact]
        public void GivenPaymentStatusResponse_WhenConvertFromDomain_ThenValuesShouldMatch()
        {
            // Arrange
            var response = new PaymentStatusResponse
            {
                Id = 1, 
                Description = "PENDING"
            };

            // Act
            var dto = response.FromDomain();

            // Assert
            Assert.Equal(response.Description, dto.Description);
            Assert.True(dto.CreatedAt <= DateTime.UtcNow);
        }

        [Fact]
        public void GivenPaymentStatusDto_WhenConvertToDomain_ThenValuesShouldMatch()
        {
            // Arrange
            var dto = new PaymentStatusDto
            {
                Id = 2,
                Description = "APPROVED",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Act
            var response = dto.ToDomain();

            // Assert
            Assert.Equal(dto.Id, response.Id);
            Assert.Equal(dto.Description, response.Description);
        }

        [Fact]
        public void GivenPaymentStatusResponse_WhenDescriptionIsEmpty_ThenDtoShouldHaveEmptyDescription()
        {
            // Arrange
            var response = new PaymentStatusResponse
            {
                Id = 0,
                Description = string.Empty
            };

            // Act
            var dto = response.FromDomain();

            // Assert
            Assert.Equal(string.Empty, dto.Description);
        }

        [Fact]
        public void GivenPaymentStatusDto_WhenMapped_ThenShouldEnsureInstanceIsNotNull()
        {
            // Arrange
            var dto = new PaymentStatusDto { Id = 3, Description = "REJECTED" };

            // Act
            var response = dto.ToDomain();

            // Assert
            Assert.NotNull(response);
            Assert.Equal("REJECTED", response.Description);
        }
    }
}