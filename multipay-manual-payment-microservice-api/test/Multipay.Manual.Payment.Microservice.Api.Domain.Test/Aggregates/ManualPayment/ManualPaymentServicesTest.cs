using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Multipay.Manual.Payment.Microservice.Api.Test.Mocks;
using NSubstitute;
using Xunit;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Test.Aggregates.ManualPayment;

public class ManualPaymentServicesTest
{
    private readonly IManualPaymentRepository _mockManualPaymentRepository;
    private readonly IReceivableService _mockReceivableService;
    private readonly ILogger<ManualPaymentServices> _mockLogger;
    private readonly IAwsRepository _mockAwsRepository;
    private readonly EnvironmentKey _environment;
    private readonly ManualPaymentServices _service;

    public ManualPaymentServicesTest()
    {
        _mockManualPaymentRepository = Substitute.For<IManualPaymentRepository>();
        _mockReceivableService = Substitute.For<IReceivableService>();
        _mockLogger = Substitute.For<ILogger<ManualPaymentServices>>();
        _mockAwsRepository = Substitute.For<IAwsRepository>();
        _environment = MockData.GetMockEnvironmentKey();
        _environment.PersistenceInformation.ValidStatusOrder = "PENDING,APPROVED";

        _service = new ManualPaymentServices(
            _mockLogger,
            _mockManualPaymentRepository,
            _mockReceivableService,
            _environment,
            _mockAwsRepository);
    }

