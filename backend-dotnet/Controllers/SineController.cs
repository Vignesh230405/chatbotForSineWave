using Microsoft.AspNetCore.Mvc;
using backend_dotnet.Data;
using backend_dotnet.Models;
using backend_dotnet.Services;

namespace backend_dotnet.Controllers;

[ApiController]
[Route("api/sine")]
public class SineController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly GeminiService _gemini;
    private readonly MongoService _mongo;

    public SineController(AppDbContext db, GeminiService gemini, MongoService mongo)
    {
        _db = db;
        _gemini = gemini;
        _mongo = mongo;
    }

    // 1️⃣ DIRECT CALCULATION (Keep this for the calculator tab)
    [HttpPost("calculate")]
    public async Task<IActionResult> Calculate(SineCalculation input)
    {
        input.YValue = input.Amplitude * Math.Sin(input.Omega * input.Time + input.Phase);
        _db.SineCalculations.Add(input);
        await _db.SaveChangesAsync();
        return Ok(input);
    }

    // 2️⃣ FETCH HISTORY
    [HttpGet("all")]
    public IActionResult GetAll() => Ok(_db.SineCalculations.OrderByDescending(x => x.CreatedAt).ToList());

    // 3️⃣ AI RELATIONSHIP ANALYSIS (FULLY ISOLATED)
    [HttpPost("analyze-relationship")]
    public async Task<IActionResult> AnalyzeRelationship([FromBody] AnalysisRequest request)
    {
        if (request.Observations == null || request.Observations.Count < 2)
            return BadRequest("At least 2 data points are required.");

        // We only use the data passed in from the React table
        var points = string.Join(", ", request.Observations.Select(o => $"({o.T}, {o.Y})"));

        // STRICT PROMPT: No DB context, no "last calculation" variables
        string prompt = $@"
    DATA: [{points}]
    TASK: Fit to y = A * sin(ωt + φ).
    
    INSTRUCTIONS:
    - IGNORE all previous context.
    - Calculate ω as a decimal (e.g., 0.5).
    - Provide NO walkthrough, NO reasoning, and NO introductory text.
    - You MUST start your response with the prefix 'FINAL_RESULT:' 
    
    FORMAT: FINAL_RESULT: A = [val], ω = [val], φ = [val]";
        var rawResponse = await _gemini.Ask(prompt);
        var cleanAnalysis = GeminiResponseParser.ExtractText(rawResponse);

        // Save to MongoDB for experimental history
        await _mongo.SaveExperimentAsync(new AnalysisExperiment
        {
            DataPoints = request.Observations,
            AiAnalysisResult = cleanAnalysis
        });

        return Ok(cleanAnalysis);
    }
}



