using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Extensions.Multipay.ManualPayment;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.Multipay.Entities.Dtos;
using Xunit;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.Data.ManualPayment.Entities.Dtos
{
    public class RequesterExtensionsTest
    {
        [Fact]
        public void GivenRequesterResponse_WhenConvertFromDomain_ThenValuesShouldMatch()
        {
            // Arrange
            var requesterResponse = new RequesterResponse
            {
                Id = "req-123",
                Name = "John Doe",
                Email = "john.doe@multipay.com"
            };

            // Act
            var requesterDto = requesterResponse.FromDomain();

            // Assert
            Assert.Equal(requesterResponse.Id, requesterDto.Id);
            Assert.Equal(requesterResponse.Name, requesterDto.Name);
            Assert.Equal(requesterResponse.Email, requesterDto.Email);
        }

        [Fact]
        public void GivenRequesterDto_WhenConvertToDomain_ThenValuesShouldMatch()
        {
            // Arrange
            var requesterDto = new RequesterDto
            {
                Id = "dto-456",
                Name = "Jane Smith",
                Email = "jane.smith@multipay.com"
            };

            // Act
            var requesterResponse = requesterDto.ToDomain();

            // Assert
            Assert.Equal(requesterDto.Id, requesterResponse.Id);
            Assert.Equal(requesterDto.Name, requesterResponse.Name);
            Assert.Equal(requesterDto.Email, requesterResponse.Email);
        }

        [Fact]
        public void GivenRequesterRequest_WhenConvertFromDomain_ThenValuesShouldMatch()
        {
            // Arrange
            var requesterRequest = new RequesterRequest
            {
                Id = "auth-789",
                Name = "System Admin",
                Email = "admin@multipay.com"
            };

            // Act
            var requesterDto = requesterRequest.FromDomain();

            // Assert
            Assert.Equal(requesterRequest.Id, requesterDto.Id);
            Assert.Equal(requesterRequest.Name, requesterDto.Name);
            Assert.Equal(requesterRequest.Email, requesterDto.Email);
        }

        [Fact]
        public void GivenRequesterWithEmptyFields_WhenConvertToDomain_ThenShouldHandleCorrectly()
        {
            // Arrange
            var requesterDto = new RequesterDto
            {
                Id = string.Empty,
                Name = string.Empty,
                Email = string.Empty
            };

            // Act
            var result = requesterDto.ToDomain();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(string.Empty, result.Id);
            Assert.Equal(string.Empty, result.Name);
            Assert.Equal(string.Empty, result.Email);
        }
    }
}