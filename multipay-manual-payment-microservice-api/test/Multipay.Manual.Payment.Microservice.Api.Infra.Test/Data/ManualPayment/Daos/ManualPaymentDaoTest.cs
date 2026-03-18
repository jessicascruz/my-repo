using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Daos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.Multipay.Entities.Dtos;
using NSubstitute;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.Data.ManualPayment.Entities.Daos;

public class ManualPaymentDaoTest
{
    private readonly IMultipayContext _context;
    private readonly ILogger<ManualPaymentDao> _logger;
    private readonly ManualPaymentDao _manualPaymentDao;

    public ManualPaymentDaoTest()
    {
        var dbContextOptions = new DbContextOptionsBuilder<MultipayContext>()
            .UseInMemoryDatabase(databaseName: "ManualPaymentTestDB")
            .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        _context = new MultipayContext(new EnvironmentKey(), dbContextOptions, true);
        _logger = Substitute.For<ILogger<ManualPaymentDao>>();
        _manualPaymentDao = new ManualPaymentDao(_logger, _context);

        SeedDatabase();
    }

    private void SeedDatabase()
    {
        _context.PaymentStatus.Add(new PaymentStatusDto { Id = (int)ManualPaymentStatusEnum.PENDING_APPROVAL, Description = "Pending" });
        _context.PaymentStatus.Add(new PaymentStatusDto { Id = (int)ManualPaymentStatusEnum.APPROVED, Description = "Approved" });
        _context.SaveChangesAsync().Wait();
    }

