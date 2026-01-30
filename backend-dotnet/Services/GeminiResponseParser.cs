using Newtonsoft.Json.Linq;

namespace backend_dotnet.Services;

public static class GeminiResponseParser
{
    public static string ExtractText(string json)
    {
        try
        {
            var obj = JObject.Parse(json);
            var parts = obj["candidates"]?[0]?["content"]?["parts"];
            
            if (parts != null)
            {
                foreach (var part in parts)
                {
                    if (part["text"] != null) return part["text"].ToString();
                }
            }
            return "No text found in AI response.";
        }
        catch
        {
            return "Failed to parse Gemini response";
        }
    }
}