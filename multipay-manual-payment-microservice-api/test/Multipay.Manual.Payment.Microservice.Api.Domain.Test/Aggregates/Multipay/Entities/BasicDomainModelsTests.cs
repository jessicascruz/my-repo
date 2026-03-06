using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multipay.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multipay.Entities.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities.Filter;
using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Contexts;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP;
using Multipay.Manual.Payment.Microservice.Api.Test.Mocks;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Test.Aggregates.Multipay.Entities;

public class BasicDomainModelsTests
{
    [Fact]
    public void Given_DomainEntities_When_PropertiesAreAssigned_Then_ValuesShouldBePersisted()
    {
        // Arrange
        var order = MockData.GetMockOrder();
        var address = MockData.GetMockAddress();
        var businessPartner = MockData.GetMockBusinessPartner();
        var item = MockData.GetMockItem();
        var filter = MockData.GetMockReceivableFilter();
        var requesterRequest = new RequesterRequest { Id = "req-id", Name = "req-name", Email = "req@mail.com" };

        // Act
        var logContext = new LogContext { CauserId = "1", CauserName = "name", Reference = "ref" };
        var customHeaders = new CustomHeaders
        {
            GatewayToken = "gateway-token",
            AuthorizationOrdinaryToken = "auth-token",
            Headers = new Dictionary<string, string> { ["x-custom"] = "v1" }
        };

        // Assert
        Assert.NotEqual(Guid.Empty, order.Id);
        Assert.Equal("Avenida Paulista", address.Street);
        Assert.Equal(DocumentTypeEnum.CPF, businessPartner.DocumentType);
        Assert.True(item.Quantity > 0);
        Assert.Equal(RetrievePaymentsEnum.All, filter.RetrievePayments);
        Assert.Equal("req-id", requesterRequest.Id);
        Assert.Equal("1", logContext.CauserId);
        Assert.Equal("gateway-token", customHeaders.GatewayToken);
        Assert.Equal("v1", customHeaders.Headers!["x-custom"]);
    }

    [Fact]
    public void Given_StatusRequest_When_PropertiesAreAssigned_Then_ShouldKeepValues()
    {
        // Arrange
        var statusRequest = new StatusRequest();

        // Act
        statusRequest.Event = "PAYMENT_UPDATE";
        statusRequest.SubEvent = "STATUS_CHANGED";
        statusRequest.AcquirerId = 55;
        statusRequest.MethodId = 2;

        // Assert
        Assert.Equal("PAYMENT_UPDATE", statusRequest.Event);
        Assert.Equal("STATUS_CHANGED", statusRequest.SubEvent);
        Assert.Equal(55, statusRequest.AcquirerId);
        Assert.Equal(2, statusRequest.MethodId);
    }
}
