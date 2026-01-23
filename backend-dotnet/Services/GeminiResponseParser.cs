using Newtonsoft.Json.Linq;

namespace backend_dotnet.Services;

public static class GeminiResponseParser
{
    public static string ExtractText(string json)
    {
        try
        {
            var obj = JObject.Parse(json);
            return obj["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.ToString()
                   ?? "No response from Gemini";
        }
        catch
        {
            return "Failed to parse Gemini response";
        }
    }
}
