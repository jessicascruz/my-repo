using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.Multipay.Entities.Dtos;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.Data.ManualPayment.Entities.Dtos
{
    public class ManualPaymentDtoTests
    {
        [Fact]
        public void GivenDefinitionOfManualPaymentDtoProperties_WhenDefinePropertiesForManualPaymentDto_ThenEnsureManualPaymentDtoPropertiesAreDefinedCorrectly()
        {
            // Arrange
            var id = Guid.NewGuid();
            var orderId = Guid.NewGuid();
            var approvalId = Guid.NewGuid();
            var receiptId = Guid.NewGuid();
            var now = DateTime.UtcNow;

            var manualPaymentDto = new ManualPaymentDto
            {
                Id = id,
                OrderId = orderId,
                Amount = 1500.50,
                Reason = "Pagamento de fornecedor",
                ApprovedAt = now,
                CreatedAt = now,
                UpdatedAt = now,
                RequesterId = "user_01",
                StatusId = 1,
                Requester = new RequesterDto
                {
                    Id = "user_01",
                    Name = "João Silva",
                    Email = "joao@multipay.com"
                },
                Status = new PaymentStatusDto
                {
                    Id = 1,
                    Description = "Aprovado"
                },
                Approvals = new List<PaymentApprovalDto>
                {
                    new PaymentApprovalDto { Id = approvalId, IsApproved = true, RequesterId = "admin_01" }
                },
                Receipts = new List<PaymentReceiptDto>
                {
                    new PaymentReceiptDto { Id = receiptId, DocumentName = "comprovante.pdf" }
                }
            };

            // Act & Assert
            Assert.Equal(id, manualPaymentDto.Id);
            Assert.Equal(orderId, manualPaymentDto.OrderId);
            Assert.Equal(1500.50, manualPaymentDto.Amount);
            Assert.Equal("Pagamento de fornecedor", manualPaymentDto.Reason);
            Assert.Equal(now, manualPaymentDto.ApprovedAt);
            Assert.Equal(now, manualPaymentDto.CreatedAt);
            Assert.Equal(now, manualPaymentDto.UpdatedAt);
            Assert.Equal("user_01", manualPaymentDto.RequesterId);
            Assert.Equal(1, manualPaymentDto.StatusId);

            // Assert Relational Entities (Requester & Status)
            Assert.NotNull(manualPaymentDto.Requester);
            Assert.Equal("João Silva", manualPaymentDto.Requester.Name);
            Assert.NotNull(manualPaymentDto.Status);
            Assert.Equal("Aprovado", manualPaymentDto.Status.Description);

            // Assert Lists (Approvals & Receipts)
            Assert.Single(manualPaymentDto.Approvals);
            Assert.Equal(approvalId, manualPaymentDto.Approvals[0].Id);
            Assert.True(manualPaymentDto.Approvals[0].IsApproved);

            Assert.Single(manualPaymentDto.Receipts);
            Assert.Equal(receiptId, manualPaymentDto.Receipts[0].Id);
            Assert.Equal("comprovante.pdf", manualPaymentDto.Receipts[0].DocumentName);
        }

        [Fact]
        public void GivenDefinitionOfPaymentApprovalDtoProperties_WhenDefinePropertiesForPaymentApprovalDto_ThenEnsurePropertiesAreDefinedCorrectly()
        {
            // Arrange
            var approvalId = Guid.NewGuid();
            var manualPaymentId = Guid.NewGuid();
            var requesterDto = new RequesterDto { Id = "req_01", Name = "Admin" };

            var approvalDto = new PaymentApprovalDto
            {
                Id = approvalId,
                ManualPaymentId = manualPaymentId,
                IsApproved = false,
                RequesterId = "req_01",
                RejectionReason = "Documentação incompleta",
                Requester = requesterDto,
                ManualPayment = new ManualPaymentDto { Id = manualPaymentId }
            };

            // Act & Assert
            Assert.Equal(approvalId, approvalDto.Id);
            Assert.Equal(manualPaymentId, approvalDto.ManualPaymentId);
            Assert.False(approvalDto.IsApproved);
            Assert.Equal("Documentação incompleta", approvalDto.RejectionReason);
            Assert.Equal(requesterDto.Id, approvalDto.Requester?.Id);
            Assert.Equal(manualPaymentId, approvalDto.ManualPayment.Id);
        }

        [Fact]
        public void GivenDefinitionOfPaymentStatusDtoProperties_WhenDefinePropertiesForPaymentStatusDto_ThenEnsureStatusPropertiesAreDefinedCorrectly()
        {
            // Arrange
            var now = DateTime.UtcNow;
            var statusDto = new PaymentStatusDto
            {
                Id = 2,
                Description = "Pendente",
                CreatedAt = now,
                UpdatedAt = now
            };

            // Act & Assert
            Assert.Equal(2, statusDto.Id);
            Assert.Equal("Pendente", statusDto.Description);
            Assert.Equal(now, statusDto.CreatedAt);
            Assert.Equal(now, statusDto.UpdatedAt);
        }

        [Fact]
        public void GivenDefinitionOfPaymentReceiptDtoProperties_WhenDefinePropertiesForPaymentReceiptDto_ThenEnsureReceiptPropertiesAreDefinedCorrectly()
        {
            // Arrange
            var receiptId = Guid.NewGuid();
            var manualPaymentId = Guid.NewGuid();
            var now = DateTime.UtcNow;

            var receiptDto = new PaymentReceiptDto
            {
                Id = receiptId,
                ManualPaymentId = manualPaymentId,
                DocumentName = "nota_fiscal.png",
                CreatedAt = now,
                ManualPayment = new ManualPaymentDto { Id = manualPaymentId }
            };

            // Act & Assert
            Assert.Equal(receiptId, receiptDto.Id);
            Assert.Equal(manualPaymentId, receiptDto.ManualPaymentId);
            Assert.Equal("nota_fiscal.png", receiptDto.DocumentName);
            Assert.Equal(now, receiptDto.CreatedAt);
            Assert.NotNull(receiptDto.ManualPayment);
        }
    }
}