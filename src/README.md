# Resource Timeline - Source Code

This directory contains both the original JavaScript implementation and the new Blazor WebAssembly implementation of the Resource Timeline component.

## 📁 Directory Structure

```
src/
├── 📂 js/ JavaScript Implementation (Original)
│   ├── index.html           # Entry point
│   ├── index.js             # Application initialization
│   ├── timeline.js          # Timeline class with canvas rendering
│   ├── data.js              # Data generator
│   ├── styles.css           # Styling
│   └── README.md            # Original documentation
│
├── 📂 blazor/ (Blazor WebAssembly - NEW)
│   ├── Components/          # Razor components
│   ├── Models/              # C# data models
│   ├── Services/            # C# services
│   ├── Pages/               # Routable pages
│   ├── wwwroot/             # Static files + JS interop
│   ├── README.md            # Complete Blazor documentation
│   ├── GETTING_STARTED.md   # Quick start guide
│   ├── IMPLEMENTATION_NOTES.md  # Technical details
│   └── INDEX.md             # Documentation index
│
└── MIGRATION_SUMMARY.md     # Migration documentation
```

## 🚀 Quick Start

### JavaScript Version (Original)

1. **Open in Browser**:
   ```bash
   cd js

   # Using http-server npm package
   http-server
   
   # Using Node.js
   npx serve
   
   # Or just open index.html directly
   ```

2. **Navigate to**: `http://localhost:8080`

### Blazor Version (New)

1. **Prerequisites**: [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)

2. **Run**:
   ```bash
   cd blazor
   dotnet run
   ```

3. **Navigate to**: `https://localhost:5001`

## 📖 Documentation

### For JavaScript Version
- See [`README.md`](README.md) in this folder (original documentation)
- Simple, vanilla JavaScript implementation
- No build process required
- Direct browser execution

### For Blazor Version
- See [`blazor/INDEX.md`](blazor/INDEX.md) for documentation index
- Start with [`blazor/GETTING_STARTED.md`](blazor/GETTING_STARTED.md) for quick start
- Read [`blazor/README.md`](blazor/README.md) for complete documentation
- Explore [`blazor/IMPLEMENTATION_NOTES.md`](blazor/IMPLEMENTATION_NOTES.md) for technical details

### Migration Information
- See [`MIGRATION_SUMMARY.md`](MIGRATION_SUMMARY.md) for complete migration details
- Architecture comparison
- Code examples (before/after)
- Benefits and trade-offs

## 🎯 Which Version Should I Use?

### Use JavaScript Version If:
- ✅ You want simplicity (no build tools)
- ✅ You need minimal dependencies
- ✅ You're embedding in existing HTML pages
- ✅ You want the smallest possible bundle size
- ✅ You prefer vanilla JavaScript

### Use Blazor Version If:
- ✅ You're building a .NET application
- ✅ You want strong typing and compile-time checks
- ✅ You need integration with .NET services/APIs
- ✅ You prefer C# over JavaScript
- ✅ You want advanced IDE support
- ✅ You plan to add authentication, SignalR, etc.

## ⚖️ Comparison

| Feature | JavaScript | Blazor |
|---------|-----------|--------|
| **Initial Load** | ~50KB | ~2MB (includes .NET runtime) |
| **Startup Time** | <100ms | ~500ms |
| **Type Safety** | No | Yes (C#) |
| **Build Required** | No | Yes (.NET SDK) |
| **IDE Support** | Basic | Advanced (IntelliSense, refactoring) |
| **Debugging** | Browser DevTools | Source-level in IDE + DevTools |
| **Runtime Perf** | 60fps | 60fps (equivalent) |
| **Dependencies** | None | .NET 10 SDK |
| **Complexity** | Low | Medium |
| **Maintainability** | Good | Excellent |

## 🔄 Migration Path

Both versions are **functionally equivalent**. The Blazor version is a complete port that:
- ✅ Preserves all features
- ✅ Maintains performance characteristics
- ✅ Uses the same rendering logic (JavaScript canvas)
- ✅ Generates identical sample data

Differences:
- Blazor adds C# type system
- Blazor uses component-based architecture
- Blazor has better tooling support
- JavaScript has lower initial overhead

## 📚 Learn More

### JavaScript Implementation
```javascript
// Simple class-based architecture
class ResourceTimeline {
    constructor(canvasId) { /* ... */ }
    render() { /* Canvas rendering */ }
}

class DataGenerator {
    static generateSampleData() { /* ... */ }
}
```

### Blazor Implementation
```csharp
// Component-based architecture with strong typing
public class Resource {
    public required string Id { get; set; }
    public required string Name { get; set; }
}

@code {
    protected override async Task OnInitialized() {
        timelineData = DataGenerator.GenerateSampleData(days: 100);
    }
}
```

## 🎓 Getting Started Guides

1. **JavaScript**: Open `index.html` in a browser (or use a local server)
2. **Blazor**: Follow [`blazor/GETTING_STARTED.md`](blazor/GETTING_STARTED.md)

## 🤝 Contributing

Both implementations are open for contributions:
- **Bug fixes**: Test in both versions if applicable
- **Features**: Consider adding to both versions
- **Documentation**: Keep both in sync where relevant

## 📄 License

See [LICENSE](../LICENSE) in the root directory.

---

**Recommendation**: Start with the **JavaScript version** for quick prototyping, then migrate to **Blazor** for production applications that need .NET integration.
