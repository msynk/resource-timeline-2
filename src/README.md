# Resource Timeline Web App

A high-performance resource timeline visualization built with vanilla JavaScript and HTML5 Canvas.

## Features

- **Sticky Axes**: Time axis (X-axis) at the top and Resource axis (Y-axis) on the left remain fixed while scrolling
- **Interactive Bars**: Click on consumption bars to select them (only one can be selected at a time)
- **Performance Optimized**: 
  - Only renders visible time range and resources
  - Uses requestAnimationFrame for smooth rendering
  - Efficient filtering and grouping of data
- **Random Data Generation**: Automatically generates 10+ days of sample data with multiple resources

## Usage

Simply open `index.html` in a web browser. The app will automatically:
- Generate 17 sample resources
- Create 10 days of consumption data (3-8 consumptions per resource per day)
- Display the timeline with scrollable content

## File Structure

- `index.html` - Main HTML file
- `styles.css` - Styling for the timeline
- `app.js` - Core timeline rendering logic (ResourceTimeline class)
- `data-generator.js` - Data preparation and generation utilities (DataGenerator class)

## Data Structure

### Resources
```javascript
{
    id: 'res-1',
    name: 'Server-01'
}
```

### Consumptions
```javascript
{
    id: 'cons-res-1-0',
    resourceId: 'res-1',
    startTime: 1234567890000, // timestamp in milliseconds
    endTime: 1234567890000    // timestamp in milliseconds
}
```

## API

### Timeline API

The timeline instance is available globally as `window.timeline`:

```javascript
// Set resources
timeline.setResources([
    { id: 'res-1', name: 'Resource 1' },
    { id: 'res-2', name: 'Resource 2' }
]);

// Set time range
const start = new Date('2024-01-01').getTime();
const end = new Date('2024-01-11').getTime();
timeline.setTimeRange(start, end);

// Set consumptions
timeline.setConsumptions([
    {
        id: 'cons-1',
        resourceId: 'res-1',
        startTime: start,
        endTime: start + 3600000 // 1 hour
    }
]);

// Get selected bar
const selected = timeline.getSelectedBar();
```

### Data Generator API

The `DataGenerator` class provides utilities for generating sample data:

```javascript
// Generate all sample data at once
const data = DataGenerator.generateSampleData({
    days: 10,
    resourceNames: ['Server-01', 'Server-02'], // optional
    consumptionOptions: {
        minConsumptionsPerDay: 3,
        maxConsumptionsPerDay: 8,
        minDuration: 30 * 60 * 1000, // 30 minutes
        maxDuration: 4 * 60 * 60 * 1000 // 4 hours
    }
});

// Or generate components separately
const resources = DataGenerator.generateResources();
const timeRange = DataGenerator.generateTimeRange(10);
const consumptions = DataGenerator.generateConsumptions(resources, timeRange);
```

## Configuration

You can modify the appearance by editing the `config` object in `app.js`:

- `resourceHeight`: Height of each resource row (default: 40px)
- `timeAxisHeight`: Height of the time axis (default: 60px)
- `resourceAxisWidth`: Width of the resource axis (default: 150px)
- `barHeight`: Height of consumption bars (default: 4px)
- `minBarWidth`: Minimum width for bars (default: 2px)
