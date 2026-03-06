using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities.Filter;
using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Filter;
using System.Reflection;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Test.External.Receivable.Entities.Filter;

public class FilterExtensionsCoverageTests
{
    [Fact]
    public void Given_ReceivableFilter_When_ToDtoIsCalled_Then_ShouldMapProperties()
    {
        // Arrange
        var filter = new ReceivableFilter
        {
            OrderId = Guid.NewGuid(),
            RetrievePayments = RetrievePaymentsEnum.All,
            RetrieveRefunds = RetrieveRefundsEnum.All
        };

        // Act
        var result = filter.ToDto();

        // Assert
        Assert.Equal(filter.OrderId, result.OrderId);
        Assert.Equal(filter.RetrievePayments, result.RetrievePayments);
        Assert.Equal(filter.RetrieveRefunds, result.RetrieveRefunds);
    }

    [Fact]
    public void Given_FilterDtoWithPagingAndDateRange_When_ToQueryStringIsCalled_Then_ShouldIncludeAllFields()
    {
        // Arrange
        var dto = new FilterDto
        {
            OrderId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            ReferenceId = "ref-01",
            DateRange = new DateRange(new DateTime(2026, 1, 1), new DateTime(2026, 1, 31)),
            Paging = new FilterPaging { Page = 2, PerPage = 50 },
            RetrievePayments = RetrievePaymentsEnum.All,
            RetrieveRefunds = RetrieveRefundsEnum.All
        };

        // Act
        var queryString = dto.ToQueryString();

        // Assert
        Assert.Contains("orderId=11111111-1111-1111-1111-111111111111", queryString);
        Assert.Contains("referenceId=ref-01", queryString);
        Assert.Contains("datestart=2026%2f01%2f01", queryString.ToLower());
        Assert.Contains("dateend=2026%2f01%2f31", queryString.ToLower());
        Assert.Contains("page=2", queryString);
        Assert.Contains("perPage=50", queryString);
    }

    [Fact]
    public void Given_FilterDtoWithNulls_When_ToQueryStringIsCalled_Then_ShouldSkipNullProperties()
    {
        // Arrange
        var dto = new FilterDto();

        // Act
        var queryString = dto.ToQueryString();

        // Assert
        Assert.DoesNotContain("orderId=", queryString);
        Assert.DoesNotContain("referenceId=", queryString);
    }

    [Fact]
    public void Given_ToCamelCaseReflection_When_CalledWithShortAndLongValues_Then_ShouldHandleBothBranches()
    {
        // Arrange
        var method = typeof(FilterExtensions).GetMethod("ToCamelCase", BindingFlags.NonPublic | BindingFlags.Static)!;

        // Act
        var emptyResult = method.Invoke(null, new object[] { string.Empty }) as string;
        var oneLetterResult = method.Invoke(null, new object[] { "A" }) as string;
        var longResult = method.Invoke(null, new object[] { "OrderId" }) as string;

        // Assert
        Assert.Equal(string.Empty, emptyResult);
        Assert.Equal("a", oneLetterResult);
        Assert.Equal("orderId", longResult);
    }
}


