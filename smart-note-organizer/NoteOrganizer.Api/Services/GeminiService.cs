using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace NoteOrganizer.Api.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GeminiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"] ?? throw new ArgumentNullException("Gemini:ApiKey not configured.");
        }

        public async Task<string> GenerateNoteFromTextAsync(string rawText)
        {
            var prompt = $@"
                Transforme este conteúdo em uma estrutura de notas organizada, com títulos, subtítulos e listas, 
                formatada em JSON compatível com o Editor.js. 
                
                Instruções cruciais:
                1. Use os tipos de blocos: 'header' (com 'level'), 'paragraph', 'list' (com 'style': 'ordered' ou 'unordered' e 'items': string[]).
                2. Gere um 'title' amigável baseado no conteúdo.
                3. Responda APENAS com um objeto JSON puro, sem blocos de código markdown ou explicações.
                
                Estrutura esperada:
                {{
                    ""title"": ""Título sugerido"",
                    ""editorData"": {{
                        ""time"": {DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()},
                        ""blocks"": [...],
                        ""version"": ""2.30.7""
                    }}
                }}

                Conteúdo bruto:
                {rawText}";

            var requestBody = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = prompt } } }
                }
            };

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={_apiKey}";
            
            var response = await _httpClient.PostAsJsonAsync(url, requestBody);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<JsonElement>();
            var generatedText = result.GetProperty("candidates")[0]
                                     .GetProperty("content")
                                     .GetProperty("parts")[0]
                                     .GetProperty("text")
                                     .GetString();

            return generatedText ?? "{}";
        }
    }
}
