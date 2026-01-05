# Getting Started with Resource Timeline Blazor

## Quick Start

### Prerequisites

Install [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)

### Run the Application

**Option 1: Using dotnet CLI**
```bash
cd src/blazor
dotnet run
```

**Option 2: Using run scripts**

Windows:
```cmd
run.bat
```

Linux/Mac:
```bash
chmod +x run.sh
./run.sh
```

**Option 3: Visual Studio**
- Open `blazor.csproj`
- Press F5 to run

**Option 4: VS Code**
- Open the `src/blazor` folder
- Press F5 (uses `.vscode/launch.json`)

### Access the Application

Open your browser to one of these URLs (shown in console):
- HTTPS: `https://localhost:5001`
- HTTP: `http://localhost:5000`

## What You'll See

- A full-screen timeline visualization
- 68 resources listed vertically (servers, databases, caches, workers, etc.)
- 100 days of sample data horizontally
- Consumption bars showing when each resource is in use
- Scrollable in both directions
- Click on bars to select them (highlighted in blue)

## Understanding the Timeline

### Layout

```
┌─────────────┬────────────────────────────────────┐
│ [Empty]     │  00  01  02  03  04  ... (Hours)  │ ← Time Axis (Sticky)
├─────────────┼────────────────────────────────────┤
│ Server-01   │  ▬▬ ▬▬▬ ▬ ▬▬ ▬▬▬                  │
│ Server-02   │    ▬▬▬  ▬▬▬  ▬▬ ▬                  │
│ Database-01 │  ▬ ▬▬▬▬  ▬▬  ▬▬▬▬                  │
│ ...         │                                    │
└─────────────┴────────────────────────────────────┘
  ↑
  Resource Axis (Sticky)
```

### Features

1. **Sticky Axes**: Time and resource labels stay visible while scrolling
2. **Grid Lines**: Visual guides at hourly intervals
3. **Consumption Bars**: Blue bars show resource usage
4. **Selection**: Click a bar to highlight it (darker blue with border)
5. **Scale**: One full day fits in viewport width
6. **Hourly Markers**: Time shown in 24-hour format (00-23)

### Navigation

- **Horizontal Scroll**: Move through time (days/weeks/months)
- **Vertical Scroll**: Browse through resources
- **Mouse Click**: Select consumption bars
- **Console**: Selected bar details logged to browser console (F12)

## Project Structure

```
blazor/
├── Components/              # Reusable Blazor components
│   ├── ResourceTimeline.razor
│   └── ResourceTimeline.razor.css
├── Models/                  # Data models
│   ├── Resource.cs
│   ├── Consumption.cs
│   └── TimelineData.cs
├── Services/                # Business logic
│   └── DataGenerator.cs
├── Pages/                   # Routable pages
│   ├── Home.razor          # Main page (/)
│   └── NotFound.razor      # 404 page
├── Layout/                  # Layout components
│   └── MainLayout.razor
├── wwwroot/                 # Static files
│   ├── js/
│   │   └── timeline.js     # Canvas rendering (JavaScript)
│   └── css/
│       └── app.css         # Global styles
├── App.razor               # Root component
├── Program.cs              # Entry point
└── blazor.csproj          # Project file
```

## Key Files

### Timeline Component
- **File**: `Components/ResourceTimeline.razor`
- **Purpose**: Blazor component wrapper around canvas
- **Responsibilities**: 
  - JS Interop
  - Component lifecycle
  - Parameter binding

### Canvas Renderer
- **File**: `wwwroot/js/timeline.js`
- **Purpose**: High-performance canvas rendering
- **Responsibilities**:
  - Drawing axes, grid, and bars
  - Viewport culling
  - Event handling (scroll, click)
  - Selection state

### Data Generator
- **File**: `Services/DataGenerator.cs`
- **Purpose**: Generate realistic sample data
- **Methods**:
  - `GenerateResources()`: Create resource list
  - `GenerateTimeRange()`: Create time span
  - `GenerateConsumptions()`: Create consumption records
  - `GenerateSampleData()`: All-in-one generator

