using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multipay.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Contexts;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;


namespace Multipay.Manual.Payment.Microservice.Api.App.Extensions;

public static class EndpointsExtensions
{
    public static void AddEndpoints(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        endpointRouteBuilder.MapGet("/health", Health);
        endpointRouteBuilder.MapGet("/v1/manual-payment/{orderId}", SelectManualPaymentByOrderIdAsync);
        endpointRouteBuilder.MapPost("/v1/manual-payment", CreateManualPayment).DisableAntiforgery();
        endpointRouteBuilder.MapPost("/v1/manual-payment/approval/{manualPaymentId}", CreatePaymentApprovalByIdAsync).DisableAntiforgery();

    }

    public static IResult Health() => Results.Ok("OK");

    [SwaggerOperation(
    Summary = "SelectManualPaymentByOrderIdAsync - Retrieves a manual payment by OrderId.",
    Description = "This endpoint retrieves the manual payment information associated with the specified OrderId, including receipts and related details.",
    OperationId = "SelectManualPaymentByOrderIdAsync",
    Tags = ["OrderId"])]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public static async Task<IResult> SelectManualPaymentByOrderIdAsync([FromServices] IManualPaymentService manualPaymentService, [FromQuery] string reference, [FromRoute] string orderId, [FromServices] ILogContext logContext)
    {
        logContext.CauserId = Constant.MULTILOG_CAUSER_NAME;
        logContext.CauserName = Constant.MULTILOG_CAUSER_NAME;
        logContext.Reference = reference;

        if (!Guid.TryParse(orderId, out var parsedOrderId))
            return GenerateErrorResult(new ErrorResult()
            {
                Message = "Invalid Order Id",
                Error = true,
                StatusCode = ErrorCode.BadRequest,
                Id = "invalid-order-id"
            });

        var (result, error) = await manualPaymentService.SelectManualPaymentByOrderIdAsync(parsedOrderId);

        if (error.Error)
            return GenerateErrorResult(error);

        return Results.Ok(result);

    }

    [SwaggerOperation(
        Summary = "CreateManualPayment - Creates a manual payment.",
        Description = "This endpoint is responsible for creating a new manual payment.",
        OperationId = "CreateManualPayment",
        Tags = ["PaymentManual"])]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public static async Task<IResult> CreateManualPayment(
    [FromServices] IManualPaymentService multipayService,
    [FromServices] ILogContext logContext,
    [FromForm] IFormFileCollection files,
    [FromForm] string manualPaymentRequestPayload)
    {
        logContext.CauserId = Constant.MULTILOG_CAUSER_NAME;
        logContext.CauserName = Constant.MULTILOG_CAUSER_NAME;

        if (string.IsNullOrWhiteSpace(manualPaymentRequestPayload))
        {
            return GenerateErrorResult(new ErrorResult
            {
                Error = true,
                Message = "Request payload is empty.",
                StatusCode = ErrorCode.BadRequest,
                Id = "empty-request-payload"
            });
        }

        ManualPaymentRequest? paymentRequest;

        try
        {
            paymentRequest = JsonSerializer.Deserialize<ManualPaymentRequest>(manualPaymentRequestPayload);
        }
        catch (JsonException)
        {
            return GenerateErrorResult(new ErrorResult
            {
                Error = true,
                Message = "Invalid JSON payload.",
                StatusCode = ErrorCode.BadRequest,
                Id = "invalid-json-payload"
            });
        }

        if (paymentRequest is null)
        {
            return GenerateErrorResult(new ErrorResult
            {
                Error = true,
                Message = "Manual payment request is null.",
                StatusCode = ErrorCode.BadRequest,
                Id = "null-manual-payment-request"
            });
        }

        logContext.Reference = paymentRequest.Reference;

        var (result, error) = await multipayService.CreatePaymentManualAsync(paymentRequest, files);

        if (error?.Error == true)
            return GenerateErrorResult(error);

        return Results.Created($"/manual-payment/{result!.Id}", result);
    }

