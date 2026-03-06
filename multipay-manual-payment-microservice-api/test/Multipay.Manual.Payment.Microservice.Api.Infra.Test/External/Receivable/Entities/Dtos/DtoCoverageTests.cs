using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.Multipay.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Filter;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.External.Receivable.Entities.Dtos;

public class DtoCoverageTests
{
    [Fact]
    public void Given_OrderDto_When_PropertiesAreAssigned_Then_ShouldKeepValues()
    {
        // Arrange
        var id = Guid.NewGuid();

        // Act
        var dto = new OrderDto
        {
            Id = id,
            ParentId = Guid.NewGuid(),
            TypeId = "type",
            SystemId = 1,
            BusinessPartnerId = Guid.NewGuid(),
            DeliveryAddressId = Guid.NewGuid(),
            BillingAddressId = Guid.NewGuid(),
            StatusId = 2,
            CompanyId = 3,
            ReferenceId = "ref",
            SubReferenceId = "sub",
            ConditionId = "cond",
            Amount = 10.5,
            Discount = 1.5,
            ExpirationTime = 600,
            CallbackUrl = "https://cb",
            Link = "https://link",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Assert
        Assert.Equal(id, dto.Id);
        Assert.Equal("type", dto.TypeId);
        Assert.Equal(10.5, dto.Amount);
        Assert.Equal("https://link", dto.Link);
    }

    [Fact]
    public void Given_ItemAndPaymentDtos_When_PropertiesAreAssigned_Then_ShouldKeepValues()
    {
        // Arrange
        var paymentId = Guid.NewGuid();

        // Act
        var item = new ItemDto { Id = Guid.NewGuid(), Quantity = 2, UnitPrice = 15.5f, Image = "img", Name = "name" };
        var payment = new PaymentDto
        {
            Method = MethodEnum.CREDIT_CARD,
            Id = paymentId,
            Amount = 99.9,
            Status = PaymentStatusEnum.CONFIRMED,
            StatusDetail = "ok",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            AuthorizedAt = DateTime.UtcNow,
            ApprovedAt = DateTime.UtcNow,
            Pix = new PaymentPixDto { Code = "code", QrCode = "qr" },
            Ticket = new PaymentTicketDto { Url = "url", BarCode = "bar" },
            Acquirer = new PaymentAcquirerDto { Id = 1, Description = "desc", PaymentId = "p", Nsu = "n", TransactionId = "t" }
        };

        // Assert
        Assert.Equal(2, item.Quantity);
        Assert.Equal(MethodEnum.CREDIT_CARD, payment.Method);
        Assert.Equal(paymentId, payment.Id);
        Assert.Equal("code", payment.Pix!.Code);
        Assert.Equal("desc", payment.Acquirer!.Description);
    }

    [Fact]
    public void Given_StartAndEndDate_When_DateRangeIsInstantiated_Then_ShouldExposeProvidedValues()
    {
        // Arrange
        var start = DateTime.UtcNow.AddDays(-1);
        var end = DateTime.UtcNow;

        // Act
        var dateRange = new DateRange(start, end);

        // Assert
        Assert.Equal(start, dateRange.Start);
        Assert.Equal(end, dateRange.End);
    }
}
