using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend_dotnet.Models;

public class AiQueryLog
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public int CalculationId { get; set; }

    public string Question { get; set; } = "";
    public string Answer { get; set; } = "";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
