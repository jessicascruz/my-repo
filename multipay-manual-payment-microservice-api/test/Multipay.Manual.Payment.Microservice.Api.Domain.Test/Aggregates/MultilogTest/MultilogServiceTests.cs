using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multilog.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Cache;
using NSubstitute;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Test.Aggregates.Multilog
{
    public class MultilogServiceTests
{
    private readonly IMultilogRepository _mockMultilogRepository;
    private readonly IMemoryCacheHandler _mockMemoryCacheHandler;
    private readonly EnvironmentKey _mockEnvironmentKey;
    private readonly MultilogService _multilogService;

    public MultilogServiceTests()
    {
        _mockMultilogRepository = Substitute.For<IMultilogRepository>();
        _mockMemoryCacheHandler = Substitute.For<IMemoryCacheHandler>();

        _mockEnvironmentKey = new EnvironmentKey
        {
            MultilogInformation =
                {
                    UserName = "test_user",
                    Password = "test_password"
                }
        };

        _multilogService = new MultilogService(
            _mockMultilogRepository,
            _mockMemoryCacheHandler,
            _mockEnvironmentKey);
    }

    [Fact]
    public async Task GivenValidCacheToken_WhenLoginAsyncCalled_ThenReturnsCachedToken()
    {
        // Arrange
        string cachedToken = "cached_access_token";
        _mockMemoryCacheHandler.TryGetValue(Constant.APP_MULTILOG_CACHE_TOKEN_KEY, out Arg.Any<string?>())
            .Returns(x =>
            {
                x[1] = cachedToken;
                return true;
            });

        // Act
        var result = await _multilogService.LoginAsync();

        // Assert
        Assert.Equal(cachedToken, result);

        // Verify cache retrieval
        _mockMemoryCacheHandler.Received(1).TryGetValue(Constant.APP_MULTILOG_CACHE_TOKEN_KEY, out Arg.Any<string?>());
    }

    [Fact]
    public async Task GivenNoCacheToken_WhenLoginAsyncCalled_ThenFetchesNewTokenAndStoresInCache()
    {
        // Arrange
        var token = new Token
        {
            AccessToken = "new_access_token",
            ExpiresIn = 3600,
            RefreshToken = "refresh_token",
            Roles = ["test_role", "test_role_2"],
            User = new() { Id = "user_id", Name = "test_name", Username = "test_username" }
        };

        _mockMemoryCacheHandler.TryGetValue(Constant.APP_MULTILOG_CACHE_TOKEN_KEY, out Arg.Any<string?>())
            .Returns(x =>
            {
                x[1] = null;
                return false;
            });

        _mockMultilogRepository.LoginAsync(Arg.Any<Login>()).Returns(token);

        // Act
        var result = await _multilogService.LoginAsync();

        // Assert
        Assert.Equal(token.AccessToken, result);

        // Verify repository and cache interactions
        await _mockMultilogRepository.Received(1).LoginAsync(Arg.Any<Login>());
        _mockMemoryCacheHandler.Received(1).SetValue(
            Constant.APP_MULTILOG_CACHE_TOKEN_KEY,
            token.AccessToken,
            Arg.Is<TimeSpan>(t => t.TotalSeconds == 3600 - 1800));
    }

    [Fact]
    public async Task GivenMultilogEntity_WhenInsertAsyncCalled_ThenCallsRepositoryWithToken()
    {
        // Arrange
        var multilog = new MultilogPayload
        {
            System = "TestSystem",
            Type = SystemType.Update,
            Reference = "TestReference",
            ReferenceType = Constant.APP_MULTILOG_REFERENCE_TYPE,
            CauserId = "123",
            CauserName = "TestUser",
            Properties = new Properties
            {
                Request = new object(),
                Response = new { Status = "Success" }
            }
        };

        string token = "valid_access_token";
        _mockMemoryCacheHandler.TryGetValue(Constant.APP_MULTILOG_CACHE_TOKEN_KEY, out Arg.Any<string?>())
            .Returns(x =>
            {
                x[1] = token;
                return true;
            });

        // Act
        await _multilogService.InsertAsync(multilog);

        // Assert
        await _mockMultilogRepository.Received(1).InsertAsync(multilog, token);
    }
}
}

