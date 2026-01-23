namespace backend_dotnet.Models;

public class SineCalculation
{
    public int Id { get; set; }

    public double Amplitude { get; set; }   // A
    public double Omega { get; set; }        // ω
    public double Phase { get; set; }        // φ
    public double Time { get; set; }         // t

    public double YValue { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
