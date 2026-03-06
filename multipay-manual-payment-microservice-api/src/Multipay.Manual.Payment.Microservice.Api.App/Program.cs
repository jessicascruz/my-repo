using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Logging.Console;
using Microsoft.OpenApi.Models;
using Multipay.Manual.Payment.Microservice.Api.App.Extensions;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.CustomJson;

var builder = WebApplication.CreateBuilder(args);

// Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole(options =>
{
    options.FormatterName = "customjson";
})
.AddConsoleFormatter<CustomJsonFormatter, ConsoleFormatterOptions>();

builder.Logging.AddFilter((provider, category, logLevel) =>
    logLevel >= LogLevel.Warning);

// Services
builder.Services.AddHttpContextAccessor();
builder.Services.AddCustomServices(builder.Configuration);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{   
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "Multipay - Manual Payment Microservice",
        Description = "Microservice responsible for generating manual payments."
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(config =>
    {
        config.SwaggerEndpoint("/swagger/v1/swagger.json", "Multipay - Manual Payment Microservice");
        config.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();

await app.FillEnvironmentVariables(app.Configuration);
app.AddEndpoints();

app.Run();

