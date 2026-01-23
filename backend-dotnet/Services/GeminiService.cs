using System.Text;
using Newtonsoft.Json;

namespace backend_dotnet.Services;

public class GeminiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public GeminiService(IConfiguration config)
    {
        _httpClient = new HttpClient();
        _apiKey = config["Gemini:ApiKey"]
            ?? throw new Exception("Gemini API key missing in configuration");
    }

    public async Task<string> Ask(string prompt)
    {
        var url =
          $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";

        var body = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
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
            throw new Exception($"Gemini API error: {json}");
        }

        return json;
    }
}