### Home Page
- **File**: `Pages/Home.razor`
- **Purpose**: Main application page
- **Responsibilities**:
  - Initialize timeline data
  - Render timeline component

## Customization

### Change Timeline Duration

Edit `Pages/Home.razor`:
```csharp
// Change from 100 days to 30 days
timelineData = DataGenerator.GenerateSampleData(days: 30);
```

### Customize Resources

Edit `Services/DataGenerator.cs`:
```csharp
private static readonly string[] DefaultResourceNames = 
[
    "My-Server-1",
    "My-Server-2",
    "My-Database-1",
    // Add your resources here
];
```

### Adjust Visual Settings

Edit `wwwroot/js/timeline.js`:
```javascript
this.config = {
    resourceHeight: 40,        // Row height
    timeAxisHeight: 60,        // Top axis height
    resourceAxisWidth: 150,    // Left axis width
    barHeight: 4,              // Bar thickness
    // ... more settings
};
```

### Change Colors

Edit `wwwroot/js/timeline.js`, look for color values:
```javascript
// Background colors
this.ctx.fillStyle = '#f8f9fa';  // Axis background
this.ctx.fillStyle = '#ffffff';  // Content background

// Bar colors
this.ctx.fillStyle = '#74c0fc';  // Normal bar
this.ctx.fillStyle = '#4dabf7';  // Selected bar
this.ctx.strokeStyle = '#1971c2'; // Selected border

// Grid and borders
this.ctx.strokeStyle = '#dee2e6'; // Axis borders
this.ctx.strokeStyle = '#e9ecef'; // Grid lines
```

## Development

### Watch Mode (Hot Reload)

```bash
dotnet watch
```

Changes to C# files will automatically rebuild and refresh the browser.

### Build for Production

```bash
dotnet publish -c Release -o publish
```

Output files in `publish/wwwroot/` can be deployed to any static web host.

### Debugging

**C# Code**:
- Set breakpoints in `.razor` or `.cs` files
- Press F5 in VS Code or Visual Studio
- Debugger attaches to browser

**JavaScript Code**:
- Open browser DevTools (F12)
- Sources tab → `wwwroot/js/timeline.js`
- Set breakpoints
- Inspect canvas state

**Console Logging**:
```javascript
// Already included in timeline.js
console.log('Selected consumption:', clickedBar);
```

## Troubleshooting

### Canvas Not Rendering
- Check browser console (F12) for errors
- Ensure `timeline.js` is loaded (Network tab)
- Verify canvas element exists in DOM

### Performance Issues
- Check data size (resources × days)
- Open Performance tab in DevTools
- Look for long frames or memory leaks

### Build Errors
```bash
# Clean and rebuild
dotnet clean
dotnet build
```

### JS Interop Errors
- Check `IJSObjectReference` is not null
- Ensure methods are called after `OnAfterRenderAsync`
- Verify method names match between C# and JS

## Next Steps

1. **Read**: [`README.md`](README.md) for detailed documentation
2. **Explore**: [`IMPLEMENTATION_NOTES.md`](IMPLEMENTATION_NOTES.md) for technical details
3. **Customize**: Modify data, colors, or layout to fit your needs
4. **Integrate**: Connect to real data sources instead of sample generator
5. **Deploy**: Publish and host on your preferred platform

## Resources

- [Blazor Documentation](https://learn.microsoft.com/aspnet/core/blazor/)
- [JavaScript Interop](https://learn.microsoft.com/aspnet/core/blazor/javascript-interoperability/)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [.NET 10](https://learn.microsoft.com/dotnet/core/whats-new/dotnet-10/overview)

## Support

For issues or questions:
1. Check browser console for errors
2. Review implementation notes
3. Examine original JavaScript implementation in `../` (parent folder)
4. File an issue in the repository

---

Happy coding! 🚀
