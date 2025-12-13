class DataGenerator {
    static generateResources(resourceNames = null) {
        const defaultNames = [
            'Server-01', 'Server-02', 'Server-03', 'Server-04', 'Server-05',
            'Server-06', 'Server-07', 'Server-08', 'Server-09', 'Server-10',
            'Server-11', 'Server-12', 'Server-13', 'Server-14', 'Server-15',
            'Server-16', 'Server-17', 'Server-18', 'Server-19', 'Server-20',
            'Database-01', 'Database-02', 'Database-03', 'Database-04',
            'Database-05', 'Database-06', 'Database-07', 'Database-08',
            'Database-09', 'Database-10', 'Database-11', 'Database-12',
            'Cache-01', 'Cache-02', 'Cache-03', 'Cache-04',
            'Cache-05', 'Cache-06', 'Cache-07', 'Cache-08',
            'Worker-01', 'Worker-02', 'Worker-03', 'Worker-04',
            'Worker-05', 'Worker-06', 'Worker-07', 'Worker-08',
            'Worker-09', 'Worker-10', 'Worker-11', 'Worker-12',
            'Worker-13', 'Worker-14', 'Worker-15', 'Worker-16',
            'API-Gateway-01', 'API-Gateway-02', 'API-Gateway-03', 'API-Gateway-04',
            'Load-Balancer-01', 'Load-Balancer-02', 'Load-Balancer-03', 'Load-Balancer-04',
            'Load-Balancer-05', 'Load-Balancer-06', 'Load-Balancer-07', 'Load-Balancer-08'
        ];
        
        return (resourceNames || defaultNames).map((name, index) => ({
            id: `res-${index + 1}`,
            name
        }));
    }
    
    static generateTimeRange(days, endDate = null) {
        const now = endDate || new Date();
        const start = new Date(now);
        start.setDate(start.getDate() - days);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        
        return {
            start: start.getTime(),
            end: end.getTime()
        };
    }
    
    static generateConsumptions(resources, timeRange, options = {}) {
        const {
            minConsumptionsPerDay = 3,
            maxConsumptionsPerDay = 8,
            minDuration = 30 * 60 * 1000,
            maxDuration = 4 * 60 * 60 * 1000,
            minGap = 15 * 60 * 1000
        } = options;
        
        const consumptions = [];
        const timeSpan = timeRange.end - timeRange.start;
        const days = Math.ceil(timeSpan / (24 * 60 * 60 * 1000));
        
        resources.forEach(resource => {
            const consumptionsPerDay = minConsumptionsPerDay + 
                Math.floor(Math.random() * (maxConsumptionsPerDay - minConsumptionsPerDay + 1));
            const totalConsumptions = consumptionsPerDay * days;
            
            const avgDuration = (minDuration + maxDuration) / 2;
            const slotSize = timeSpan / totalConsumptions;
            const maxSlotUsage = Math.min(slotSize * 0.7, avgDuration);
            let lastEndTime = timeRange.start;
            
            for (let i = 0; i < totalConsumptions; i++) {
                const slotStart = timeRange.start + i * slotSize;
                const slotEnd = slotStart + slotSize;
                const minStart = Math.max(slotStart, lastEndTime + minGap);
                const maxStart = Math.min(slotEnd - minDuration - minGap, timeRange.end - minDuration);
                
                if (maxStart > minStart) {
                    const duration = minDuration + Math.random() * Math.min(maxDuration - minDuration, maxSlotUsage - minDuration);
                    const startTime = minStart + Math.random() * Math.max(0, maxStart - minStart - duration);
                    const endTime = startTime + duration;
                    
                    if (endTime <= timeRange.end) {
                        consumptions.push({
                            id: `cons-${resource.id}-${i}`,
                            resourceId: resource.id,
                            startTime,
                            endTime
                        });
                        lastEndTime = endTime;
                    }
                }
            }
        });
        
        consumptions.sort((a, b) => a.startTime - b.startTime);
        
        return consumptions;
    }
    
    static generateSampleData(options = {}) {
        const {
            days = 1000,
            resourceNames = null,
            consumptionOptions = {}
        } = options;
        
        const resources = this.generateResources(resourceNames);
        const timeRange = this.generateTimeRange(days);
        const consumptions = this.generateConsumptions(resources, timeRange, consumptionOptions);
        
        return { resources, timeRange, consumptions };
    }
}