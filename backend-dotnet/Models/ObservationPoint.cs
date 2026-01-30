namespace backend_dotnet.Models;

public class ObservationPoint
{
    public double T { get; set; } // Time (Independent)
    public double Y { get; set; } // Value (Dependent)
}

public class AnalysisRequest
{
    public List<ObservationPoint> Observations { get; set; } = new();
}