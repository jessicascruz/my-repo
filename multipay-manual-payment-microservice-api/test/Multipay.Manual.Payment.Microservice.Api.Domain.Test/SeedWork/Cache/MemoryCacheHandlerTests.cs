using Microsoft.Extensions.Caching.Memory;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Cache;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Test.SeedWork.Cache;

public class MemoryCacheHandlerTests
{
    [Fact]
    public void Given_KeyAndValue_When_SetValueAndTryGetValueAreCalled_Then_ShouldReturnStoredValue()
    {
        // Arrange
        var cache = new MemoryCache(new MemoryCacheOptions());
        var handler = new MemoryCacheHandler(cache);

        // Act
        handler.SetValue("key-1", "value-1", TimeSpan.FromMinutes(1));
        var exists = handler.TryGetValue("key-1", out var value);

        // Assert
        Assert.True(exists);
        Assert.Equal("value-1", value);
    }

    [Fact]
    public void Given_ExistingKey_When_RemoveValueIsCalled_Then_ValueShouldNotExist()
    {
        // Arrange
        var cache = new MemoryCache(new MemoryCacheOptions());
        var handler = new MemoryCacheHandler(cache);
        handler.SetValue("key-2", "value-2", TimeSpan.FromMinutes(1));

        // Act
        handler.RemoveValue("key-2");
        var exists = handler.TryGetValue("key-2", out _);

        // Assert
        Assert.False(exists);
    }
}
