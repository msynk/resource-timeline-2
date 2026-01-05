namespace blazor.Models;

public class Consumption
{
    public required string Id { get; set; }
    public required string ResourceId { get; set; }
    public long StartTime { get; set; }
    public long EndTime { get; set; }
}
