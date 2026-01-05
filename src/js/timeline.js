class ResourceTimeline {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.wrapper = this.canvas.parentElement;
        
        // Configuration
        this.config = {
            resourceHeight: 40,
            timeAxisHeight: 60,
            resourceAxisWidth: 150,
            barHeight: 4,
            barSpacing: 2,
            minBarWidth: 2,
            padding: { top: 10, right: 20, bottom: 10, left: 10 }
        };
        
        // Data
        this.resources = [];
        this.timeRange = { start: null, end: null };
        this.consumptions = [];
        
        // State
        this.selectedBar = null;
        this.scrollX = 0;
        this.scrollY = 0;
        this.zoom = 1;
        
        // Performance optimization
        this.visibleTimeRange = null;
        this.animationFrame = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        // Don't render until data is loaded
    }
    
    setupCanvas() {
        // Set up resize listener only once
        if (!this._resizeListenerSetup) {
            window.addEventListener('resize', () => {
                this.resizeCanvas();
            });
            this._resizeListenerSetup = true;
        }
        
        this.resizeCanvas();
    }
    
    resizeCanvas() {
        if (this.resources.length === 0 || !this.timeRange.start || !this.timeRange.end) {
            return; // Wait for data to be loaded
        }
        
        const rect = this.wrapper.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            // Wrapper not ready yet, try again on next frame
            requestAnimationFrame(() => this.resizeCanvas());
            return;
        }
        
        // Canvas should match viewport size (not full content size)
        // This allows us to draw sticky axes at fixed positions
        const viewportWidth = rect.width;
        const viewportHeight = rect.height;
        
        // Calculate total content dimensions for scrolling
        const totalHeight = this.config.timeAxisHeight + (this.resources.length * this.config.resourceHeight);
        const timeSpan = this.timeRange.end - this.timeRange.start;
        const visibleWidth = Math.max(rect.width - this.config.resourceAxisWidth, 100);
        
        // Calculate width to show 1 day per viewport width
        // One day = 24 hours, so we need to calculate pixels per hour
        const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day
        const pixelsPerHour = visibleWidth / 24; // pixels per hour to fit one day in viewport
        const totalDays = timeSpan / oneDay;
        const totalWidth = this.config.resourceAxisWidth + (totalDays * visibleWidth);
        
        // Set canvas to viewport size and position it relative to wrapper
        if (this.canvas.width !== viewportWidth || this.canvas.height !== viewportHeight) {
            this.canvas.width = viewportWidth;
            this.canvas.height = viewportHeight;
        }
        
        // Position canvas - it should stay fixed in viewport while wrapper scrolls
        // We'll update its position based on wrapper's scroll position
        this.updateCanvasPosition();
        
        // Set wrapper content size for scrolling
        // Create a hidden div that defines the scrollable area
        let contentDiv = this.wrapper.querySelector('.timeline-content');
        if (!contentDiv) {
            contentDiv = document.createElement('div');
            contentDiv.className = 'timeline-content';
            contentDiv.style.position = 'absolute';
            contentDiv.style.top = '0';
            contentDiv.style.left = '0';
            contentDiv.style.width = totalWidth + 'px';
            contentDiv.style.height = totalHeight + 'px';
            contentDiv.style.pointerEvents = 'none';
            this.wrapper.appendChild(contentDiv);
        } else {
            contentDiv.style.width = totalWidth + 'px';
            contentDiv.style.height = totalHeight + 'px';
        }
        
        // Update wrapper scroll dimensions
        this.wrapper.style.width = viewportWidth + 'px';
        this.wrapper.style.height = viewportHeight + 'px';
        
        // Always render after resize
        this.render();
    }
    
    updateCanvasPosition() {
        const wrapperRect = this.wrapper.getBoundingClientRect();
        // Position canvas to stay fixed in viewport (sticky)
        // Use position: sticky or ensure it doesn't scroll with wrapper
        this.canvas.style.position = 'sticky';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = wrapperRect.width + 'px';
        this.canvas.style.height = wrapperRect.height + 'px';
    }
    
    setupEventListeners() {
        // Scroll handling - use throttling for better performance
        let scrollRaf = null;
        const handleScroll = () => {
            this.scrollX = this.wrapper.scrollLeft;
            this.scrollY = this.wrapper.scrollTop;
            
            // Update canvas position to stay aligned with viewport
            this.updateCanvasPosition();
            
            // Cancel previous animation frame
            if (scrollRaf) {
                cancelAnimationFrame(scrollRaf);
            }
            
            // Schedule render on next animation frame
            scrollRaf = requestAnimationFrame(() => {
                // Always render on scroll if we have data
                if (this.resources.length > 0 && this.timeRange.start && this.timeRange.end) {
                    this.render();
                }
                scrollRaf = null;
            });
        };
        
        this.wrapper.addEventListener('scroll', handleScroll, { passive: true });
        
        // Click handling
        this.canvas.addEventListener('click', (e) => {
            this.handleClick(e);
        });
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    
    getTimeToX(time) {
        if (!this.timeRange.start || !this.timeRange.end) {
            return 0;
        }
        const wrapperRect = this.wrapper.getBoundingClientRect();
        const visibleWidth = wrapperRect.width - this.config.resourceAxisWidth;
        if (visibleWidth <= 0) return 0;
        
        // Calculate based on 1 day per viewport width
        const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day
        const pixelsPerHour = visibleWidth / 24; // pixels per hour
        const pixelsPerMs = pixelsPerHour / (60 * 60 * 1000);
        
        // Calculate position in content space, then subtract scroll to get viewport position
        const contentX = (time - this.timeRange.start) * pixelsPerMs;
        return this.config.resourceAxisWidth + contentX - this.scrollX;
    }
    
    getXToTime(x) {
        if (!this.timeRange.start || !this.timeRange.end) {
            return 0;
        }
        const wrapperRect = this.wrapper.getBoundingClientRect();
        const visibleWidth = wrapperRect.width - this.config.resourceAxisWidth;
        if (visibleWidth <= 0) return this.timeRange.start;
        
        // Calculate based on 1 day per viewport width
        const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day
        const pixelsPerHour = visibleWidth / 24; // pixels per hour
        const msPerPixel = (60 * 60 * 1000) / pixelsPerHour;
        
        // Convert viewport coordinate to content coordinate, then to time
        const contentX = (x - this.config.resourceAxisWidth) + this.scrollX;
        return this.timeRange.start + contentX * msPerPixel;
    }
    
    getResourceToY(resourceIndex) {
        // Return canvas coordinate (viewport-relative, accounting for scroll)
        return this.config.timeAxisHeight + (resourceIndex * this.config.resourceHeight) - this.scrollY;
    }
    
    getYToResource(y) {
        // Convert canvas coordinate to resource index (accounting for scroll)
        const resourceY = y - this.config.timeAxisHeight + this.scrollY;
        if (resourceY < 0) return -1;
        const index = Math.floor(resourceY / this.config.resourceHeight);
        return index >= 0 && index < this.resources.length ? index : -1;
    }
    
    calculateVisibleTimeRange() {
        if (!this.timeRange.start || !this.timeRange.end) {
            return null;
        }
        
        const wrapperRect = this.wrapper.getBoundingClientRect();
        // Calculate visible time range based on scroll position
        // With 1 day per view, we need to calculate which day is visible
        const visibleWidth = wrapperRect.width - this.config.resourceAxisWidth;
        const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day
        const pixelsPerHour = visibleWidth / 24;
        const msPerPixel = (60 * 60 * 1000) / pixelsPerHour;
        
        // Calculate visible time based on scroll position
        const startTime = this.timeRange.start + (this.scrollX * msPerPixel);
        const endTime = startTime + (visibleWidth * msPerPixel);
        
        // Add some padding for smooth scrolling
        const padding = (endTime - startTime) * 0.1;
        return {
            start: Math.max(this.timeRange.start, startTime - padding),
            end: Math.min(this.timeRange.end, endTime + padding)
        };
    }
    
    render() {
        // Don't render if we don't have data or canvas isn't sized
        if (this.resources.length === 0 || !this.timeRange.start || !this.timeRange.end || 
            this.canvas.width === 0 || this.canvas.height === 0) {
            return;
        }
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.animationFrame = requestAnimationFrame(() => {
            try {
                // Clear canvas
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Calculate visible time range for performance
                this.visibleTimeRange = this.calculateVisibleTimeRange();
                
                if (!this.visibleTimeRange) {
                    this.animationFrame = null;
                    return;
                }
                
                // Draw in correct z-order:
                // 1. Background (bottom layer)
                this.drawBackground();
                
                // 2. Grid lines (below bars)
                this.drawGridLines();
                
                // 3. Consumption bars (middle layer)
                this.drawConsumptionBars();
                
                // 4. Axes (top layer - should be above everything)
                this.drawTimeAxis();
                this.drawResourceAxis();
            } catch (error) {
                console.error('Render error:', error);
            } finally {
                this.animationFrame = null;
            }
        });
    }
    
    drawBackground() {
        const wrapperRect = this.wrapper.getBoundingClientRect();
        
        // Main content area background
        const contentX = this.config.resourceAxisWidth;
        const contentY = this.config.timeAxisHeight;
        const contentWidth = wrapperRect.width - this.config.resourceAxisWidth;
        const contentHeight = wrapperRect.height - this.config.timeAxisHeight;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(contentX, contentY, contentWidth, contentHeight);
        
        // Resource axis background (sticky)
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, this.config.timeAxisHeight, this.config.resourceAxisWidth, contentHeight);
        
        // Time axis background (sticky)
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(contentX, 0, contentWidth, this.config.timeAxisHeight);
    }
    
    drawTimeAxis() {
        const axisY = 0; // Fixed at top of viewport
        const axisHeight = this.config.timeAxisHeight;
        const startX = this.config.resourceAxisWidth;
        const wrapperRect = this.wrapper.getBoundingClientRect();
        const visibleEndX = wrapperRect.width;
        
        // Background (sticky - always at top of viewport)
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(startX, axisY, visibleEndX - startX, axisHeight);
        
        // Border
        this.ctx.strokeStyle = '#dee2e6';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, axisHeight);
        this.ctx.lineTo(visibleEndX, axisHeight);
        this.ctx.stroke();
        
        // Draw time labels at 1-hour intervals
        if (this.visibleTimeRange && this.timeRange.start && this.timeRange.end) {
            const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
            
            // Find the first hour mark at or before the visible start
            const firstHour = Math.floor(this.visibleTimeRange.start / oneHour) * oneHour;
            
            // Start from the first hour, but ensure we show at least one label before visible start
            let currentTime = firstHour;
            if (currentTime < this.visibleTimeRange.start) {
                currentTime += oneHour;
            }
            
            this.ctx.fillStyle = '#495057';
            this.ctx.font = '12px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Draw hour marks within visible range
            while (currentTime <= this.visibleTimeRange.end) {
                const x = this.getTimeToX(currentTime); // Already accounts for scroll
                
                if (x >= startX && x <= visibleEndX) {
                    // Tick mark
                    this.ctx.strokeStyle = '#adb5bd';
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, axisHeight - 10);
                    this.ctx.lineTo(x, axisHeight);
                    this.ctx.stroke();
                    
                    // Label
                    const date = new Date(currentTime);
                    const label = this.formatTimeLabel(date);
                    this.ctx.fillText(label, x, axisHeight / 2);
                }
                
                currentTime += oneHour;
            }
        }
    }
    
    formatTimeLabel(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        return `${hours}`;
    }
    
    drawResourceAxis() {
        const axisX = 0; // Fixed at left of viewport
        const axisWidth = this.config.resourceAxisWidth;
        const startY = this.config.timeAxisHeight; // Fixed below time axis
        const wrapperRect = this.wrapper.getBoundingClientRect();
        const visibleEndY = wrapperRect.height;
        
        // Background (sticky - always at left of viewport)
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(axisX, startY, axisWidth, visibleEndY - startY);
        
        // Border
        this.ctx.strokeStyle = '#dee2e6';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(axisWidth, startY);
        this.ctx.lineTo(axisWidth, visibleEndY);
        this.ctx.stroke();
        
        // Draw resource labels
        this.ctx.fillStyle = '#495057';
        this.ctx.font = '13px sans-serif';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        
        // Calculate which resources are visible based on scroll
        const visibleStart = Math.max(0, Math.floor((this.scrollY) / this.config.resourceHeight) - 1);
        const visibleEnd = Math.min(
            this.resources.length,
            Math.ceil((this.scrollY + wrapperRect.height - this.config.timeAxisHeight) / this.config.resourceHeight) + 1
        );
        
        for (let i = visibleStart; i < visibleEnd; i++) {
            const resource = this.resources[i];
            const y = this.getResourceToY(i); // Already accounts for scroll
            
            if (y >= startY && y <= visibleEndY) {
                // Resource name
                this.ctx.fillText(
                    resource.name,
                    axisWidth - 10,
                    y + this.config.resourceHeight / 2
                );
            }
        }
    }
    
    drawGridLines() {
        const startX = this.config.resourceAxisWidth;
        const startY = this.config.timeAxisHeight;
        const wrapperRect = this.wrapper.getBoundingClientRect();
        const visibleEndX = wrapperRect.width;
        const visibleEndY = wrapperRect.height;
        
        this.ctx.strokeStyle = '#e9ecef';
        this.ctx.lineWidth = 1;
        
        // Horizontal grid lines (between resources)
        const visibleStart = Math.max(0, Math.floor((this.scrollY) / this.config.resourceHeight) - 1);
        const visibleEnd = Math.min(
            this.resources.length,
            Math.ceil((this.scrollY + wrapperRect.height - this.config.timeAxisHeight) / this.config.resourceHeight) + 1
        );
        
        for (let i = visibleStart; i <= visibleEnd; i++) {
            const y = this.getResourceToY(i); // Already accounts for scroll
            if (y >= startY && y <= visibleEndY) {
                this.ctx.beginPath();
                this.ctx.moveTo(startX, y);
                this.ctx.lineTo(visibleEndX, y);
                this.ctx.stroke();
            }
        }
        
        // Vertical grid lines (time markers) - at 1-hour intervals
        if (this.visibleTimeRange && this.timeRange.start && this.timeRange.end) {
            const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
            
            // Find the first hour mark at or before the visible start
            const firstHour = Math.floor(this.visibleTimeRange.start / oneHour) * oneHour;
            
            // Start from the first hour
            let currentTime = firstHour;
            if (currentTime < this.visibleTimeRange.start) {
                currentTime += oneHour;
            }
            
            // Draw hour grid lines within visible range
            while (currentTime <= this.visibleTimeRange.end) {
                const x = this.getTimeToX(currentTime); // Already accounts for scroll
                
                if (x >= startX && x <= visibleEndX) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, startY);
                    this.ctx.lineTo(x, visibleEndY);
                    this.ctx.stroke();
                }
                
                currentTime += oneHour;
            }
        }
    }
    
    drawConsumptionBars() {
        if (!this.visibleTimeRange) return;
        
        // Filter consumptions to visible time range for performance
        const visibleConsumptions = this.consumptions.filter(cons => {
            return (cons.endTime >= this.visibleTimeRange.start && 
                    cons.startTime <= this.visibleTimeRange.end);
        });
        
        const startX = this.config.resourceAxisWidth;
        const startY = this.config.timeAxisHeight;
        const wrapperRect = this.wrapper.getBoundingClientRect();
        const visibleEndX = wrapperRect.width;
        const visibleEndY = wrapperRect.height;
        
        // Group consumptions by resource for efficient rendering
        const consumptionsByResource = {};
        visibleConsumptions.forEach(cons => {
            if (!consumptionsByResource[cons.resourceId]) {
                consumptionsByResource[cons.resourceId] = [];
            }
            consumptionsByResource[cons.resourceId].push(cons);
        });
        
        // Draw bars for each resource
        this.resources.forEach((resource, resourceIndex) => {
            const resourceY = this.getResourceToY(resourceIndex); // Already accounts for scroll
            const barCenterY = resourceY + this.config.resourceHeight / 2;
            
            // Only draw if resource is visible
            if (resourceY + this.config.resourceHeight < startY || resourceY > visibleEndY) {
                return;
            }
            
            const resourceConsumptions = consumptionsByResource[resource.id] || [];
            
            resourceConsumptions.forEach(cons => {
                const barX = this.getTimeToX(cons.startTime); // Already accounts for scroll
                const barEndX = this.getTimeToX(cons.endTime); // Already accounts for scroll
                const barWidth = Math.max(this.config.minBarWidth, barEndX - barX);
                
                // Only draw if bar is visible
                if (barEndX < startX || barX > visibleEndX) {
                    return;
                }
                
                // Draw bar
                const isSelected = this.selectedBar && this.selectedBar.id === cons.id;
                
                if (isSelected) {
                    // Selected bar with border
                    this.ctx.fillStyle = '#4dabf7';
                    this.ctx.fillRect(barX, barCenterY - this.config.barHeight / 2, barWidth, this.config.barHeight);
                    
                    // Border
                    this.ctx.strokeStyle = '#1971c2';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(barX - 1, barCenterY - this.config.barHeight / 2 - 1, barWidth + 2, this.config.barHeight + 2);
                } else {
                    // Normal bar
                    this.ctx.fillStyle = '#74c0fc';
                    this.ctx.fillRect(barX, barCenterY - this.config.barHeight / 2, barWidth, this.config.barHeight);
                }
            });
        });
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        
        // Check if click is in axis areas (these are sticky, so use screen coordinates)
        if (canvasX < this.config.resourceAxisWidth || canvasY < this.config.timeAxisHeight) {
            this.selectedBar = null;
            this.render();
            return;
        }
        
        // Canvas coordinates are already viewport-relative, convert to content coordinates
        const contentX = canvasX - this.config.resourceAxisWidth + this.scrollX;
        const contentY = canvasY - this.config.timeAxisHeight + this.scrollY;
        
        // Find resource
        const resourceIndex = this.getYToResource(canvasY);
        if (resourceIndex === -1) return;
        
        const resource = this.resources[resourceIndex];
        const clickTime = this.getXToTime(canvasX);
        
        // Find clicked consumption bar
        const resourceConsumptions = this.consumptions.filter(
            cons => cons.resourceId === resource.id
        );
        
        let clickedBar = null;
        let minDistance = Infinity;
        
        resourceConsumptions.forEach(cons => {
            if (clickTime >= cons.startTime && clickTime <= cons.endTime) {
                const barX = this.getTimeToX(cons.startTime);
                const barEndX = this.getTimeToX(cons.endTime);
                const barCenterX = (barX + barEndX) / 2;
                const distance = Math.abs(canvasX - barCenterX);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    clickedBar = cons;
                }
            }
        });
        
        // Update selection
        this.selectedBar = clickedBar;
        this.render();
        
        // Log selection for debugging
        if (clickedBar) {
            console.log('Selected consumption:', clickedBar);
        }
    }
    
    // Public API methods
    setResources(resources) {
        this.resources = resources;
        // Don't resize canvas yet - wait for timeRange to be set
        if (this.timeRange.start && this.timeRange.end) {
            this.setupCanvas();
        }
    }
    
    setTimeRange(start, end) {
        this.timeRange = { start, end };
        // Resize canvas if we have resources
        if (this.resources.length > 0) {
            this.setupCanvas();
        }
    }
    
    setConsumptions(consumptions) {
        this.consumptions = consumptions.sort((a, b) => a.startTime - b.startTime);
        // Only render if canvas is already sized
        if (this.canvas.width > 0 && this.canvas.height > 0) {
            this.render();
        }
    }
    
    getSelectedBar() {
        return this.selectedBar;
    }
}
