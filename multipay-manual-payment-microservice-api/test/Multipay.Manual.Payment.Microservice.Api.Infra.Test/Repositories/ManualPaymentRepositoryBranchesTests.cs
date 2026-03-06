using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Daos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Repositories;
using Multipay.Manual.Payment.Microservice.Api.Test.Mocks;
using NSubstitute;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.Repositories;

public class ManualPaymentRepositoryBranchesTests
{
    [Fact]
    public async Task Given_DaoReturnsNullOrError_When_SelectAndInsertMethodsAreCalled_Then_ShouldReturnExpectedErrorPaths()
    {
        // Arrange
        var dao = Substitute.For<IManualPaymentDao>();
        var repository = new ManualPaymentRepository(dao);
        var error = MockData.GetMockErrorResult(true);

        dao.SelectManualPaymentByOrderIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<List<Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos.ManualPaymentDto>?, ErrorResult>(null, error)));

        dao.InsertManualPaymentAsync(Arg.Any<Guid>(), Arg.Any<Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos.ManualPaymentDto>())
            .Returns(Task.FromResult(Tuple.Create<Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos.ManualPaymentDto?, ErrorResult>(null, error)));

        dao.InsertPaymentApprovalAsync(Arg.Any<Guid>(), Arg.Any<Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos.PaymentApprovalDto>())
            .Returns(Task.FromResult(Tuple.Create(MockData.GetMockPaymentApprovalDto(), error)));

        dao.InsertReceiptAsync(Arg.Any<PaymentReceiptRequest>())
            .Returns(Task.FromResult(Tuple.Create<Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos.PaymentReceiptDto?, ErrorResult>(null, null!)));

        dao.SelectByIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response.ManualPaymentResponse?, ErrorResult>(null, null!)));

        // Act
        var selectByOrder = await repository.SelectManualPaymentByOrderIdAsync(Guid.NewGuid());
        var insertManual = await repository.InsertManualPaymentAsync(Guid.NewGuid(), MockData.GetMockManualPaymentRequest());
        var insertApproval = await repository.InsertPaymentApprovalAsync(Guid.NewGuid(), MockData.GetMockPaymentApprovalRequest());
        var insertReceipt = await repository.InsertReceiptAsync(MockData.GetMockPaymentReceiptRequest());
        var selectById = await repository.SelectByIdAsync(Guid.NewGuid());

        // Assert
        Assert.Null(selectByOrder.Item1);
        Assert.True(selectByOrder.Item2.Error);
        Assert.Null(insertManual.Item1);
        Assert.True(insertManual.Item2.Error);
        Assert.Null(insertApproval.Item1);
        Assert.True(insertApproval.Item2.Error);
        Assert.Null(insertReceipt.Item1);
        Assert.True(insertReceipt.Item2.Error);
        Assert.Equal(ErrorCode.InternalServerError, insertReceipt.Item2.StatusCode);
        Assert.Null(selectById.Item1);
        Assert.True(selectById.Item2.Error);
        Assert.Equal(ErrorCode.NotFound, selectById.Item2.StatusCode);
    }
}