    [Fact]
    public async Task Given_ValidOrderId_When_SelectManualPaymentByOrderIdAsyncIsCalled_Then_ShouldReturnList()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var response = new List<ManualPaymentResponse> { MockData.GetMockManualPaymentResponse() };
        _mockManualPaymentRepository.SelectManualPaymentByOrderIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<List<ManualPaymentResponse>?, ErrorResult>(response, new ErrorResult())));

        // Act
        var result = await _service.SelectManualPaymentByOrderIdAsync(orderId);

        // Assert
        Assert.NotNull(result.Item1);
        Assert.NotEmpty(result.Item1);
        Assert.Equivalent(new ErrorResult(), result.Item2);
    }

    [Fact]
    public async Task Given_ValidRequest_When_CreatePaymentManualAsyncIsCalled_Then_ShouldReturnResponse()
    {
        // Arrange
        var request = MockData.GetMockManualPaymentRequest();
        var files = MockData.GetMockIFormFileCollection();
        var receivableResponse = MockData.GetMockReceivableResponse();
        receivableResponse.Status = "PENDING";

        var manualPaymentResponse = MockData.GetMockManualPaymentResponse();
        var s3Result = MockData.GetMockS3UploadResult();

        _mockReceivableService.GetReceivableOrderByIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<ReceivableResponse?, ErrorResult>(receivableResponse, new ErrorResult())));

        _mockAwsRepository.UploadFileToS3Async(Arg.Any<byte[]>(), Arg.Any<string>())
            .Returns(Task.FromResult(Tuple.Create<S3UploadResult?, ErrorResult>(s3Result, new ErrorResult())));

        _mockManualPaymentRepository.InsertManualPaymentAsync(Arg.Any<Guid>(), Arg.Any<ManualPaymentRequest>())
            .Returns(Task.FromResult(Tuple.Create<ManualPaymentResponse, ErrorResult>(manualPaymentResponse, new ErrorResult())));

        _mockManualPaymentRepository.InsertReceiptAsync(Arg.Any<PaymentReceiptRequest>())
            .Returns(Task.FromResult(Tuple.Create<PaymentReceiptResponse?, ErrorResult>(MockData.GetMockPaymentReceiptResponse(), new ErrorResult())));

        _mockManualPaymentRepository.SelectByIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<ManualPaymentResponse?, ErrorResult>(manualPaymentResponse, new ErrorResult())));

        // Act
        var result = await _service.CreatePaymentManualAsync(request, files);

        // Assert
        Assert.NotNull(result.Item1);
        Assert.Equal(manualPaymentResponse.Id, result.Item1!.Id);
        Assert.Null(result.Item2);
    }

    [Fact]
    public async Task Given_ValidApproval_When_CreatePaymentApprovalByIdAsyncIsCalled_Then_ShouldReturnResponse()
    {
        // Arrange
        var request = MockData.GetMockPaymentApprovalRequest();
        var manualPayment = MockData.GetMockManualPaymentResponse();
        manualPayment.Approvals = new List<PaymentApprovalResponse>();
        manualPayment.Requester.Id = "other-user";

        _mockManualPaymentRepository.SelectByIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<ManualPaymentResponse?, ErrorResult>(manualPayment, new ErrorResult())));

        _mockManualPaymentRepository.InsertPaymentApprovalAsync(Arg.Any<Guid>(), Arg.Any<PaymentApprovalRequest>())
            .Returns(Task.FromResult(Tuple.Create<PaymentApprovalResponse?, ErrorResult>(MockData.GetMockPaymentApprovalResponse(), new ErrorResult())));

        // Act
        var result = await _service.CreatePaymentApprovalByIdAsync(request);

        // Assert
        Assert.NotNull(result.Item1);
        Assert.Equivalent(new ErrorResult(), result.Item2);
    }

    [Fact]
    public async Task Given_InvalidFilesCount_When_CreatePaymentManualAsyncIsCalled_Then_ShouldReturnBadRequest()
    {
        // Arrange
        var request = MockData.GetMockManualPaymentRequest();
        var files = Substitute.For<IFormFileCollection>();
        files.Count.Returns(0);

        // Act
        var result = await _service.CreatePaymentManualAsync(request, files);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Equal(ErrorCode.BadRequest, result.Item2.StatusCode);
        Assert.Contains("At least one file must be sent", result.Item2.Message);
    }

    [Fact]
    public async Task Given_RequesterIdNull_When_CreatePaymentManualAsyncIsCalled_Then_ShouldReturnBadRequest()
    {
        // Arrange
        var request = MockData.GetMockManualPaymentRequest();
        request.Requester.Id = null;
        var files = MockData.GetMockIFormFileCollection();

        // Act
        var result = await _service.CreatePaymentManualAsync(request, files);

        // Assert
        Assert.Null(result.Item1);
        Assert.Equal(ErrorCode.BadRequest, result.Item2.StatusCode);
    }

    [Fact]
    public async Task Given_InvalidOrderStatus_When_CreatePaymentManualAsyncIsCalled_Then_ShouldReturnBadRequest()
    {
        // Arrange
        var request = MockData.GetMockManualPaymentRequest();
        var files = MockData.GetMockIFormFileCollection();
        var receivableResponse = MockData.GetMockReceivableResponse();
        receivableResponse.Status = "INVALID_STATUS";

        _mockReceivableService.GetReceivableOrderByIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<ReceivableResponse?, ErrorResult>(receivableResponse, new ErrorResult())));

        // Act
        var result = await _service.CreatePaymentManualAsync(request, files);

        // Assert
        Assert.Null(result.Item1);
        Assert.Equal(ErrorCode.BadRequest, result.Item2.StatusCode);
        Assert.Contains("Manual payment cannot be created for an order with status", result.Item2.Message);
    }

    [Fact]
    public async Task Given_ApproverIsRequester_When_CreatePaymentApprovalByIdAsyncIsCalled_Then_ShouldReturnBadRequest()
    {
        // Arrange
        var manualPayment = MockData.GetMockManualPaymentResponse();
        var request = MockData.GetMockPaymentApprovalRequest();
        request.RequesterId = manualPayment.Requester.Id;

        _mockManualPaymentRepository.SelectByIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<ManualPaymentResponse?, ErrorResult>(manualPayment, new ErrorResult())));

        // Act
        var result = await _service.CreatePaymentApprovalByIdAsync(request);

        // Assert
        Assert.Null(result.Item1);
        Assert.Equal(ErrorCode.BadRequest, result.Item2.StatusCode);
        Assert.Equal("Approver must be different from the requester.", result.Item2.Message);
    }

    [Fact]
    public async Task Given_ApproverAlreadyApproved_When_CreatePaymentApprovalByIdAsyncIsCalled_Then_ShouldReturnBadRequest()
    {
        // Arrange
        var manualPayment = MockData.GetMockManualPaymentResponse();
        var request = MockData.GetMockPaymentApprovalRequest();
        request.RequesterId = "other-user";

        manualPayment.Approvals.Add(new PaymentApprovalResponse
        {
            RequesterId = manualPayment.Requester.Id,
            IsApproved = true
        });

        _mockManualPaymentRepository.SelectByIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<ManualPaymentResponse?, ErrorResult>(manualPayment, new ErrorResult())));

        // Act
        var result = await _service.CreatePaymentApprovalByIdAsync(request);

        // Assert
        Assert.Null(result.Item1);
        Assert.Equal(ErrorCode.BadRequest, result.Item2.StatusCode);
        Assert.Contains("has already approved this payment", result.Item2.Message);
    }

    [Fact]
    public async Task Given_PaymentReachedMaxApprovals_When_CreatePaymentApprovalByIdAsyncIsCalled_Then_ShouldReturnUnprocessableEntity()
    {
        // Arrange
        var manualPayment = MockData.GetMockManualPaymentResponse();
        var request = MockData.GetMockPaymentApprovalRequest();
        request.RequesterId = "new-approver";
        manualPayment.Requester.Id = "requester";
        manualPayment.Approvals = new List<PaymentApprovalResponse> { new() { RequesterId = "prev-approver" } };

        _mockManualPaymentRepository.SelectByIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<ManualPaymentResponse?, ErrorResult>(manualPayment, new ErrorResult())));

        // Act
        var result = await _service.CreatePaymentApprovalByIdAsync(request);

        // Assert
        Assert.Null(result.Item1);
        Assert.Equal(ErrorCode.UnprocessableEntity, result.Item2.StatusCode);
    }

    [Fact]
    public async Task Given_LastApprovalAndFullAmount_When_CreatePaymentApprovalByIdAsyncIsCalled_Then_ShouldUpdateOrderStatus()
    {
        // Arrange
        var request = MockData.GetMockPaymentApprovalRequest();
        var manualPaymentWithoutApprovals = MockData.GetMockManualPaymentResponse();
        manualPaymentWithoutApprovals.Requester.Id = "initial-requester";
        request.RequesterId = "final-approver";
        manualPaymentWithoutApprovals.Approvals = new List<PaymentApprovalResponse>();
        manualPaymentWithoutApprovals.Amount = 1000.0;

        var manualPaymentWithApproval = MockData.GetMockManualPaymentResponse();
        manualPaymentWithApproval.Approvals = new List<PaymentApprovalResponse> { new() { RequesterId = "final-approver" } };
        manualPaymentWithApproval.Status.Id = (int)ManualPaymentStatusEnum.APPROVED;
        manualPaymentWithApproval.Amount = 1000.0;
        manualPaymentWithApproval.Requester.Id = "initial-requester";

        var order = MockData.GetMockReceivableResponse();
        order.Amount = 1000.0;

        _mockManualPaymentRepository.SelectByIdAsync(request.ManualPaymentId)
            .Returns(
                Task.FromResult(Tuple.Create<ManualPaymentResponse?, ErrorResult>(manualPaymentWithoutApprovals, new ErrorResult())),
                Task.FromResult(Tuple.Create<ManualPaymentResponse?, ErrorResult>(manualPaymentWithApproval, new ErrorResult()))
            );

        _mockManualPaymentRepository.InsertPaymentApprovalAsync(Arg.Any<Guid>(), Arg.Any<PaymentApprovalRequest>())
            .Returns(Task.FromResult(Tuple.Create<PaymentApprovalResponse?, ErrorResult>(new PaymentApprovalResponse(), new ErrorResult())));

        _mockManualPaymentRepository.SelectManualPaymentByOrderIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<List<ManualPaymentResponse>?, ErrorResult>(new List<ManualPaymentResponse> { manualPaymentWithApproval }, new ErrorResult())));

        _mockReceivableService.GetReceivableOrderByIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<ReceivableResponse?, ErrorResult>(order, new ErrorResult())));

        _mockReceivableService.UpdateStatusAsync(Arg.Any<Guid>(), Arg.Any<StatusRequest>())
            .Returns(Task.FromResult(new ErrorResult()));

        // Act
        var result = await _service.CreatePaymentApprovalByIdAsync(request);

        // Assert
        Assert.NotNull(result.Item1);
        await _mockReceivableService.Received(1).UpdateStatusAsync(Arg.Any<Guid>(), Arg.Any<StatusRequest>());
    }


    [Fact]
    public async Task Given_S3UploadFails_When_CreatePaymentManualAsyncIsCalled_Then_ShouldReturnError()
    {
        // Arrange
        var request = MockData.GetMockManualPaymentRequest();
        var files = MockData.GetMockIFormFileCollection();
        var receivableResponse = MockData.GetMockReceivableResponse();
        receivableResponse.Status = "PENDING";

        _mockReceivableService.GetReceivableOrderByIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<ReceivableResponse?, ErrorResult>(receivableResponse, new ErrorResult())));

        _mockAwsRepository.UploadFileToS3Async(Arg.Any<byte[]>(), Arg.Any<string>())
            .Returns(Task.FromResult(Tuple.Create<S3UploadResult?, ErrorResult>(null, new ErrorResult { Error = true, Message = "S3 Error" })));

        // Act
        var result = await _service.CreatePaymentManualAsync(request, files);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Equal("S3 Error", result.Item2.Message);
    }

    [Fact]
    public async Task Given_OrderRetrievalFails_When_CreatePaymentManualAsyncIsCalled_Then_ShouldReturnInternalError()
    {
        // Arrange
        var request = MockData.GetMockManualPaymentRequest();
        var files = MockData.GetMockIFormFileCollection();

        _mockReceivableService.GetReceivableOrderByIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<ReceivableResponse?, ErrorResult>(null, new ErrorResult { Error = true, Message = "Order Service Down" })));

        // Act
        var result = await _service.CreatePaymentManualAsync(request, files);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Contains("Error retrieving the specified order", result.Item2.Message);
    }

    [Fact]
    public async Task Given_SumOfPaymentsLessThanOrder_When_CreatePaymentApprovalByIdAsyncIsCalled_Then_ShouldReturnBadRequest()
    {
        // Arrange
        var request = MockData.GetMockPaymentApprovalRequest();
        var manualPaymentWithout = MockData.GetMockManualPaymentResponse();
        manualPaymentWithout.Approvals = new List<PaymentApprovalResponse>();
        manualPaymentWithout.Amount = 500.0;
        manualPaymentWithout.Requester.Id = "initial";

        var manualPaymentWith = MockData.GetMockManualPaymentResponse();
        manualPaymentWith.Approvals = new List<PaymentApprovalResponse> { new() { RequesterId = "approver" } };
        manualPaymentWith.Amount = 500.0;
        manualPaymentWith.Requester.Id = "initial";

        var order = MockData.GetMockReceivableResponse();
        order.Amount = 1000.0;

        _mockManualPaymentRepository.SelectByIdAsync(Arg.Any<Guid>())
            .Returns(
                Task.FromResult(Tuple.Create<ManualPaymentResponse?, ErrorResult>(manualPaymentWithout, new ErrorResult())),
                Task.FromResult(Tuple.Create<ManualPaymentResponse?, ErrorResult>(manualPaymentWith, new ErrorResult()))
            );

        _mockManualPaymentRepository.InsertPaymentApprovalAsync(Arg.Any<Guid>(), Arg.Any<PaymentApprovalRequest>())
            .Returns(Task.FromResult(Tuple.Create<PaymentApprovalResponse?, ErrorResult>(new PaymentApprovalResponse(), new ErrorResult())));

        _mockManualPaymentRepository.SelectManualPaymentByOrderIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<List<ManualPaymentResponse>?, ErrorResult>(new List<ManualPaymentResponse> { manualPaymentWith }, new ErrorResult())));

        _mockReceivableService.GetReceivableOrderByIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<ReceivableResponse?, ErrorResult>(order, new ErrorResult())));

        // Act
        var result = await _service.CreatePaymentApprovalByIdAsync(request);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Contains("sum of manual payments is not equal to or greater than the order amount", result.Item2.Message);
    }

    [Fact]
    public async Task Given_PaymentIsRejected_When_CreatePaymentApprovalByIdAsyncIsCalled_Then_ShouldNotUpdateStatus()
    {
        // Arrange
        var request = MockData.GetMockPaymentApprovalRequest();
        var manualPaymentWithout = MockData.GetMockManualPaymentResponse();
        manualPaymentWithout.Approvals = new List<PaymentApprovalResponse>();
        manualPaymentWithout.Status.Id = (int)ManualPaymentStatusEnum.REJECTED;
        manualPaymentWithout.Requester.Id = "initial";

        var manualPaymentWith = MockData.GetMockManualPaymentResponse();
        manualPaymentWith.Approvals = new List<PaymentApprovalResponse> { new() { RequesterId = "approver" } };
        manualPaymentWith.Status.Id = (int)ManualPaymentStatusEnum.REJECTED;
        manualPaymentWith.Requester.Id = "initial";

        _mockManualPaymentRepository.SelectByIdAsync(Arg.Any<Guid>())
            .Returns(
                Task.FromResult(Tuple.Create<ManualPaymentResponse?, ErrorResult>(manualPaymentWithout, new ErrorResult())),
                Task.FromResult(Tuple.Create<ManualPaymentResponse?, ErrorResult>(manualPaymentWith, new ErrorResult()))
            );

        _mockManualPaymentRepository.InsertPaymentApprovalAsync(Arg.Any<Guid>(), Arg.Any<PaymentApprovalRequest>())
            .Returns(Task.FromResult(Tuple.Create<PaymentApprovalResponse?, ErrorResult>(new PaymentApprovalResponse(), new ErrorResult())));

        _mockManualPaymentRepository.SelectManualPaymentByOrderIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<List<ManualPaymentResponse>?, ErrorResult>(new List<ManualPaymentResponse> { manualPaymentWith }, new ErrorResult())));

        _mockReceivableService.GetReceivableOrderByIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<ReceivableResponse?, ErrorResult>(MockData.GetMockReceivableResponse(), new ErrorResult())));

        // Act
        var result = await _service.CreatePaymentApprovalByIdAsync(request);

        // Assert
        Assert.NotNull(result.Item1);
        await _mockReceivableService.DidNotReceiveWithAnyArgs().UpdateStatusAsync(Arg.Any<Guid>(), Arg.Any<StatusRequest>());
    }
    [Fact]
    public async Task Given_TooManyFiles_When_CreatePaymentManualAsyncIsCalled_Then_ShouldReturnBadRequest()
    {
        // Arrange
        var request = MockData.GetMockManualPaymentRequest();
        var files = MockData.GetMockIFormFileCollection();

        // Criar mock de FormFileCollection com mais de 10 arquivos
        var mockCollection = Substitute.For<IFormFileCollection>();
        mockCollection.Count.Returns(11);
        var fileList = Enumerable.Range(0, 11).Select(_ => MockData.GetMockIFormFile()).ToList();
        mockCollection.GetEnumerator().Returns(fileList.GetEnumerator());

        // Act
        var result = await _service.CreatePaymentManualAsync(request, mockCollection);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Contains("Maximum 10 files allowed", result.Item2.Message);
    }

    [Fact]
    public async Task Given_NullRequest_When_CreatePaymentManualAsyncIsCalled_Then_ShouldReturnBadRequest()
    {
        // Arrange
        var files = MockData.GetMockIFormFileCollection();

        // Act
        var result = await _service.CreatePaymentManualAsync(null!, files);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Contains("null", result.Item2.Message);
    }

    [Fact]
    public async Task Given_NullRequester_When_CreatePaymentManualAsyncIsCalled_Then_ShouldReturnBadRequest()
    {
        // Arrange
        var request = MockData.GetMockManualPaymentRequest();
        request.Requester = null!;
        var files = MockData.GetMockIFormFileCollection();

        // Act
        var result = await _service.CreatePaymentManualAsync(request, files);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Contains("requester", result.Item2.Message.ToLower());
    }

    [Fact]
    public async Task Given_ZeroAmount_When_CreatePaymentManualAsyncIsCalled_Then_ShouldReturnBadRequest()
    {
        // Arrange
        var request = MockData.GetMockManualPaymentRequest();
        request.Amount = 0;
        var files = MockData.GetMockIFormFileCollection();

        // Act
        var result = await _service.CreatePaymentManualAsync(request, files);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Contains("amount", result.Item2.Message.ToLower());
    }

    [Fact]
    public async Task Given_EmptyReason_When_CreatePaymentManualAsyncIsCalled_Then_ShouldReturnBadRequest()
    {
        // Arrange
        var request = MockData.GetMockManualPaymentRequest();
        request.Reason = "";
        var files = MockData.GetMockIFormFileCollection();

        // Act
        var result = await _service.CreatePaymentManualAsync(request, files);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Contains("reason", result.Item2.Message.ToLower());
    }

    [Fact]
    public async Task Given_CancelledOrderStatus_When_CreatePaymentManualAsyncIsCalled_Then_ShouldReturnBadRequest()
    {
        // Arrange
        var request = MockData.GetMockManualPaymentRequest();
        var files = MockData.GetMockIFormFileCollection();
        var receivableResponse = MockData.GetMockReceivableResponse();
        receivableResponse.Status = "CANCELLED"; // Not in ValidStatusOrder

        _mockReceivableService.GetReceivableOrderByIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<ReceivableResponse?, ErrorResult>(receivableResponse, new ErrorResult())));

        // Act
        var result = await _service.CreatePaymentManualAsync(request, files);

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
        Assert.Contains("status", result.Item2.Message.ToLower());
    }

    [Fact]
    public async Task Given_ValidData_When_SelectManualPaymentByOrderIdAsyncReturnsNull_Then_ShouldReturnError()
    {
        // Arrange
        _mockManualPaymentRepository.SelectManualPaymentByOrderIdAsync(Arg.Any<Guid>())
            .Returns(Task.FromResult(Tuple.Create<List<ManualPaymentResponse>?, ErrorResult>(null, new ErrorResult { Error = true, Message = "Not found" })));

        // Act
        var result = await _service.SelectManualPaymentByOrderIdAsync(Guid.NewGuid());

        // Assert
        Assert.Null(result.Item1);
        Assert.True(result.Item2.Error);
    }

}
