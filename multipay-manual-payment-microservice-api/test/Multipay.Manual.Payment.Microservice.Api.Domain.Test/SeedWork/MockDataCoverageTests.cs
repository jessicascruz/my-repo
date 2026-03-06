using Multipay.Manual.Payment.Microservice.Api.Test.Mocks;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Test.SeedWork;

public class MockDataCoverageTests
{
    [Fact]
    public void Given_AllMockFactories_When_Called_Then_ShouldReturnPopulatedObjects()
    {
        // Arrange
        // Act
        var requesterRequest = MockData.GetMockRequesterRequest();
        var order = MockData.GetMockOrder();
        var statusRequest = MockData.GetMockStatusRequest();
        var receivableResponse = MockData.GetMockReceivableResponse();
        var receivableRefund = MockData.GetMockReceivableRefund();
        var receivableRefundRequester = MockData.GetMockReceivableRefundRequester();
        var receivableRefundAcquirer = MockData.GetMockReceivableRefundAcquirer();
        var receivablePayment = MockData.GetMockReceivablePayment();
        var paymentPix = MockData.GetMockPaymentPix();
        var paymentTicket = MockData.GetMockPaymentTicket();
        var paymentAcquirer = MockData.GetMockPaymentAcquirer();
        var receivableCompany = MockData.GetMockReceivableCompany();
        var item = MockData.GetMockItem();
        var businessPartner = MockData.GetMockBusinessPartner();
        var address = MockData.GetMockAddress();
        var receivableFilter = MockData.GetMockReceivableFilter();
        var manualPaymentResponse = MockData.GetMockManualPaymentResponse();
        var paymentApprovalResponse = MockData.GetMockPaymentApprovalResponse();
        var paymentStatusResponse = MockData.GetMockPaymentStatusResponse();
        var requesterResponse = MockData.GetMockRequesterResponse();
        var paymentReceiptResponse = MockData.GetMockPaymentReceiptResponse();
        var manualPaymentRequest = MockData.GetMockManualPaymentRequest();
        var paymentApprovalRequest = MockData.GetMockPaymentApprovalRequest();
        var paymentReceiptRequest = MockData.GetMockPaymentReceiptRequest();
        var envGateway = MockData.GetMockEnvironmentKeyGateway();
        var envMicroservice = MockData.GetMockEnvironmentKeyMicroservice();
        var envPersistence = MockData.GetMockEnvironmentKeyPersistence();
        var envSecretManager = MockData.GetMockEnvironmentKeyAWSSecretManager();
        var envAmazonS3 = MockData.GetMockEnvironmentKeyAWSAmazonS3();
        var envAws = MockData.GetMockEnvironmentKeyAWS();
        var envSqlServer = MockData.GetMockEnvironmentKeySqlServer();
        var envMultilog = MockData.GetMockEnvironmentKeyMultilog();
        var env = MockData.GetMockEnvironmentKey();
        var formFileCollection = MockData.GetMockIFormFileCollection();
        var formFile = MockData.GetMockIFormFile("receipt.png");
        var fileBytes = MockData.GetMockFileBytes();
        var s3Upload = MockData.GetMockS3UploadResult();
        var manualPaymentDtoOne = MockData.GetMockManualPaymentDto(Guid.NewGuid());
        var manualPaymentDtoTwo = MockData.GetMockManualPaymentDto(Guid.NewGuid(), Guid.NewGuid());
        var receiptDto = MockData.GetMockPaymentReceiptDto();
        var approvalDto = MockData.GetMockPaymentApprovalDto();
        var errorResultSuccess = MockData.GetMockErrorResult(false);
        var errorResultFailure = MockData.GetMockErrorResult(true);

        // Assert
        Assert.Equal("João da Silva", requesterRequest.Name);
        Assert.NotEqual(Guid.Empty, order.Id);
        Assert.Equal("PAYMENT_UPDATE", statusRequest.Event);
        Assert.NotNull(receivableResponse.Payments);
        Assert.NotEqual(Guid.Empty, receivableRefund.Id);
        Assert.Contains("@", receivableRefundRequester.Email);
        Assert.Equal("Cielo", receivableRefundAcquirer.Description);
        Assert.NotNull(receivablePayment.Acquirer);
        Assert.False(string.IsNullOrWhiteSpace(paymentPix.Code));
        Assert.False(string.IsNullOrWhiteSpace(paymentTicket.Url));
        Assert.False(string.IsNullOrWhiteSpace(paymentAcquirer.Nsu));
        Assert.Equal("COMP-01", receivableCompany.Code);
        Assert.True(item.Quantity > 0);
        Assert.False(string.IsNullOrWhiteSpace(businessPartner.DocumentNumber));
        Assert.Equal("SP", address.State);
        Assert.NotNull(receivableFilter.OrderId);
        Assert.NotNull(manualPaymentResponse.Requester);
        Assert.NotNull(paymentApprovalResponse.Requester);
        Assert.Equal("Aprovado", paymentStatusResponse.Description);
        Assert.Contains("@", requesterResponse.Email);
        Assert.EndsWith(".pdf", paymentReceiptResponse.DocumentName);
        Assert.NotNull(manualPaymentRequest.Requester);
        Assert.NotNull(paymentApprovalRequest.Requester);
        Assert.EndsWith(".pdf", paymentReceiptRequest.DocumentName);
        Assert.False(string.IsNullOrWhiteSpace(envGateway.ReceivableToken));
        Assert.StartsWith("https://", envMicroservice.ReceivableEndpoint);
        Assert.False(string.IsNullOrWhiteSpace(envPersistence.ValidStatusOrder));
        Assert.False(string.IsNullOrWhiteSpace(envSecretManager.SecretName));
        Assert.False(string.IsNullOrWhiteSpace(envAmazonS3.BucketName));
        Assert.NotNull(envAws.S3Information);
        Assert.False(string.IsNullOrWhiteSpace(envSqlServer.Server));
        Assert.False(string.IsNullOrWhiteSpace(envMultilog.Endpoint));
        Assert.NotNull(env.SqlServerInformation);
        Assert.Single(formFileCollection);
        Assert.Equal("receipt.png", formFile.FileName);
        Assert.NotEmpty(fileBytes);
        Assert.False(string.IsNullOrWhiteSpace(s3Upload.Key));
        Assert.NotNull(manualPaymentDtoOne.Status);
        Assert.NotNull(manualPaymentDtoTwo.Requester);
        Assert.EndsWith(".png", receiptDto.DocumentName);
        Assert.False(string.IsNullOrWhiteSpace(approvalDto.RejectionReason));
        Assert.False(errorResultSuccess.Error);
        Assert.True(errorResultFailure.Error);
    }
}
