using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Xunit;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Test.SeedWork;

public class ObjectValidatorCollectionTest
{
    public class TestObjectValidator : ObjectValidator
    {
        public new bool AllPropertiesAreFilled(object? obj) => base.AllPropertiesAreFilled(obj);
    }

    public class SimpleObject
    {
        public string Name { get; set; } = string.Empty;
    }

    [Fact]
    public void Given_NullObject_When_AllPropertiesAreFilled_Then_ReturnFalse()
    {
        // Arrange
        var validator = new TestObjectValidator();

        // Act
        var result = validator.AllPropertiesAreFilled(null);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void Given_EmptyList_When_AllPropertiesAreFilled_Then_ReturnFalse()
    {
        // Arrange
        var validator = new TestObjectValidator();
        var emptyList = new List<SimpleObject>();

        // Act
        var result = validator.AllPropertiesAreFilled(emptyList);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void Given_ListWithValidItems_When_AllPropertiesAreFilled_Then_ReturnTrue()
    {
        // Arrange
        var validator = new TestObjectValidator();
        var list = new List<SimpleObject> { new() { Name = "Test" } };

        // Act
        var result = validator.AllPropertiesAreFilled(list);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void Given_ListWithInvalidItem_When_AllPropertiesAreFilled_Then_ReturnFalse()
    {
        // Arrange
        var validator = new TestObjectValidator();
        var list = new List<SimpleObject> { new() { Name = "" } };

        // Act
        var result = validator.AllPropertiesAreFilled(list);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void Given_StringValue_When_AllPropertiesAreFilled_Then_NotTreatedAsEnumerable()
    {
        // Arrange
        var validator = new TestObjectValidator();

        // A string is IEnumerable but should NOT be treated as a collection
        // So we test it via an object with a string property
        var obj = new SimpleObject { Name = "valid" };

        // Act
        var result = validator.AllPropertiesAreFilled(obj);

        // Assert
        Assert.True(result);
    }

}
