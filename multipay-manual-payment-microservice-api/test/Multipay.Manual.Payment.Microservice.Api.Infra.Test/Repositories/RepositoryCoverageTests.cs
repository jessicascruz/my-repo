using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities.Filter;
using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Daos;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.AWS;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Multilog.Entities;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dao;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Repositories;
using Multipay.Manual.Payment.Microservice.Api.Test.Mocks;
using NSubstitute;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.Repositories;

public class RepositoryCoverageTests
{
    [Fact]
    public async Task Given_AwsDao_When_AwsRepositoryMethodsAreCalled_Then_ShouldDelegateCalls()
    {
        // Arrange
        var dao = Substitute.For<IAwsDao>();
        var expectedSecrets = new Dictionary<string, string> { ["k"] = "v" };
        var expectedUpload = Tuple.Create<S3UploadResult?, ErrorResult>(MockData.GetMockS3UploadResult(), new ErrorResult());
        dao.GetSecretsFromSecretManagerAsync(Arg.Any<string>(), Arg.Any<string>()).Returns(Task.FromResult(expectedSecrets));
        dao.UploadFileToS3Async(Arg.Any<byte[]>(), Arg.Any<string>()).Returns(Task.FromResult(expectedUpload));
        var repository = new AwsRepository(dao);

        // Act
        var secrets = await repository.SelectSecretAsync("secret", "sa-east-1");
        var upload = await repository.UploadFileToS3Async(MockData.GetMockFileBytes(), "file.pdf");

        // Assert
        Assert.Equal("v", secrets["k"]);
        Assert.NotNull(upload.Item1);
        Assert.Equivalent(new ErrorResult(), upload.Item2);
    }

    [Fact]
    public async Task Given_ReceivableDaoSuccess_When_GetReceivableOrderByFilterAsyncIsCalled_Then_ShouldReturnMappedDomainObject()
    {
        // Arrange
        var dao = Substitute.For<IReceivableDao>();
        var repository = new ReceivableRepository(dao);
        var filter = new ReceivableFilter
        {
            OrderId = Guid.NewGuid(),
            RetrievePayments = RetrievePaymentsEnum.All,
            RetrieveRefunds = RetrieveRefundsEnum.All,
        };
        var dto = new ReceivableDto
        {
            Id = Guid.NewGuid(),
            Status = "APPROVED",
            Amount = 150,
            Payments = new List<PaymentDto>(),
            Refunds = new List<ReceivableRefundDto>()
        };
        dao.GetReceivableOrderByFilterAsync(Arg.Any<Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Filter.FilterDto>())
            .Returns(Task.FromResult(Tuple.Create<ReceivableDto?, ErrorResult>(dto, new ErrorResult())));

        // Act
        var result = await repository.GetReceivableOrderByFilterAsync(filter);

        // Assert
        Assert.NotNull(result.Item1);
        Assert.Equal(dto.Id, result.Item1!.Id);
        Assert.Equivalent(new ErrorResult(), result.Item2);
    }

    [Fact]
    public async Task Given_ReceivableDaoError_When_GetReceivableOrderByFilterAsyncIsCalled_Then_ShouldReturnError()
    {
        // Arrange
        var dao = Substitute.For<IReceivableDao>();
        var repository = new ReceivableRepository(dao);
        var filter = MockData.GetMockReceivableFilter();
        var error = MockData.GetMockErrorResult(true);
        dao.GetReceivableOrderByFilterAsync(Arg.Any<Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Filter.FilterDto>())
            .Returns(Task.FromResult(Tuple.Create<ReceivableDto?, ErrorResult>(null, error)));

        // Act
        var result = await repository.GetReceivableOrderByFilterAsync(filter);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
    }

    [Fact]
    public async Task Given_StatusRequest_When_UpdateStatusAsyncIsCalled_Then_ShouldReturnDaoResult()
    {
        // Arrange
        var dao = Substitute.For<IReceivableDao>();
        var repository = new ReceivableRepository(dao);
        var error = new ErrorResult();
        var status = MockData.GetMockStatusRequest();
        dao.UpdateStatusAsync(Arg.Any<Guid>(), Arg.Any<StatusRequest>()).Returns(Task.FromResult(error));

        // Act
        var result = await repository.UpdateStatusAsync(Guid.NewGuid(), status);

        // Assert
        Assert.Equal(error, result);
    }