    [SwaggerOperation(
     Summary = "CreatePaymentApprovalByIdAsync - Retrieves a manual payment by ManualPaymentId.",
     Description = "This endpoint retrieves the manual payment information associated with the specified ManualPaymentId, including receipts and related details.",
     OperationId = "manualPaymentId",
     Tags = ["ManualPaymentId"])]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public static async Task<IResult> CreatePaymentApprovalByIdAsync(
    [FromServices] IManualPaymentService manualPaymentService,
    [FromServices] ILogContext logContext,
    [FromBody] PaymentApprovalRequest approvalRequestPayload,
    [FromRoute] Guid manualPaymentId)
    {
        logContext.CauserId = Constant.MULTILOG_CAUSER_NAME;
        logContext.CauserName = Constant.MULTILOG_CAUSER_NAME;

        var errors = new List<string>();
        var requesterErrors = ValidateRequester(approvalRequestPayload.Requester);
        if (requesterErrors.Any())
        {
            errors.AddRange(requesterErrors);
        }

        if (!approvalRequestPayload.IsApproved && approvalRequestPayload.RejectionReason is null)
            return GenerateErrorResult(new ErrorResult
            {
                Error = true,
                StatusCode = ErrorCode.BadRequest,
                Message = "Reason required when approval rejected"
            });


        var (result, error) = await manualPaymentService.CreatePaymentApprovalByIdAsync(approvalRequestPayload);

        if (error?.Error == true)
            return GenerateErrorResult(error);

        return Results.Created($"/manual-payment/approval/{result!.Id}", result);
    
    }

    private static List<string> ValidateRequester(RequesterRequest requester)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(requester.Id))
        {
            errors.Add("requester.Id must be a valid string.");
        }

        if (string.IsNullOrWhiteSpace(requester.Name))
        {
            errors.Add("requester.Name must be a valid string.");
        }

        if (string.IsNullOrWhiteSpace(requester.Email) || !new EmailAddressAttribute().IsValid(requester.Email))
        {
            errors.Add("requester.Email must be a valid email address.");
        }

        return errors;
    }

    public static IResult GenerateErrorResult(ErrorResult errorResult) => errorResult.StatusCode switch
    {
        // 4xx - Client Errors
        ErrorCode.BadRequest => Results.BadRequest(errorResult),
        ErrorCode.Unauthorized => Results.Unauthorized(),
        ErrorCode.PaymentRequired => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 402),
        ErrorCode.Forbidden => Results.Forbid(),
        ErrorCode.NotFound => Results.NotFound(errorResult),
        ErrorCode.MethodNotAllowed => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 405),
        ErrorCode.NotAcceptable => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 406),
        ErrorCode.ProxyAuthenticationRequired => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 407),
        ErrorCode.RequestTimeout => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 408),
        ErrorCode.Conflict => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 409),
        ErrorCode.Gone => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 410),
        ErrorCode.LengthRequired => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 411),
        ErrorCode.PreconditionFailed => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 412),
        ErrorCode.PayloadTooLarge => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 413),
        ErrorCode.UriTooLong => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 414),
        ErrorCode.UnsupportedMediaType => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 415),
        ErrorCode.RangeNotSatisfiable => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 416),
        ErrorCode.ExpectationFailed => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 417),
        ErrorCode.ImATeapot => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 418),
        ErrorCode.MisdirectedRequest => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 421),
        ErrorCode.UnprocessableEntity => Results.UnprocessableEntity(errorResult),
        ErrorCode.Locked => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 423),
        ErrorCode.FailedDependency => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 424),
        ErrorCode.TooEarly => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 425),
        ErrorCode.UpgradeRequired => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 426),
        ErrorCode.PreconditionRequired => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 428),
        ErrorCode.TooManyRequests => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 429),
        ErrorCode.RequestHeaderFieldsTooLarge => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 431),
        ErrorCode.UnavailableForLegalReasons => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 451),

        // 5xx - Server Errors
        ErrorCode.InternalServerError => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 500),
        ErrorCode.NotImplemented => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 501),
        ErrorCode.BadGateway => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 502),
        ErrorCode.ServiceUnavailable => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 503),
        ErrorCode.GatewayTimeout => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 504),
        ErrorCode.HttpVersionNotSupported => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 505),
        ErrorCode.VariantAlsoNegotiates => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 506),
        ErrorCode.InsufficientStorage => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 507),
        ErrorCode.LoopDetected => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 508),
        ErrorCode.NotExtended => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 510),
        ErrorCode.NetworkAuthenticationRequired => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 511),

        _ => Results.Problem(JsonSerializer.Serialize(errorResult), statusCode: 500)
    };

}
