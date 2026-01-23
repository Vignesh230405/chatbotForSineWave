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

    public SineController(
        AppDbContext db,
        GeminiService gemini,
        MongoService mongo)
    {
        _db = db;
        _gemini = gemini;
        _mongo = mongo;
    }

    // -------------------------
    // 1️⃣ SINE CALCULATION
    // -------------------------
    [HttpPost("calculate")]
    public async Task<IActionResult> Calculate(SineCalculation input)
    {
        input.YValue =
            input.Amplitude *
            Math.Sin(input.Omega * input.Time + input.Phase);

        _db.SineCalculations.Add(input);
        await _db.SaveChangesAsync();

        return Ok(input);
    }

    // -------------------------
    // 2️⃣ FETCH HISTORY
    // -------------------------
    [HttpGet("all")]
    public IActionResult GetAll()
    {
        return Ok(
            _db.SineCalculations
               .OrderByDescending(x => x.CreatedAt)
               .ToList()
        );
    }

    // -------------------------
    // 3️⃣ ASK GEMINI (NEW)
    // -------------------------
    [HttpPost("ask")]
    public async Task<IActionResult> Ask([FromBody] QuestionRequest request)
    {
        var last = _db.SineCalculations
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefault();

        if (last == null)
            return BadRequest("No previous calculation found");

        string prompt = $"""
You are answering questions about a sine wave equation.

Equation:
y = A sin(ωt + φ)

Values:
Amplitude (A) = {last.Amplitude}
Omega (ω) = {last.Omega}
Phase (φ) = {last.Phase}
Time (t) = {last.Time}
Result (y) = {last.YValue}

Rules:
- Answer ONLY using the above values
- Do NOT invent new values
- If the question is unrelated, say so

User question:
{request.Question}
""";

        var rawResponse = await _gemini.Ask(prompt);
        var cleanAnswer = GeminiResponseParser.ExtractText(rawResponse);

        await _mongo.SaveAsync(new AiQueryLog
        {
            CalculationId = last.Id,
            Question = request.Question,
            Answer = cleanAnswer
        });

        return Ok(cleanAnswer);
    }
}
