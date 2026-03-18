using System.ComponentModel;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Enums;
using Xunit;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Test.SeedWork;

public class EnumExtensionsTest
{
    private enum TestEnum
    {
        [Description("First Value Description")]
        FirstValue = 1,
        SecondValue = 2
    }

    [Fact]
    public void Given_EnumWithDescription_When_GetDescription_Then_ReturnDescription()
    {
        // Arrange
        var value = TestEnum.FirstValue;

        // Act
        var result = value.GetDescription();

        // Assert
        Assert.Equal("First Value Description", result);
    }

    [Fact]
    public void Given_EnumWithoutDescription_When_GetDescription_Then_ReturnEnumName()
    {
        // Arrange
        var value = TestEnum.SecondValue;

        // Act
        var result = value.GetDescription();

        // Assert
        Assert.Equal("SecondValue", result);
    }

    [Fact]
    public void Given_ValidEnumName_When_IsValidEnumValueString_Then_ReturnTrue()
    {
        // Act
        var result = EnumExtensions.IsValidEnumValue<TestEnum>("FirstValue");

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void Given_ValidEnumDescription_When_IsValidEnumValueString_Then_ReturnTrue()
    {
        // Act
        var result = EnumExtensions.IsValidEnumValue<TestEnum>("First Value Description");

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void Given_InvalidString_When_IsValidEnumValueString_Then_ReturnFalse()
    {
        // Act
        var result = EnumExtensions.IsValidEnumValue<TestEnum>("NonExistent");

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void Given_CaseInsensitiveName_When_IsValidEnumValueString_Then_ReturnTrue()
    {
        // Act
        var result = EnumExtensions.IsValidEnumValue<TestEnum>("firstvalue");

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void Given_ValidEnumInt_When_IsValidEnumValueInt_Then_ReturnTrue()
    {
        // Act
        var result = EnumExtensions.IsValidEnumValue<TestEnum>(1);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void Given_InvalidEnumInt_When_IsValidEnumValueInt_Then_ReturnFalse()
    {
        // Act
        var result = EnumExtensions.IsValidEnumValue<TestEnum>(999);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void Given_ValidEnumName_When_GetEnumIdOrDefault_Then_ReturnCorrectId()
    {
        // Act
        var result = EnumExtensions.GetEnumIdOrDefault<TestEnum>("FirstValue");

        // Assert
        Assert.Equal(1, result);
    }

    [Fact]
    public void Given_InvalidEnumName_When_GetEnumIdOrDefault_Then_ReturnDefault()
    {
        // Act
        var result = EnumExtensions.GetEnumIdOrDefault<TestEnum>("NonExistent");

        // Assert
        Assert.Equal(0, result);
    }

    [Fact]
    public void Given_CaseInsensitiveName_When_GetEnumIdOrDefault_Then_ReturnCorrectId()
    {
        // Act
        var result = EnumExtensions.GetEnumIdOrDefault<TestEnum>("secondvalue");

        // Assert
        Assert.Equal(2, result);
    }

}
