# Resource Timeline 2 - Blazor WebAssembly

This is a Blazor WebAssembly implementation of the Resource Timeline visualization component. It provides a canvas-based timeline view for monitoring resource consumption over time.

## Features

- **Interactive Timeline**: Canvas-based rendering with smooth scrolling
- **Resource Visualization**: View multiple resources (servers, databases, caches, workers, etc.)
- **Time-based View**: Hourly time markers with 1-day-per-viewport-width scaling
- **Consumption Bars**: Visual representation of resource usage periods
- **Sticky Axes**: Time axis (horizontal) and resource names (vertical) stay fixed while scrolling
- **Selection**: Click on consumption bars to select them
- **Performance Optimized**: Viewport culling for efficient rendering of large datasets
- **Sample Data Generator**: Built-in data generator for testing with 100 days of sample data

## Technology Stack

- **.NET 10**: Latest version of .NET
- **Blazor WebAssembly**: Client-side web UI framework
- **HTML5 Canvas**: High-performance rendering
- **JavaScript Interop**: Bridge between C# and JavaScript for canvas operations

## Project Structure

```
blazor/
├── Components/
│   ├── ResourceTimeline.razor          # Main timeline component
│   └── ResourceTimeline.razor.css      # Component styles
├── Models/
│   ├── Resource.cs                     # Resource data model
│   ├── Consumption.cs                  # Consumption data model
│   └── TimelineData.cs                 # Timeline data container
├── Services/
│   └── DataGenerator.cs                # Sample data generator
├── Pages/
│   └── Home.razor                      # Home page with timeline
├── wwwroot/
│   ├── js/
│   │   └── timeline.js                 # Canvas rendering logic
│   └── css/
│       └── app.css                     # Global styles
└── Program.cs                          # Application entry point
```

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) or later

### Running the Application

1. Navigate to the project directory:
   ```bash
   cd src/blazor
   ```

2. Run the application:
   ```bash
   dotnet run
   ```

3. Open your browser and navigate to the URL shown in the console (typically `https://localhost:5001` or `http://localhost:5000`)

### Building for Production

```bash
dotnet publish -c Release
```

The output will be in `bin/Release/net10.0/publish/wwwroot/`

## How It Works

### Data Flow

1. **Data Generation**: The `DataGenerator` service creates sample resources and consumption data
2. **Component Initialization**: The `ResourceTimeline` component loads in the Home page
3. **JavaScript Interop**: The component communicates with JavaScript to render on HTML5 Canvas
4. **Canvas Rendering**: The `timeline.js` module handles all rendering logic with viewport culling
5. **User Interaction**: Mouse clicks and scrolling are handled by the JavaScript module

### Key Components

#### ResourceTimeline.razor
The main Blazor component that:
- Accepts Resources, TimeRange, and Consumptions as parameters
- Creates JavaScript interop references
- Manages the component lifecycle

#### timeline.js
The JavaScript module that:
- Manages the canvas element and rendering context
- Implements viewport-based rendering for performance
- Handles scrolling, clicking, and selection
- Draws time axis, resource axis, grid lines, and consumption bars

#### DataGenerator
A C# service that:
- Generates sample resources (servers, databases, etc.)
- Creates time ranges based on days
- Generates realistic consumption patterns with gaps and durations

## Configuration

The timeline can be configured by modifying the `config` object in `timeline.js`:

```javascript
this.config = {
    resourceHeight: 40,        // Height of each resource row
    timeAxisHeight: 60,        // Height of time axis
    resourceAxisWidth: 150,    // Width of resource names column
    barHeight: 4,              // Height of consumption bars
    barSpacing: 2,             // Spacing between bars
    minBarWidth: 2,            // Minimum bar width in pixels
    padding: { top: 10, right: 20, bottom: 10, left: 10 }
};
```

## Customization

### Changing Sample Data

Modify the `Home.razor` to adjust the number of days:

```csharp
timelineData = DataGenerator.GenerateSampleData(days: 100);
```

### Custom Resources

Provide custom resource names to the data generator:

```csharp
var customNames = new[] { "Custom-1", "Custom-2", "Custom-3" };
var resources = DataGenerator.GenerateResources(customNames);
```

### Styling

- **Component styles**: Edit `Components/ResourceTimeline.razor.css`
- **Global styles**: Edit `wwwroot/css/app.css`
- **Canvas colors**: Modify color values in `wwwroot/js/timeline.js`

## Performance

The timeline is optimized for large datasets:
- **Viewport culling**: Only renders visible resources and time ranges
- **RequestAnimationFrame**: Smooth rendering with browser optimization
- **Event throttling**: Scroll events are throttled using RAF
- **Efficient data structures**: Consumptions grouped by resource for fast lookup

Tested with:
- 68 resources
- 100 days of data
- ~40,000+ consumption records

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires HTML5 Canvas and ES6 module support.

## License

Same license as the parent project (see root LICENSE file).

## Original JavaScript Implementation

This is a port of the original JavaScript implementation located in `src/`. The functionality and visual design have been preserved while adapting to the Blazor component model and C# language features.
