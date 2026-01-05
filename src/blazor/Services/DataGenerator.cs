using blazor.Models;

namespace blazor.Services;

public class DataGenerator
{
    private static readonly string[] DefaultResourceNames = 
    [
        "Server-01", "Server-02", "Server-03", "Server-04", "Server-05",
        "Server-06", "Server-07", "Server-08", "Server-09", "Server-10",
        "Server-11", "Server-12", "Server-13", "Server-14", "Server-15",
        "Server-16", "Server-17", "Server-18", "Server-19", "Server-20",
        "Database-01", "Database-02", "Database-03", "Database-04",
        "Database-05", "Database-06", "Database-07", "Database-08",
        "Database-09", "Database-10", "Database-11", "Database-12",
        "Cache-01", "Cache-02", "Cache-03", "Cache-04",
        "Cache-05", "Cache-06", "Cache-07", "Cache-08",
        "Worker-01", "Worker-02", "Worker-03", "Worker-04",
        "Worker-05", "Worker-06", "Worker-07", "Worker-08",
        "Worker-09", "Worker-10", "Worker-11", "Worker-12",
        "Worker-13", "Worker-14", "Worker-15", "Worker-16",
        "API-Gateway-01", "API-Gateway-02", "API-Gateway-03", "API-Gateway-04",
        "Load-Balancer-01", "Load-Balancer-02", "Load-Balancer-03", "Load-Balancer-04",
        "Load-Balancer-05", "Load-Balancer-06", "Load-Balancer-07", "Load-Balancer-08"
    ];

    public static List<Resource> GenerateResources(string[]? resourceNames = null)
    {
        var names = resourceNames ?? DefaultResourceNames;
        return names.Select((name, index) => new Resource
        {
            Id = $"res-{index + 1}",
            Name = name
        }).ToList();
    }

    public static TimeRange GenerateTimeRange(int days, DateTime? endDate = null)
    {
        var now = endDate ?? DateTime.Now;
        var start = now.AddDays(-days).Date;
        var end = now.Date.AddHours(23).AddMinutes(59).AddSeconds(59).AddMilliseconds(999);

        return new TimeRange
        {
            Start = new DateTimeOffset(start).ToUnixTimeMilliseconds(),
            End = new DateTimeOffset(end).ToUnixTimeMilliseconds()
        };
    }

    public static List<Consumption> GenerateConsumptions(
        List<Resource> resources,
        TimeRange timeRange,
        int minConsumptionsPerDay = 3,
        int maxConsumptionsPerDay = 8,
        long minDuration = 30 * 60 * 1000,
        long maxDuration = 4 * 60 * 60 * 1000,
        long minGap = 15 * 60 * 1000)
    {
        var consumptions = new List<Consumption>();
        var random = new Random();
        var timeSpan = timeRange.End - timeRange.Start;
        var days = (int)Math.Ceiling(timeSpan / (24.0 * 60 * 60 * 1000));

        foreach (var resource in resources)
        {
            var consumptionsPerDay = minConsumptionsPerDay +
                random.Next(maxConsumptionsPerDay - minConsumptionsPerDay + 1);
            var totalConsumptions = consumptionsPerDay * days;

            var avgDuration = (minDuration + maxDuration) / 2.0;
            var slotSize = timeSpan / (double)totalConsumptions;
            var maxSlotUsage = Math.Min(slotSize * 0.7, avgDuration);
            var lastEndTime = timeRange.Start;

            for (int i = 0; i < totalConsumptions; i++)
            {
                var slotStart = (long)(timeRange.Start + i * slotSize);
                var slotEnd = (long)(slotStart + slotSize);
                var minStart = Math.Max(slotStart, lastEndTime + minGap);
                var maxStart = Math.Min(slotEnd - minDuration - minGap, timeRange.End - minDuration);

                if (maxStart > minStart)
                {
                    var duration = (long)(minDuration + random.NextDouble() *
                        Math.Min(maxDuration - minDuration, maxSlotUsage - minDuration));
                    var startTime = (long)(minStart + random.NextDouble() *
                        Math.Max(0, maxStart - minStart - duration));
                    var endTime = startTime + duration;

                    if (endTime <= timeRange.End)
                    {
                        consumptions.Add(new Consumption
                        {
                            Id = $"cons-{resource.Id}-{i}",
                            ResourceId = resource.Id,
                            StartTime = startTime,
                            EndTime = endTime
                        });
                        lastEndTime = endTime;
                    }
                }
            }
        }

        return consumptions.OrderBy(c => c.StartTime).ToList();
    }

    public static TimelineData GenerateSampleData(
        int days = 100,
        string[]? resourceNames = null)
    {
        var resources = GenerateResources(resourceNames);
        var timeRange = GenerateTimeRange(days);
        var consumptions = GenerateConsumptions(resources, timeRange);

        return new TimelineData
        {
            Resources = resources,
            TimeRange = timeRange,
            Consumptions = consumptions
        };
    }
}
