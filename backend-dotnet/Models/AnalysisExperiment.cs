using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend_dotnet.Models;

public class AnalysisExperiment
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public List<ObservationPoint> DataPoints { get; set; } = new();
    public string AiAnalysisResult { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}