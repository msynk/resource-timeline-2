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
