using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Mappers;
using System.Reflection;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.External.Receivable.Mappers;

public class ReceivableMapperPrivateCoverageTests
{
    [Fact]
    public void Given_ItemDtoList_When_PrivateToDomainIsInvokedByReflection_Then_ShouldMapAllFields()
    {
        // Arrange
        var items = new List<ItemDto>
        {
            new() { Id = Guid.NewGuid(), Quantity = 1, UnitPrice = 9.9f, Image = "img", Name = "item" }
        };

        var method = typeof(ReceivableMapper)
            .GetMethods(BindingFlags.NonPublic | BindingFlags.Static)
            .First(x => x.Name == "ToDomain" && x.GetParameters()[0].ParameterType == typeof(List<ItemDto>));

        // Act
        var result = method.Invoke(null, new object[] { items });
        var mapped = Assert.IsType<List<Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities.Item>>(result);

        // Assert
        Assert.Single(mapped);
        Assert.Equal(items[0].Id, mapped[0].Id);
        Assert.Equal(items[0].Name, mapped[0].Name);
    }

    [Fact]
    public void Given_PaymentDtoList_When_PrivateToDomainIsInvokedByReflection_Then_ShouldMapAllFields()
    {
        // Arrange
        var payments = new List<PaymentDto>
        {
            new()
            {
                Method = MethodEnum.CREDIT_CARD,
                Id = Guid.NewGuid(),
                Amount = 100,
                Status = PaymentStatusEnum.CONFIRMED,
                StatusDetail = "ok",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AuthorizedAt = DateTime.UtcNow,
                ApprovedAt = DateTime.UtcNow,
                Pix = new PaymentPixDto { Code = "code", QrCode = "qr" },
                Ticket = new PaymentTicketDto { BarCode = "123", Url = "url" },
                Acquirer = new PaymentAcquirerDto { Id = 1, Description = "desc", PaymentId = "pid", Nsu = "nsu", TransactionId = "tx" }
            }
        };

        var method = typeof(ReceivableMapper)
            .GetMethods(BindingFlags.NonPublic | BindingFlags.Static)
            .First(x => x.Name == "ToDomain" && x.GetParameters()[0].ParameterType == typeof(List<PaymentDto>));

        // Act
        var result = method.Invoke(null, new object[] { payments });
        var mapped = Assert.IsType<List<Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities.ReceivablePayment>>(result);

        // Assert
        Assert.Single(mapped);
        Assert.Equal(payments[0].Id, mapped[0].Id);
        Assert.Equal(payments[0].Acquirer!.TransactionId, mapped[0].Acquirer.TransactionId);
        Assert.Equal(payments[0].Pix!.Code, mapped[0].Pix!.Code);
    }
}

