using MongoDB.Driver;
using backend_dotnet.Models;

namespace backend_dotnet.Services;

public class MongoService
{
    private readonly IMongoCollection<AiQueryLog> _collection;
    private readonly IMongoCollection<AnalysisExperiment> _experimentCollection;

    public MongoService()
    {
        var client = new MongoClient("mongodb://localhost:27017");
        var database = client.GetDatabase("sinewave_ai");
        _collection = database.GetCollection<AiQueryLog>("ai_queries");
        
        // Added collection for AI Analysis Experiments
        _experimentCollection = database.GetCollection<AnalysisExperiment>("ai_experiments");
    }

    public async Task SaveAsync(AiQueryLog log)
    {
        await _collection.InsertOneAsync(log);
    }

    // New: Save full experimental data and analysis
    public async Task SaveExperimentAsync(AnalysisExperiment experiment)
    {
        await _experimentCollection.InsertOneAsync(experiment);
    }
}