﻿using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.Multipay.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Extensions.Multipay.ManualPayment;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.Data.ManualPayment.Entities.Dtos
{
    public class ManualPaymentsExtensionsTest
    {
        [Fact]
        public void GivenManualPaymentDto_WhenConvertToDomain_ThenValuesShouldMatch()
        {
            // Arrange
            var manualPaymentDto = new ManualPaymentDto
            {
                Id = Guid.NewGuid(),
                OrderId = Guid.NewGuid(),
                Amount = 1500.50,
                Reason = "Pagamento de Teste",
                ApprovedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow.AddHours(-1),
                UpdatedAt = DateTime.UtcNow,
                Status = new PaymentStatusDto { Id = 1, Description = "Pending" },
                Requester = new RequesterDto { Id = "user-01", Name = "John Doe", Email = "john@test.com" },
                Receipts = new List<PaymentReceiptDto>
                {
                    new() { Id = Guid.NewGuid(), DocumentName = "doc.pdf" }
                },
                Approvals = new List<PaymentApprovalDto>
                {
                    new() { Id = Guid.NewGuid(), IsApproved = true }
                }
            };

            // Act
            var response = manualPaymentDto.ToDomain();

            // Assert
            Assert.Equal(manualPaymentDto.Id, response.Id);
            Assert.Equal(manualPaymentDto.OrderId, response.OrderId);
            Assert.Equal(manualPaymentDto.Amount, response.Amount);
            Assert.Equal(manualPaymentDto.Reason, response.Reason);
            Assert.Equal(manualPaymentDto.ApprovedAt, response.ApprovedAt);
            Assert.Equal(manualPaymentDto.Status.Id, response.Status.Id);
            Assert.Equal(manualPaymentDto.Requester.Name, response.Requester.Name);
            Assert.Single(response.Receipts);
            Assert.Equal(manualPaymentDto.Receipts.First().DocumentName, response.Receipts.First().DocumentName);
            Assert.Single(response.Approvals);
        }

        [Fact]
        public void GivenListManualPaymentDto_WhenConvertToDomainList_ThenAllItemsShouldMatch()
        {
            // Arrange
            var dtoList = new List<ManualPaymentDto>
            {
                new() { Id = Guid.NewGuid(), Amount = 100, Status = new() { Description = "S1" } },
                new() { Id = Guid.NewGuid(), Amount = 200, Status = new() { Description = "S2" } }
            };

            // Act
            var resultList = dtoList.ToDomain();

            // Assert
            Assert.Equal(dtoList.Count, resultList.Count);
            Assert.Equal(dtoList[0].Id, resultList[0].Id);
            Assert.Equal(dtoList[1].Amount, resultList[1].Amount);
        }

        [Fact]
        public void GivenManualPaymentRequest_WhenConvertFromDomain_ThenValuesShouldMatch()
        {
            // Arrange
            var manualPaymentId = Guid.NewGuid();
            var request = new ManualPaymentRequest
            {
                OrderId = Guid.NewGuid(),
                Amount = 2500.00,
                Reason = "Requisição de Reembolso",
                Requester = new RequesterRequest { Id = "req-123", Name = "Jane Doe" },
                Approvals = new List<PaymentApprovalResponse>
                {
                    new() { Id = Guid.NewGuid(), IsApproved = false }
                }
            };

            // Act
            var dto = request.FromDomain(manualPaymentId);

            // Assert
            Assert.Equal(manualPaymentId, dto.Id);
            Assert.Equal(request.OrderId, dto.OrderId);
            Assert.Equal(request.Amount, dto.Amount);
            Assert.Equal(request.Reason, dto.Reason);
            Assert.Equal(request.Requester.Id, dto.RequesterId);
            Assert.NotNull(dto.Approvals);
            // Verifica se o mapeamento de requester de 1º grau ocorreu
            Assert.Equal(request.Requester.Id, dto.Requester?.Id);
        }

        [Fact]
        public void GivenManualPaymentDtoWithNullRequester_WhenConvertToDomain_ThenRequesterShouldBeNull()
        {
            // Arrange
            var dto = new ManualPaymentDto
            {
                Id = Guid.NewGuid(),
                Requester = null, // Testando a nulidade do operador ?.
                Status = new PaymentStatusDto { Description = "OK" }
            };

            // Act
            var response = dto.ToDomain();

            // Assert
            Assert.Null(response.Requester);
        }

        [Fact]
        public void GivenManualPaymentDtoWithNullCollections_WhenConvertToDomain_ThenCollectionsShouldBeEmptyOrNull()
        {
            // Arrange
            var dto = new ManualPaymentDto
            {
                Id = Guid.NewGuid(),
                Receipts = null!,
                Approvals = null!,
                Status = new PaymentStatusDto { Description = "Pending" }
            };

            // Act
            var response = dto.ToDomain();

            // Assert
            // Verifica se o domínio inicializa as listas como vazias ou permite null, dependendo da sua regra de negócio.
            // Assumindo que o domínio prefere listas vazias para evitar NullReference posterior:
            Assert.True(response.Receipts == null || !response.Receipts.Any());
            Assert.True(response.Approvals == null || !response.Approvals.Any());
        }
    }
}