    [Fact]
    public async Task Given_MultilogDao_When_LoginAndInsertAreCalled_Then_ShouldConvertAndDelegate()
    {
        // Arrange
        var dao = Substitute.For<IMultilogDao>();
        var repository = new MultilogRepository(dao);
        var login = new Login { Username = "user", Password = "pass" };
        var tokenDto = new TokenDto
        {
            Token = "token",
            RefreshToken = "refresh",
            ExpiresIn = 3600,
            User = new UserDto { Id = "1", Name = "User", Username = "user" },
            Roles = new List<string> { "admin" }
        };
        dao.Login(Arg.Any<LoginDto>()).Returns(Task.FromResult(tokenDto));

        // Act
        var token = await repository.LoginAsync(login);
        await repository.InsertAsync(new MultilogPayload
        {
            System = "manual-payment",
            Type = SystemType.Create,
            Reference = "ref",
            ReferenceType = "order",
            CauserId = "1",
            CauserName = "User",
            Properties = new Properties { Request = "req", Response = "res" }
        }, "token");

        // Assert
        Assert.Equal("token", token.AccessToken);
        Assert.Equal("user", token.User.Username);
        await dao.Received(1).Insert(Arg.Any<MultilogDto>(), "token");
    }

    [Fact]
    public async Task Given_ManualPaymentDao_When_RepositoryMethodsAreCalled_Then_ShouldReturnExpectedResults()
    {
        // Arrange
        var dao = Substitute.For<IManualPaymentDao>();
        var repository = new ManualPaymentRepository(dao);

        var manualPaymentId = Guid.NewGuid();
        var orderId = Guid.NewGuid();
        var manualPaymentRequest = MockData.GetMockManualPaymentRequest();
        manualPaymentRequest.OrderId = orderId;

        var manualPaymentDto = MockData.GetMockManualPaymentDto(manualPaymentId, orderId);
        dao.InsertManualPaymentAsync(Arg.Any<Guid>(), Arg.Any<Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos.ManualPaymentDto>())
            .Returns(Task.FromResult(Tuple.Create<Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos.ManualPaymentDto?, ErrorResult>(manualPaymentDto, new ErrorResult())));

        dao.SelectManualPaymentByOrderIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<List<Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos.ManualPaymentDto>?, ErrorResult>(new List<Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos.ManualPaymentDto> { manualPaymentDto }, new ErrorResult())));

        dao.InsertReceiptAsync(Arg.Any<PaymentReceiptRequest>())
            .Returns(Task.FromResult(Tuple.Create<Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos.PaymentReceiptDto?, ErrorResult>(MockData.GetMockPaymentReceiptDto(), new ErrorResult())));

        dao.InsertPaymentApprovalAsync(Arg.Any<Guid>(), Arg.Any<Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos.PaymentApprovalDto>())
            .Returns(Task.FromResult(Tuple.Create(MockData.GetMockPaymentApprovalDto(), new ErrorResult())));

        dao.SelectByIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response.ManualPaymentResponse?, ErrorResult>(MockData.GetMockManualPaymentResponse(), new ErrorResult())));

        // Act
        var insertManual = await repository.InsertManualPaymentAsync(manualPaymentId, manualPaymentRequest);
        var selectByOrder = await repository.SelectManualPaymentByOrderIdAsync(orderId);
        var insertReceipt = await repository.InsertReceiptAsync(MockData.GetMockPaymentReceiptRequest());
        var insertApproval = await repository.InsertPaymentApprovalAsync(Guid.NewGuid(), MockData.GetMockPaymentApprovalRequest());
        var selectById = await repository.SelectByIdAsync(manualPaymentId);

        // Assert
        Assert.NotNull(insertManual.Item1);
        Assert.NotNull(selectByOrder.Item1);
        Assert.Single(selectByOrder.Item1!);
        Assert.NotNull(insertReceipt.Item1);
        Assert.NotNull(insertApproval.Item1);
        Assert.NotNull(selectById.Item1);
    }
}

