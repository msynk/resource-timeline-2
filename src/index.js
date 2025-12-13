/**
 * Data Generator for Resource Timeline
 * Handles generation of sample data for the timeline visualization
 */

class DataGenerator {
    /**
     * Generate sample resources
     * @param {Array<string>} resourceNames - Optional array of resource names
     * @returns {Array<{id: string, name: string}>} Array of resource objects
     */
    static generateResources(resourceNames = null) {
        const defaultNames = [
            'Server-01', 'Server-02', 'Server-03', 'Server-04', 'Server-05',
            'Database-01', 'Database-02', 'Database-03',
            'Cache-01', 'Cache-02',
            'Worker-01', 'Worker-02', 'Worker-03', 'Worker-04',
            'API-Gateway', 'Load-Balancer-01', 'Load-Balancer-02',
            'Server-01', 'Server-02', 'Server-03', 'Server-04', 'Server-05',
            'Database-01', 'Database-02', 'Database-03',
            'Cache-01', 'Cache-02',
            'Worker-01', 'Worker-02', 'Worker-03', 'Worker-04',
            'API-Gateway', 'Load-Balancer-01', 'Load-Balancer-02'
        ];
        
        const names = resourceNames || defaultNames;
        
        return names.map((name, index) => ({
            id: `res-${index + 1}`,
            name: name
        }));
    }
    
    /**
     * Generate time range for the timeline
     * @param {number} days - Number of days to generate (default: 10)
     * @param {Date} endDate - End date (default: current date)
     * @returns {{start: number, end: number}} Time range object with timestamps
     */
    static generateTimeRange(days = 10, endDate = null) {
        const now = endDate || new Date();
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        
        return {
            start: startDate.getTime(),
            end: end.getTime()
        };
    }
    
    /**
     * Generate consumption data for resources
     * @param {Array<{id: string, name: string}>} resources - Array of resources
     * @param {{start: number, end: number}} timeRange - Time range object
     * @param {Object} options - Generation options
     * @param {number} options.minConsumptionsPerDay - Minimum consumptions per day (default: 3)
     * @param {number} options.maxConsumptionsPerDay - Maximum consumptions per day (default: 8)
     * @param {number} options.minDuration - Minimum duration in milliseconds (default: 30 minutes)
     * @param {number} options.maxDuration - Maximum duration in milliseconds (default: 4 hours)
     * @returns {Array<{id: string, resourceId: string, startTime: number, endTime: number}>} Array of consumption objects
     */
    static generateConsumptions(resources, timeRange, options = {}) {
        const {
            minConsumptionsPerDay = 3,
            maxConsumptionsPerDay = 8,
            minDuration = 30 * 60 * 1000, // 30 minutes
            maxDuration = 4 * 60 * 60 * 1000 // 4 hours
        } = options;
        
        const consumptions = [];
        const timeSpan = timeRange.end - timeRange.start;
        const days = Math.ceil(timeSpan / (24 * 60 * 60 * 1000));
        
        resources.forEach(resource => {
            // Each resource gets random number of consumptions per day
            const consumptionsPerDay = minConsumptionsPerDay + 
                Math.floor(Math.random() * (maxConsumptionsPerDay - minConsumptionsPerDay + 1));
            const totalConsumptions = consumptionsPerDay * days;
            
            for (let i = 0; i < totalConsumptions; i++) {
                const startTime = timeRange.start + Math.random() * (timeSpan - maxDuration);
                const duration = minDuration + Math.random() * (maxDuration - minDuration);
                const endTime = startTime + duration;
                
                if (endTime <= timeRange.end) {
                    consumptions.push({
                        id: `cons-${resource.id}-${i}`,
                        resourceId: resource.id,
                        startTime: startTime,
                        endTime: endTime
                    });
                }
            }
        });
        
        // Sort consumptions by start time for better rendering performance
        consumptions.sort((a, b) => a.startTime - b.startTime);
        
        return consumptions;
    }
    
    /**
     * Generate all sample data at once
     * @param {Object} options - Generation options
     * @param {number} options.days - Number of days (default: 10)
     * @param {Array<string>} options.resourceNames - Optional resource names
     * @param {Object} options.consumptionOptions - Options for consumption generation
     * @returns {{resources: Array, timeRange: Object, consumptions: Array}} Complete dataset
     */
    static generateSampleData(options = {}) {
        const {
            days = 100,
            resourceNames = null,
            consumptionOptions = {}
        } = options;
        
        const resources = this.generateResources(resourceNames);
        const timeRange = this.generateTimeRange(days);
        const consumptions = this.generateConsumptions(resources, timeRange, consumptionOptions);
        
        return {
            resources,
            timeRange,
            consumptions
        };
    }
}

// Initialize the timeline when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const timeline = new ResourceTimeline('timelineCanvas');
    
    // Generate and load sample data
    const sampleData = DataGenerator.generateSampleData({ days: 100 });
    
    // Set data in the correct order to trigger canvas resize only once
    timeline.setResources(sampleData.resources);
    timeline.setTimeRange(sampleData.timeRange.start, sampleData.timeRange.end);
    
    // Wait for canvas to be resized before setting consumptions
    requestAnimationFrame(() => {
        timeline.setConsumptions(sampleData.consumptions);
    });
    
    // Make timeline accessible globally for debugging
    window.timeline = timeline;
});
