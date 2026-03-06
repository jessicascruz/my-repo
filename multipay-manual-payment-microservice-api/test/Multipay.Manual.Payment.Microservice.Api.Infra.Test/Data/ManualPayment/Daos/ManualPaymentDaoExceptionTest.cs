using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Daos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.Multipay.Entities.Dtos;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using Xunit;
using System.Linq.Expressions;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.Data.ManualPayment.Entities.Daos;

public class ManualPaymentDaoExceptionTest
{
    private readonly IMultipayContext _mockContext;
    private readonly ILogger<ManualPaymentDao> _mockLogger;
    private readonly ManualPaymentDao _dao;

    public ManualPaymentDaoExceptionTest()
    {
        _mockContext = Substitute.For<IMultipayContext>();
        _mockLogger = Substitute.For<ILogger<ManualPaymentDao>>();
        _dao = new ManualPaymentDao(_mockLogger, _mockContext);

        // Simple mock of DatabaseFacade to allow transaction calls
        var mockDb = Substitute.For<Microsoft.EntityFrameworkCore.Infrastructure.DatabaseFacade>(Substitute.For<DbContext>());
        _mockContext.Database.Returns(mockDb);
    }

    [Fact]
    public async Task GivenException_WhenSelectManualPaymentByOrderIdAsync_ThenReturnInternalError()
    {
        // Arrange
        _mockContext.ManualPayments.Throws(new Exception("DB Error"));

        // Act
        var result = await _dao.SelectManualPaymentByOrderIdAsync(Guid.NewGuid());

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Equal(ErrorCode.InternalServerError, result.Item2.StatusCode);
    }

    [Fact]
    public async Task GivenException_WhenInsertManualPaymentAsync_ThenReturnInternalError()
    {
        // Arrange
        var dto = new ManualPaymentDto { Requester = new RequesterDto { Id = "1" } };
        _mockContext.Requesters.Throws(new Exception("Insert Error"));

        // Act
        var result = await _dao.InsertManualPaymentAsync(Guid.NewGuid(), dto);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
    }

    [Fact]
    public async Task GivenException_WhenSelectByIdAsync_ThenReturnInternalError()
    {
        // Arrange
        _mockContext.ManualPayments.Throws(new Exception("Select Error"));

        // Act
        var result = await _dao.SelectByIdAsync(Guid.NewGuid());

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
    }

    [Fact]
    public async Task GivenException_WhenInsertPaymentApprovalAsync_ThenReturnInternalError()
    {
        // Arrange
        var dto = new PaymentApprovalDto { Requester = new RequesterDto { Id = "1" } };
        _mockContext.Requesters.Throws(new Exception("Approval Error"));

        // Act
        var result = await _dao.InsertPaymentApprovalAsync(Guid.NewGuid(), dto);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
    }

    [Fact]
    public async Task GivenNullRequester_WhenInsertPaymentApprovalAsync_ThenReturnInternalError()
    {
        // Arrange
        var dto = new PaymentApprovalDto { Requester = null! };

        // Act 
        var result = await _dao.InsertPaymentApprovalAsync(Guid.NewGuid(), dto);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Contains("Requester is required", result.Item2.Message);
    }

    [Fact]
    public async Task GivenException_WhenInsertReceiptAsync_ThenReturnInternalError()
    {
        // Arrange
        var receipt = new PaymentReceiptRequest { Id = Guid.NewGuid() };
        _mockContext.PaymentReceipts.Throws(new Exception("Receipt Error"));

        // Act
        var result = await _dao.InsertReceiptAsync(receipt);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Equal(ErrorCode.InternalServerError, result.Item2.StatusCode);
    }
}
