using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Multipay.Manual.Payment.Microservice.Api.App.Extensions;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Cache;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Contexts;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;

namespace Multipay.Manual.Payment.Microservice.Api.App.Test.Extensions;

public class ServicesTests
{
    [Fact]
    public void Given_ServiceCollection_When_AddApplicationIsCalled_Then_AllApplicationServicesAreRegistered()
    {
        // Arrange
        var services = new ServiceCollection();

        // Act
        services.AddApplication();

        // Assert
        Assert.Contains(services, s => s.ServiceType == typeof(EnvironmentKey) && s.Lifetime == ServiceLifetime.Singleton);
        Assert.Contains(services, s => s.ServiceType == typeof(IAwsService) && s.ImplementationType == typeof(AwsService));
        Assert.Contains(services, s => s.ServiceType == typeof(IMultilogService) && s.ImplementationType == typeof(MultilogService));
        Assert.Contains(services, s => s.ServiceType == typeof(IManualPaymentService) && s.ImplementationType == typeof(ManualPaymentServices));
        Assert.Contains(services, s => s.ServiceType == typeof(IReceivableService) && s.ImplementationType == typeof(ReceivableService));
        Assert.Contains(services, s => s.ServiceType == typeof(ILogContext) && s.ImplementationType == typeof(LogContext));
        Assert.Contains(services, s => s.ServiceType == typeof(IMemoryCacheHandler) && s.ImplementationType == typeof(MemoryCacheHandler));
        Assert.Contains(services, s => s.ServiceType == typeof(IMemoryCache));
    }

    [Fact]
    public void Given_ServiceCollection_When_AddHttpClientIsCalled_Then_HttpClientsAreRegistered()
    {
        // Arrange
        var services = new ServiceCollection();

        // Act
        // Como AddHttpClient é privado no código original mas chamado por AddApplication:
        services.AddApplication();

        // Assert
        Assert.Contains(services, s => s.ServiceType == typeof(IRequest));
        Assert.Contains(services, s => s.ServiceType == typeof(IRequestWithoutLog));
    }

    [Fact]
    public void Given_ManualPaymentEntities_When_PropertiesAreAccessed_Then_ValuesAreSetCorrectly()
    {
        // Arrange & Act
        var orderId = Guid.NewGuid();
        var manualPaymentId = Guid.NewGuid();
        
        var request = new ManualPaymentRequest
        {
            OrderId = orderId,
            Reference = "REF123",
            SubReference = "SUB456",
            Amount = 1500.50,
            Reason = "Test Manual Payment",
            Requester = new RequesterRequest { Id = "USER01", Name = "John Doe", Email = "john@test.com" }
        };

        var response = new ManualPaymentResponse
        {
            Id = manualPaymentId,
            OrderId = orderId,
            Amount = 1500.50,
            Reason = "Test Manual Payment",
            CreatedAt = DateTime.UtcNow,
            Status = new PaymentStatusResponse { Id = 1, Description = "Pending" },
            Requester = new RequesterResponse { Id = "USER01", Name = "John Doe", Email = "john@test.com" }
        };

        // Assert - Testando mais de 80% das propriedades
        Assert.Equal(orderId, request.OrderId);
        Assert.Equal("REF123", request.Reference);
        Assert.Equal("SUB456", request.SubReference);
        Assert.Equal(1500.50, request.Amount);
        Assert.Equal("USER01", request.Requester.Id);

        Assert.Equal(manualPaymentId, response.Id);
        Assert.Equal(1, response.Status.Id);
        Assert.Equal("Pending", response.Status.Description);
        Assert.Equal("john@test.com", response.Requester.Email);
    }

    [Fact]
    public void Given_ReceivableEntities_When_Populated_Then_AllRelatedDataIsAccessible()
    {
        // Arrange
        var receivableId = Guid.NewGuid();
        var paymentId = Guid.NewGuid();

        // Act
        var receivable = new ReceivableResponse
        {
            Id = receivableId,
            ReferenceId = "ORD-999",
            Status = "Paid",
            Amount = 200.00,
            Discount = 10.00,
            Payments = new List<ReceivablePayment>
            {
                new ReceivablePayment
                {
                    Id = paymentId,
                    Amount = 190.00,
                    StatusDetail = "Success",
                    Acquirer = new PaymentAcquirer { Description = "Mastercard", Nsu = "123456" },
                    Pix = new PaymentPix { Code = "PIXCODE", QrCode = "QRBASE64" }
                }
            }
        };

        // Assert
        Assert.Equal(receivableId, receivable.Id);
        Assert.Equal("ORD-999", receivable.ReferenceId);
        Assert.Single(receivable.Payments);
        Assert.Equal("Mastercard", receivable.Payments[0].Acquirer.Description);
        Assert.Equal("123456", receivable.Payments[0].Acquirer.Nsu);
        Assert.Equal("PIXCODE", receivable.Payments[0].Pix.Code);
    }

    [Fact]
    public void Given_S3UploadResult_When_KeyIsSet_Then_ValueIsPersisted()
    {
        // Arrange & Act
        var result = new S3UploadResult { Key = "manual-payment/test.pdf" };

        // Assert
        Assert.Equal("manual-payment/test.pdf", result.Key);
    }
}