    [Fact]
    public async Task GivenExistingOrderId_WhenSelectManualPaymentByOrderIdAsync_ThenReturnList()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var requester = new RequesterDto { Id = "user-1", Name = "Tester", Email = "test@test.com" };
        var payment = new ManualPaymentDto
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            Amount = 100.0,
            Reason = "Manual test payment",
            StatusId = (int)ManualPaymentStatusEnum.PENDING_APPROVAL,
            Requester = requester,
            CreatedAt = DateTime.UtcNow
        };

        _context.ManualPayments.Add(payment);
        await _context.SaveChangesAsync();

        // Act
        var result = await _manualPaymentDao.SelectManualPaymentByOrderIdAsync(orderId);

        // Assert
        Assert.NotNull(result.Item1);
        Assert.False(result.Item2.Error);
        Assert.Single(result.Item1);
        Assert.Equal(orderId, result.Item1[0].OrderId);
        Assert.Equal(payment.Amount, result.Item1[0].Amount);
        Assert.Equal(payment.Reason, result.Item1[0].Reason);
        Assert.NotNull(result.Item1[0].Requester);
        Assert.NotNull(result.Item1[0].Status);
    }

    [Fact]
    public async Task GivenNonExistingOrderId_WhenSelectManualPaymentByOrderIdAsync_ThenReturnEmptyList()
    {
        // Arrange
        var orderId = Guid.NewGuid();

        // Act
        var result = await _manualPaymentDao.SelectManualPaymentByOrderIdAsync(orderId);

        // Assert
        Assert.NotNull(result.Item1);
        Assert.Empty(result.Item1);
        Assert.False(result.Item2.Error);
    }

    [Fact]
    public async Task GivenValidData_WhenInsertManualPaymentAsync_ThenPersistAndReturnDto()
    {
        // Arrange
        var paymentId = Guid.NewGuid();
        var dto = new ManualPaymentDto
        {
            OrderId = Guid.NewGuid(),
            Amount = 500.50,
            Reason = "Test Reason",
            Requester = new RequesterDto { Id = "req-99", Name = "John", Email = "john@email.com" }
        };

        // Act
        var result = await _manualPaymentDao.InsertManualPaymentAsync(paymentId, dto);

        // Assert
        Assert.NotNull(result.Item1);
        Assert.False(result.Item2.Error);
        Assert.Equal(paymentId, result.Item1.Id);
        Assert.Equal((int)ManualPaymentStatusEnum.PENDING_APPROVAL, result.Item1.StatusId);

        var dbEntry = await _context.ManualPayments.FindAsync(paymentId);
        Assert.NotNull(dbEntry);
        Assert.Equal(dto.Amount, dbEntry.Amount);
    }

    [Fact]
    public async Task GivenExistingRequester_WhenInsertManualPaymentAsync_ThenUseExistingRequester()
    {
        // Arrange
        var requesterId = "existing-user-1";
        var existingRequester = new RequesterDto { Id = requesterId, Name = "Existing", Email = "old@mail.com" };
        _context.Requesters.Add(existingRequester);
        await _context.SaveChangesAsync();

        var paymentId = Guid.NewGuid();
        var dto = new ManualPaymentDto
        {
            OrderId = Guid.NewGuid(),
            Amount = 150.0,
            Requester = new RequesterDto { Id = requesterId, Name = "Updated Name?", Email = "new@mail.com" }
        };

        // Act
        var result = await _manualPaymentDao.InsertManualPaymentAsync(paymentId, dto);

        // Assert
        Assert.NotNull(result.Item1);
        Assert.Equal(requesterId, result.Item1.Requester?.Id);
        
        Assert.Equal("Existing", result.Item1.Requester?.Name);
    }

    [Fact]
    public async Task GivenNullRequester_WhenInsertManualPaymentAsync_ThenReturnInternalError()
    {
        // Arrange
        var paymentId = Guid.NewGuid();
        var dto = new ManualPaymentDto { Requester = null! };

        // Act
        var result = await _manualPaymentDao.InsertManualPaymentAsync(paymentId, dto);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Contains("Requester is required", result.Item2.Message);
    }

    [Fact]
    public async Task GivenExistingPayment_WhenInsertPaymentApproval_ThenUpdateStatusToApproved()
    {
        // Arrange
        var paymentId = Guid.NewGuid();
        var requester = new RequesterDto { Id = "boss-1", Name = "Manager", Email = "manager@test.com" };
        var payment = new ManualPaymentDto
        {
            Id = paymentId,
            StatusId = (int)ManualPaymentStatusEnum.PENDING_APPROVAL,
            Amount = 10.0,
            OrderId = Guid.NewGuid()
        };
        _context.ManualPayments.Add(payment);
        await _context.SaveChangesAsync();

        var approvalDto = new PaymentApprovalDto
        {
            ManualPaymentId = paymentId,
            IsApproved = true,
            Requester = requester
        };

        // Act
        var result = await _manualPaymentDao.InsertPaymentApprovalAsync(Guid.NewGuid(), approvalDto);

        // Assert
        Assert.NotNull(result.Item1);
        Assert.False(result.Item2.Error);
        var updatedPayment = await _context.ManualPayments.FindAsync(paymentId);
        Assert.Equal((int)ManualPaymentStatusEnum.APPROVED, updatedPayment?.StatusId);
        Assert.NotNull(updatedPayment?.ApprovedAt);
    }

    [Fact]
    public async Task GivenRejectedApproval_WhenInsertPaymentApproval_ThenUpdateStatusToRejected()
    {
        // Arrange
        var paymentId = Guid.NewGuid();
        var payment = new ManualPaymentDto
        {
            Id = paymentId,
            StatusId = (int)ManualPaymentStatusEnum.PENDING_APPROVAL,
            Amount = 50.0,
            OrderId = Guid.NewGuid()
        };
        _context.ManualPayments.Add(payment);
        await _context.SaveChangesAsync();

        var approvalDto = new PaymentApprovalDto
        {
            ManualPaymentId = paymentId,
            IsApproved = false,
            RejectionReason = "Incomplete Proof",
            Requester = new RequesterDto { Id = "admin", Name = "Admin", Email = "a@a.com" }
        };

        // Act
        var result = await _manualPaymentDao.InsertPaymentApprovalAsync(Guid.NewGuid(), approvalDto);

        // Assert
        Assert.NotNull(result.Item1);
        var updatedPayment = await _context.ManualPayments.FindAsync(paymentId);
        Assert.Equal((int)ManualPaymentStatusEnum.REJECTED, updatedPayment?.StatusId);
        Assert.Equal("Incomplete Proof", result.Item1.RejectionReason);
    }

    [Fact]
    public async Task GivenNonExistentPayment_WhenInsertPaymentApproval_ThenReturnNotFoundError()
    {
        // Arrange
        var approvalDto = new PaymentApprovalDto
        {
            ManualPaymentId = Guid.NewGuid(),
            IsApproved = true,
            Requester = new RequesterDto { Id = "somebody", Name = "Someone", Email = "s@s.com" }
        };

        // Act
        var result = await _manualPaymentDao.InsertPaymentApprovalAsync(Guid.NewGuid(), approvalDto);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Equal(ErrorCode.NotFound, result.Item2.StatusCode);
    }

    [Fact]
    public async Task GivenExistingPayment_WhenSelectByIdAsync_ThenReturnResponse()
    {
        // Arrange
        var paymentId = Guid.NewGuid();
        var payment = new ManualPaymentDto
        {
            Id = paymentId,
            OrderId = Guid.NewGuid(),
            Amount = 100.0,
            Reason = "Finding me",
            StatusId = (int)ManualPaymentStatusEnum.PENDING_APPROVAL,
            Requester = new RequesterDto { Id = "u1", Name = "User 1", Email = "u1@mail.com" }
        };
        _context.ManualPayments.Add(payment);
        await _context.SaveChangesAsync();

        // Act
        var result = await _manualPaymentDao.SelectByIdAsync(paymentId);

        // Assert
        Assert.NotNull(result.Item1);
        Assert.Equal(paymentId, result.Item1.Id);
        Assert.Equal("Pending", result.Item1.Status.Description);
    }

    [Fact]
    public async Task GivenNonExistentPayment_WhenSelectByIdAsync_ThenReturnNotFoundError()
    {
        // Arrange
        var randomId = Guid.NewGuid();

        // Act
        var result = await _manualPaymentDao.SelectByIdAsync(randomId);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Equal(ErrorCode.NotFound, result.Item2.StatusCode);
    }

    [Fact]
    public async Task GivenValidRequest_WhenInsertReceiptAsync_ThenPersist()
    {
        // Arrange
        var paymentId = Guid.NewGuid();
        
        _context.ManualPayments.Add(new ManualPaymentDto { Id = paymentId, OrderId = Guid.NewGuid(), StatusId = 1, Amount = 1 });
        await _context.SaveChangesAsync();

        var request = new PaymentReceiptRequest
        {
            Id = Guid.NewGuid(),
            ManualPaymentId = paymentId,
            DocumentName = "receipt.pdf"
        };

        // Act
        var result = await _manualPaymentDao.InsertReceiptAsync(request);

        // Assert
        Assert.NotNull(result.Item1);
        Assert.False(result.Item2.Error);
        Assert.Equal("receipt.pdf", result.Item1.DocumentName);

        var dbEntry = await _context.PaymentReceipts.FindAsync(request.Id);
        Assert.NotNull(dbEntry);
    }

    [Fact]
    public async Task GivenException_WhenInsertReceiptAsyncFails_ThenReturnError()
    {
        // Arrange 
        var request = new PaymentReceiptRequest { Id = Guid.NewGuid(), DocumentName = null! };

        // Act
        var result = await _manualPaymentDao.InsertReceiptAsync(request);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
    }

    [Fact]
    public async Task GivenPaymentWithApprovalsAndReceipts_WhenSelectManualPaymentByOrderIdAsync_ThenIncludeAllData()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var paymentId = Guid.NewGuid();

        var payment = new ManualPaymentDto
        {
            Id = paymentId,
            OrderId = orderId,
            Amount = 250.0,
            StatusId = (int)ManualPaymentStatusEnum.PENDING_APPROVAL,
            Requester = new RequesterDto { Id = "u2", Name = "User 2", Email = "u2@mail.com" }
        };

        _context.ManualPayments.Add(payment);

        _context.PaymentReceipts.Add(new PaymentReceiptDto { Id = Guid.NewGuid(), ManualPaymentId = paymentId, DocumentName = "file1.png" });
        _context.PaymentApprovals.Add(new PaymentApprovalDto { Id = Guid.NewGuid(), ManualPaymentId = paymentId, IsApproved = true, RequesterId = "approver-1" });

        await _context.SaveChangesAsync();

        // Act
        var result = await _manualPaymentDao.SelectManualPaymentByOrderIdAsync(orderId);

        // Assert
        var item = result.Item1?.FirstOrDefault();
        Assert.NotNull(item);
        Assert.Single(item.Receipts);
        Assert.Single(item.Approvals);
        Assert.Equal("file1.png", item.Receipts.First().DocumentName);
        Assert.True(item.Approvals.First().IsApproved);
    }
}