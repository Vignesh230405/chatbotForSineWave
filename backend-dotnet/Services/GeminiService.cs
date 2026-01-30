using System.Text;
using Newtonsoft.Json;

namespace backend_dotnet.Services;

public class GeminiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public GeminiService(IConfiguration config)
    {
        // Reusing HttpClient is better for performance and prevents socket exhaustion
        _httpClient = new HttpClient();
        _apiKey = config["Gemini:ApiKey"]
            ?? throw new Exception("Gemini API key missing in configuration");
    }

    public async Task<string> Ask(string prompt)
    {
        // 2026 UPDATE: v1beta is necessary for Gemini 3 features
        // Alternative: Stable Gemini 2.5 Flash (Use this if Gemini 3 is overloaded)
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";    

        var body = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            },
           
        };

        var response = await _httpClient.PostAsync(
            url,
            new StringContent(
                JsonConvert.SerializeObject(body), 
                Encoding.UTF8, 
                "application/json"
            )
        );

        var json = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            // This will provide the full error message from Google if something goes wrong
            throw new Exception($"Gemini API error: {json}");
        }

        // Return the raw JSON string to be handled by your separate parsing file
        return json;
    }
}