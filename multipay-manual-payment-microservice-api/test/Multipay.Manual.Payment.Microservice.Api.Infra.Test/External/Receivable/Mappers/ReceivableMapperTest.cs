using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Mappers;
using Multipay.Manual.Payment.Microservice.Api.Test.Mocks;
using Xunit;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.External.Receivable.Mappers;

public class ReceivableMapperTest
{
    [Fact]
    public void GivenReceivableDto_WhenToDomain_ThenMapCorrectly()
    {
        // Arrange
        var dto = new ReceivableDto
        {
            Id = Guid.NewGuid(),
            Status = "APPROVED",
            Amount = 100.0
        };

        // Act
        var result = dto.ToDomain();

        // Assert
        Assert.Equal(dto.Id, result.Id);
        Assert.Equal(dto.Status, result.Status);
        Assert.Equal(dto.Amount, result.Amount);
    }

    [Fact]
    public void GivenPaymentTicketDto_WhenToDomain_ThenMapCorrectly()
    {
        // Arrange
        var dto = new PaymentTicketDto
        {
            BarCode = "12345",
            Url = "http://ticket.com"
        };

        // Act
        var result = dto.ToDomain();

        // Assert
        Assert.Equal(dto.BarCode, result.BarCode);
        Assert.Equal(dto.Url, result.Url);
    }

    [Fact]
    public void GivenPaymentPixDto_WhenToDomain_ThenMapCorrectly()
    {
        // Arrange
        var dto = new PaymentPixDto
        {
            Code = "pix-code",
            QrCode = "qr-code"
        };

        // Act
        var result = dto.ToDomain();

        // Assert
        Assert.Equal(dto.Code, result.Code);
        Assert.Equal(dto.QrCode, result.QrCode);
    }

    [Fact]
    public void GivenReceivableCompanyDto_WhenToDomain_ThenMapCorrectly()
    {
        // Arrange
        var dto = new ReceivableCompanyDto
        {
            Id = 1,
            Code = "C1",
            Description = "Company 1"
        };

        // Act
        var result = dto.ToDomain();

        // Assert
        Assert.Equal(dto.Id, result.Id);
        Assert.Equal(dto.Code, result.Code);
        Assert.Equal(dto.Description, result.Description);
    }

    [Fact]
    public void GivenReceivableRefundDtoList_WhenToDomain_ThenMapAllItems()
    {
        // Arrange
        var dtoList = new List<ReceivableRefundDto>
        {
            new ReceivableRefundDto
            {
                Id = Guid.NewGuid(),
                Amount = 50.0,
                Requester = new ReceivableRefundRequesterDto { Id = Guid.NewGuid(), Name = "Req", Email = "e@e.com" },
                Acquirer = new ReceivableRefundAcquirerDto { Id = 1, Description = "Acq", PaymentId = "p1", RefundId = "r1", Status = "S", StatusDetail = "D" }
            }
        };

        // Act
        var result = dtoList.ToDomain();

        // Assert
        Assert.Single(result);
        Assert.Equal(dtoList[0].Id, result[0].Id);
        Assert.Equal(dtoList[0].Amount, result[0].Amount);
        Assert.Equal(dtoList[0].Requester.Name, result[0].Requester.Name);
        Assert.Equal(dtoList[0].Acquirer.Description, result[0].Acquirer.Description);
    }
    [Fact]
    public void GivenReceivableRefundDtoListWithMultipleItems_WhenToDomain_ThenMapAllCorrectly()
    {
        // Arrange
        var dtoList = new List<ReceivableRefundDto>
        {
            new ReceivableRefundDto
            {
                Id = Guid.NewGuid(), Amount = 25.0, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow,
                Requester = new ReceivableRefundRequesterDto { Id = Guid.NewGuid(), Name = "A", Email = "a@a.com" },
                Acquirer = new ReceivableRefundAcquirerDto { Id = 1, Description = "D1", PaymentId = "P1", RefundId = "R1", Status = "S", StatusDetail = "SD" }
            },
            new ReceivableRefundDto
            {
                Id = Guid.NewGuid(), Amount = 75.0, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow,
                Requester = new ReceivableRefundRequesterDto { Id = Guid.NewGuid(), Name = "B", Email = "b@b.com" },
                Acquirer = new ReceivableRefundAcquirerDto { Id = 2, Description = "D2", PaymentId = "P2", RefundId = "R2", Status = "E", StatusDetail = "SD2" }
            }
        };

        // Act
        var result = dtoList.ToDomain();

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Equal(dtoList[0].Requester.Email, result[0].Requester.Email);
        Assert.Equal(dtoList[1].Acquirer.RefundId, result[1].Acquirer.RefundId);
        Assert.Equal(dtoList[0].Acquirer.StatusDetail, result[0].Acquirer.StatusDetail);
    }

    [Fact]
    public void GivenEmptyRefundDtoList_WhenToDomain_ThenReturnEmptyList()
    {
        // Arrange
        var dtoList = new List<ReceivableRefundDto>();

        // Act
        var result = dtoList.ToDomain();

        // Assert
        Assert.Empty(result);
    }
}
