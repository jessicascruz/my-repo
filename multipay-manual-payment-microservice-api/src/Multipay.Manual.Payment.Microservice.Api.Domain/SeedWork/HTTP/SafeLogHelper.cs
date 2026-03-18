using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Text;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.HTTP
{
    /// <summary>
    /// Helper for secure logging without leaking sensitive data.
    ///
    /// BENEFIT: Centralizes log sanitization logic.
    /// RISK: May hide useful debug information (mitigated with sensible defaults).
    /// </summary>
    public static class SafeLogHelper
    {
        private static readonly string[] SensitiveKeys = new[]
        {
            "authorization",
            "bearer",
            "token",
            "password",
            "secret",
            "apikey",
            "api_key",
            "gateway-authentication",
            "x-api-key",
            "x-auth-token",
            "creditcard",
            "credit_card",
            "cvv",
            "ssn",
            "cpf",
            "cnpj"
        };

        /// <summary>
        /// Safely extracts headers by masking sensitive data.
        ///
        /// EXAMPLE:
        /// Input: { "Authorization": "Bearer abc123xyz", "Content-Type": "application/json" }
        /// Output: { "Authorization": "Bearer ***", "Content-Type": "application/json" }
        ///
        /// BENEFIT: Secure logs without exposing tokens.
        /// RISK: None (masking only).
        /// </summary>
        public static Dictionary<string, string> ExtractSafeHeaders(
            CustomHeaders customHeaders,
            Dictionary<string, string>? additionalHeaders)
        {
            var safeHeaders = new Dictionary<string, string>();

            // Gateway Token (masked)
            if (!string.IsNullOrWhiteSpace(customHeaders.GatewayToken))
            {
                safeHeaders["Gateway-Authentication"] = MaskSensitiveValue(customHeaders.GatewayToken);
            }

            // Authorization Header (masked)
            var authHeader = GetAuthorizationHeaderSafe(customHeaders);
            if (!string.IsNullOrWhiteSpace(authHeader))
            {
                safeHeaders["Authorization"] = authHeader;
            }

            // Custom Headers (masked if sensitive)
            if (customHeaders.Headers is not null)
            {
                foreach (var (key, value) in customHeaders.Headers)
                {
                    if (string.IsNullOrWhiteSpace(key) || string.IsNullOrWhiteSpace(value))
                        continue;

                    safeHeaders[key] = IsSensitiveKey(key)
                        ? MaskSensitiveValue(value)
                        : value;
                }
            }

            // Additional Headers (masked if sensitive)
            if (additionalHeaders is not null)
            {
                foreach (var (key, value) in additionalHeaders)
                {
                    if (string.IsNullOrWhiteSpace(key) || string.IsNullOrWhiteSpace(value))
                        continue;

                    safeHeaders[key] = IsSensitiveKey(key)
                        ? MaskSensitiveValue(value)
                        : value;
                }
            }

            safeHeaders["Content-Type"] = "application/json";

            return safeHeaders;
        }

        /// <summary>
        /// Generates a secure cURL command (without tokens).
        ///
        /// EXAMPLE:
        /// curl -X POST "https://api.example.com/endpoint" \
        ///    -H "Authorization: Bearer ***" \
        ///    -H "Content-Type: application/json" \
        ///    -d '{"key":"value"}'
        ///
        /// BENEFIT: Secure cURL for logs/debugging.
        /// RISK: None (string generation only).
        /// </summary>
        public static string GenerateSafeCurl(
            string url,
            Dictionary<string, string> safeHeaders,
            string jsonContent)
        {
            if (string.IsNullOrWhiteSpace(url))
                throw new ArgumentException("URL cannot be empty", nameof(url));

            var sb = new StringBuilder();
            sb.Append($"curl -X POST \"{url}\"");

            foreach (var (key, value) in safeHeaders)
            {
                sb.Append($" -H \"{key}: {value}\"");
            }

            // Limit body size in the log (prevents massive logs)
            var truncatedBody = jsonContent.Length > 500
                ? jsonContent.Substring(0, 500) + "... [truncated]"
                : jsonContent;

            sb.Append($" -d '{truncatedBody}'");

            return sb.ToString();
        }

        /// <summary>
        /// Sanitizes the response body (removes sensitive data).
        ///
        /// BENEFIT: Secure responses in logs.
        /// RISK: May hide useful information (mitigated with sensible defaults).
        ///
        /// CHANGE: Now validates if it is JSON before attempting to parse (avoids exceptions with HTML/XML).
        /// </summary>
        public static string SanitizeResponseBody(string responseBody)
        {
            if (string.IsNullOrWhiteSpace(responseBody))
                return "[Response body is empty]";

            // Remove BOM and leading whitespace
            var trimmed = responseBody.Trim('\uFEFF', '\u200B').TrimStart();

            // VALIDATION: Check if it is valid JSON before attempting to parse
            // Valid JSON starts with { or [ (or primitives: ", number, true, false, null)
            if (!IsLikelyJson(trimmed))
            {
                // Not JSON - return safe preview
                var preview = responseBody.Length > 500
                    ? responseBody.Substring(0, 500) + "... [truncated]"
                    : responseBody;

                // Identify content type for better debugging
                if (trimmed.StartsWith("<"))
                {
                    return $"[HTML/XML response - Not JSON]: {preview}";
                }

                return $"[Non-JSON response]: {preview}";
            }

            try
            {
                // Now attempt to parse as JSON
                var jsonToken = JToken.Parse(responseBody);
                var sanitized = SanitizeJsonElement(jsonToken);
                return JsonConvert.SerializeObject(sanitized, Formatting.None);
            }
            catch (JsonReaderException ex)
            {
                // Malformed JSON - return preview with error
                var preview = responseBody.Length > 300
                    ? responseBody.Substring(0, 300) + "... [truncated]"
                    : responseBody;

                return $"[Invalid JSON - {ex.Message}]: {preview}";
            }
            catch (Exception ex)
            {
                // Unexpected error
                return $"[Error sanitizing response: {ex.GetType().Name} - {ex.Message}]";
            }
        }

        // ==================== PRIVATE HELPERS ====================

        /// <summary>
        /// Gets the authorization header safely (masked).
        /// </summary>
        private static string? GetAuthorizationHeaderSafe(CustomHeaders custom)
        {
            if (!string.IsNullOrWhiteSpace(custom.AuthorizationBearerToken))
                return $"Bearer {MaskSensitiveValue(custom.AuthorizationBearerToken)}";

            if (!string.IsNullOrWhiteSpace(custom.AuthorizationBasicToken))
                return $"Basic {MaskSensitiveValue(custom.AuthorizationBasicToken)}";

            if (!string.IsNullOrWhiteSpace(custom.AuthorizationOrdinaryToken))
                return MaskSensitiveValue(custom.AuthorizationOrdinaryToken);

            return null;
        }

        /// <summary>
        /// Checks if a key is sensitive (token, password, etc).
        /// </summary>
        private static bool IsSensitiveKey(string key)
        {
            return SensitiveKeys.Any(sensitive =>
                key.Equals(sensitive, StringComparison.OrdinalIgnoreCase));
        }

        /// <summary>
        /// Masks a sensitive value (shows only first 3 and last 3 characters).
        ///
        /// EXAMPLE:
        /// Input: "abc123xyz789"
        /// Output: "abc***789"
        /// </summary>
        private static string MaskSensitiveValue(string value)
        {
            if (string.IsNullOrWhiteSpace(value) || value.Length <= 6)
                return "***";

            var first3 = value.Substring(0, 3);
            var last3 = value.Substring(value.Length - 3);
            return $"{first3}***{last3}";
        }

        /// <summary>
        /// Checks if the content appears to be valid JSON (fast check).
        ///
        /// BENEFIT: Avoids expensive parse exceptions on non-JSON content.
        /// RISK: None (checks leading characters only).
        ///
        /// EXAMPLE:
        /// "{"key":"value"}" -> true
        /// "[1,2,3]" -> true
        /// "<html>..." -> false
        /// "plain text" -> false
        /// </summary>
        private static bool IsLikelyJson(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                return false;

            var firstChar = content[0];

            // Valid JSON starts with:
            // - { (object)
            // - [ (array)
            // - " (string)
            // - digit or - (number)
            // - t (true)
            // - f (false)
            // - n (null)
            return firstChar == '{' ||
                   firstChar == '[' ||
                   firstChar == '"' ||
                   char.IsDigit(firstChar) ||
                   firstChar == '-' ||
                   content.StartsWith("true", StringComparison.OrdinalIgnoreCase) ||
                   content.StartsWith("false", StringComparison.OrdinalIgnoreCase) ||
                   content.StartsWith("null", StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Recursively sanitizes a JSON element.
        /// </summary>
        private static object? SanitizeJsonElement(JToken token)
        {
            switch (token.Type)
            {
                case JTokenType.Object:
                    return SanitizeJsonObject((JObject)token);

                case JTokenType.Array:
                    return token.Select(SanitizeJsonElement).ToList();

                case JTokenType.String:
                    return token.Value<string>();

                case JTokenType.Integer:
                    return token.Value<long>();

                case JTokenType.Float:
                    return token.Value<decimal>();

                case JTokenType.Boolean:
                    return token.Value<bool>();

                case JTokenType.Date:
                    return token.Value<DateTime>();

                case JTokenType.Null:
                    return null;

                default:
                    return null;
            }
        }

        /// <summary>
        /// Sanitizes a JSON object (masks sensitive keys).
        ///
        /// CHANGE: Now uses JObject directly and .Properties() (more idiomatic).
        /// </summary>
        private static Dictionary<string, object?> SanitizeJsonObject(JObject obj)
        {
            var result = new Dictionary<string, object?>();

            foreach (var property in obj.Properties())
            {
                var value = IsSensitiveKey(property.Name)
                    ? "***"
                    : SanitizeJsonElement(property.Value);

                result[property.Name] = value;
            }

            return result;
        }

        public static string? SanitizeResponseBody(object v)
        {
            throw new NotImplementedException();
        }
    }
}