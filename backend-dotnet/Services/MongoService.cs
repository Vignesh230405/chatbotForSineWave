using MongoDB.Driver;
using backend_dotnet.Models;

namespace backend_dotnet.Services;

public class MongoService
{
    private readonly IMongoCollection<AiQueryLog> _collection;

    public MongoService()
    {
        var client = new MongoClient("mongodb://localhost:27017");
        var database = client.GetDatabase("sinewave_ai");
        _collection = database.GetCollection<AiQueryLog>("ai_queries");
    }

    public async Task SaveAsync(AiQueryLog log)
    {
        await _collection.InsertOneAsync(log);
    }
}
