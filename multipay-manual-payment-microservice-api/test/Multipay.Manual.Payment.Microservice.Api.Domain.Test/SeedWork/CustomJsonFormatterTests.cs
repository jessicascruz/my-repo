using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Logging.Console;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.CustomJson;
using System.Text;
using System.Text.Json;
using Xunit;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Test.SeedWork
{
    public class CustomJsonFormatterTests
    {
        private readonly CustomJsonFormatter _formatter;
        private readonly StringWriter _textWriter;
        private readonly IExternalScopeProvider _scopeProvider;

        public CustomJsonFormatterTests()
        {
            _formatter = new CustomJsonFormatter();
            _textWriter = new StringWriter();
            _scopeProvider = new LoggerExternalScopeProvider();
        }

        [Fact]
        public void Constructor_WhenCalled_SetsCorrectName()
        {
            // Arrange & Act
            var formatter = new CustomJsonFormatter();

            // Assert
            Assert.Equal("customjson", formatter.Name);
        }

        [Fact]
        public void Write_WithSimpleLogEntry_ProducesValidJson()
        {
            // Arrange
            var logEntry = new LogEntry<string>(
                LogLevel.Information,
                "TestCategory",
                new EventId(1),
                "Test message",
                null,
                (state, exception) => state);

            // Act
            _formatter.Write(logEntry, _scopeProvider, _textWriter);

            // Assert
            var jsonOutput = _textWriter.ToString();
            Assert.False(string.IsNullOrEmpty(jsonOutput));

            var logObject = JsonSerializer.Deserialize<JsonElement>(jsonOutput);
            Assert.Equal("Test message", logObject.GetProperty("message").GetString());
            Assert.Equal("information", logObject.GetProperty("level").GetString());
            Assert.Equal("TestCategory", logObject.GetProperty("logger").GetString());
            Assert.True(logObject.GetProperty("timestamp").GetString().Length > 0);
        }

        [Fact]
        public void Write_WithDifferentLogLevels_ConvertsLevelToLowerCase()
        {
            // Arrange
            var logLevels = new[]
            {
                LogLevel.Trace,
                LogLevel.Debug,
                LogLevel.Information,
                LogLevel.Warning,
                LogLevel.Error,
                LogLevel.Critical
            };

            foreach (var logLevel in logLevels)
            {
                _textWriter.GetStringBuilder().Clear();
                var logEntry = new LogEntry<string>(
                    logLevel,
                    "TestCategory",
                    new EventId(1),
                    "Test message",
                    null,
                    (state, exception) => state);

                // Act
                _formatter.Write(logEntry, _scopeProvider, _textWriter);

                // Assert
                var jsonOutput = _textWriter.ToString();
                var logObject = JsonSerializer.Deserialize<JsonElement>(jsonOutput);
                var level = logObject.GetProperty("level").GetString();
                Assert.Equal(logLevel.ToString().ToLower(), level);
            }
        }

        [Fact]
        public void Write_WithException_IncludesExceptionDetails()
        {
            // Arrange
            var exception = new InvalidOperationException("Test exception message");
            var logEntry = new LogEntry<string>(
                LogLevel.Error,
                "TestCategory",
                new EventId(1),
                "Test message with exception",
                exception,
                (state, exception) => state);

            // Act
            _formatter.Write(logEntry, _scopeProvider, _textWriter);

            // Assert
            var jsonOutput = _textWriter.ToString();
            var logObject = JsonSerializer.Deserialize<JsonElement>(jsonOutput);

            var exceptionObject = logObject.GetProperty("exception");
            Assert.Equal(nameof(InvalidOperationException), exceptionObject.GetProperty("type").GetString());
            Assert.Equal("Test exception message", exceptionObject.GetProperty("message").GetString());
            Assert.True(string.IsNullOrEmpty(exceptionObject.GetProperty("stackTrace").GetString()));
        }

        [Fact]
        public void Write_WithInnerException_IncludesInnerExceptionDetails()
        {
            // Arrange
            var innerException = new ArgumentException("Inner exception message");
            var exception = new InvalidOperationException("Outer exception message", innerException);
            var logEntry = new LogEntry<string>(
                LogLevel.Error,
                "TestCategory",
                new EventId(1),
                "Test message with inner exception",
                exception,
                (state, exception) => state);

            // Act
            _formatter.Write(logEntry, _scopeProvider, _textWriter);

            // Assert
            var jsonOutput = _textWriter.ToString();
            var logObject = JsonSerializer.Deserialize<JsonElement>(jsonOutput);

            var exceptionObject = logObject.GetProperty("exception");
            var innerExceptionObject = exceptionObject.GetProperty("innerException");

            Assert.Equal(nameof(ArgumentException), innerExceptionObject.GetProperty("type").GetString());
            Assert.Equal("Inner exception message", innerExceptionObject.GetProperty("message").GetString());
        }

        [Fact]
        public void Write_WithoutException_HasNullExceptionField()
        {
            // Arrange
            var logEntry = new LogEntry<string>(
                LogLevel.Information,
                "TestCategory",
                new EventId(1),
                "Test message without exception",
                null,
                (state, exception) => state);

            // Act
            _formatter.Write(logEntry, _scopeProvider, _textWriter);

            // Assert
            var jsonOutput = _textWriter.ToString();
            var logObject = JsonSerializer.Deserialize<JsonElement>(jsonOutput);

            var exceptionProperty = logObject.GetProperty("exception");
            Assert.Equal(JsonValueKind.Null, exceptionProperty.ValueKind);
        }

        [Fact]
        public void Write_WithComplexState_UsesFormatterCorrectly()
        {
            // Arrange
            var state = new { UserId = 123, Action = "Login" };
            var logEntry = new LogEntry<object>(
                LogLevel.Information,
                "TestCategory",
                new EventId(1),
                state,
                null,
                (state, exception) => $"User {((dynamic)state).UserId} performed {((dynamic)state).Action}");

            // Act
            _formatter.Write(logEntry, _scopeProvider, _textWriter);

            // Assert
            var jsonOutput = _textWriter.ToString();
            var logObject = JsonSerializer.Deserialize<JsonElement>(jsonOutput);

            Assert.Equal("User 123 performed Login", logObject.GetProperty("message").GetString());
        }

        [Fact]
        public void Write_WithNullScopeProvider_DoesNotThrowException()
        {
            // Arrange
            var logEntry = new LogEntry<string>(
                LogLevel.Information,
                "TestCategory",
                new EventId(1),
                "Test message",
                null,
                (state, exception) => state);

            // Act & Assert
            var exception = Record.Exception(() =>
                _formatter.Write(logEntry, null, _textWriter));

            Assert.Null(exception);
        }

        [Fact]
        public void Write_WithNullTextWriter_ThrowsArgumentNullException()
        {
            // Arrange
            var logEntry = new LogEntry<string>(
                LogLevel.Information,
                "TestCategory",
                new EventId(1),
                "Test message",
                null,
                (state, exception) => state);

            // Act & Assert
            Assert.Throws<NullReferenceException>(() =>
                _formatter.Write(logEntry, _scopeProvider, null));
        }

        [Fact]
        public void Write_Timestamp_HasCorrectFormat()
        {
            // Arrange
            var logEntry = new LogEntry<string>(
                LogLevel.Information,
                "TestCategory",
                new EventId(1),
                "Test message",
                null,
                (state, exception) => state);

            // Act
            _formatter.Write(logEntry, _scopeProvider, _textWriter);

            // Assert
            var jsonOutput = _textWriter.ToString();
            var logObject = JsonSerializer.Deserialize<JsonElement>(jsonOutput);

            var timestamp = logObject.GetProperty("timestamp").GetString();
            // Verifica se o timestamp tem o formato esperado: yyyy-MM-dd HH:mm:ss.fff
            Assert.Matches(@"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$", timestamp);
        }

        [Fact]
        public void Write_JsonOutput_IsNotIndented()
        {
            // Arrange
            var logEntry = new LogEntry<string>(
                LogLevel.Information,
                "TestCategory",
                new EventId(1),
                "Test message",
                null,
                (state, exception) => state);

            // Act
            _formatter.Write(logEntry, _scopeProvider, _textWriter);

            // Assert
            var jsonOutput = _textWriter.ToString();
            // JSON não indentado não deve conter quebras de linha ou espaços extras
            Assert.DoesNotContain("\n  ", jsonOutput);
            // Deve conter apenas uma linha
            var lines = jsonOutput.Split('\n');
            Assert.Equal(1, lines.Count(line => !string.IsNullOrWhiteSpace(line)));
        }
    }
}