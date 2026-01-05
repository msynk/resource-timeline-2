namespace blazor.Models;

public class TimelineData
{
    public required List<Resource> Resources { get; set; }
    public required TimeRange TimeRange { get; set; }
    public required List<Consumption> Consumptions { get; set; }
}

public class TimeRange
{
    public long Start { get; set; }
    public long End { get; set; }
}
