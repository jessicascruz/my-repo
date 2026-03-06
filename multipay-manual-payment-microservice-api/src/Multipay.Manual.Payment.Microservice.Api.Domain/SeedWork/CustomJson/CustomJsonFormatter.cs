using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Logging.Console;
using System.Text.Json;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.CustomJson;

public class CustomJsonFormatter : ConsoleFormatter
{
    public CustomJsonFormatter() : base("customjson")
    {
    }

    public override void Write<TState>(in LogEntry<TState> logEntry, IExternalScopeProvider scopeProvider, TextWriter textWriter)
    {
        var logObject = new
        {
            timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"),
            level = logEntry.LogLevel.ToString().ToLower(),
            logger = logEntry.Category,
            message = logEntry.Formatter(logEntry.State, logEntry.Exception),
            exception = logEntry.Exception != null ? new
            {
                type = logEntry.Exception.GetType().Name,
                message = logEntry.Exception.Message,
                stackTrace = logEntry.Exception.StackTrace,
                innerException = logEntry.Exception.InnerException != null ? new
                {
                    type = logEntry.Exception.InnerException.GetType().Name,
                    message = logEntry.Exception.InnerException.Message
                } : null
            } : null
        };

        var json = JsonSerializer.Serialize(logObject, new JsonSerializerOptions
        {
            WriteIndented = false
        });

        textWriter.WriteLine(json);
    }
}
