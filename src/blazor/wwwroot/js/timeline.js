export function createTimeline(canvasId) {
    return new ResourceTimeline(canvasId);
}

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
    }
    
    setupCanvas() {
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
            return;
        }
        
        const rect = this.wrapper.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            requestAnimationFrame(() => this.resizeCanvas());
            return;
        }
        
        const viewportWidth = rect.width;
        const viewportHeight = rect.height;
        
        const totalHeight = this.config.timeAxisHeight + (this.resources.length * this.config.resourceHeight);
        const timeSpan = this.timeRange.end - this.timeRange.start;
        const visibleWidth = Math.max(rect.width - this.config.resourceAxisWidth, 100);
        
        const oneDay = 24 * 60 * 60 * 1000;
        const pixelsPerHour = visibleWidth / 24;
        const totalDays = timeSpan / oneDay;
        const totalWidth = this.config.resourceAxisWidth + (totalDays * visibleWidth);
        
        if (this.canvas.width !== viewportWidth || this.canvas.height !== viewportHeight) {
            this.canvas.width = viewportWidth;
            this.canvas.height = viewportHeight;
        }
        
        this.updateCanvasPosition();
        
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
        
        this.wrapper.style.width = viewportWidth + 'px';
        this.wrapper.style.height = viewportHeight + 'px';
        
        this.render();
    }
    
    updateCanvasPosition() {
        const wrapperRect = this.wrapper.getBoundingClientRect();
        this.canvas.style.position = 'sticky';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = wrapperRect.width + 'px';
        this.canvas.style.height = wrapperRect.height + 'px';
    }
    
    setupEventListeners() {
        let scrollRaf = null;
        const handleScroll = () => {
            this.scrollX = this.wrapper.scrollLeft;
            this.scrollY = this.wrapper.scrollTop;
            
            this.updateCanvasPosition();
            
            if (scrollRaf) {
                cancelAnimationFrame(scrollRaf);
            }
            
            scrollRaf = requestAnimationFrame(() => {
                if (this.resources.length > 0 && this.timeRange.start && this.timeRange.end) {
                    this.render();
                }
                scrollRaf = null;
            });
        };
        
        this.wrapper.addEventListener('scroll', handleScroll, { passive: true });
        
        this.canvas.addEventListener('click', (e) => {
            this.handleClick(e);
        });
        
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    getTimeToX(time) {
        if (!this.timeRange.start || !this.timeRange.end) {
            return 0;
        }
        const wrapperRect = this.wrapper.getBoundingClientRect();
        const visibleWidth = wrapperRect.width - this.config.resourceAxisWidth;
        if (visibleWidth <= 0) return 0;
        
        const oneDay = 24 * 60 * 60 * 1000;
        const pixelsPerHour = visibleWidth / 24;
        const pixelsPerMs = pixelsPerHour / (60 * 60 * 1000);
        
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
        
        const oneDay = 24 * 60 * 60 * 1000;
        const pixelsPerHour = visibleWidth / 24;
        const msPerPixel = (60 * 60 * 1000) / pixelsPerHour;
        
        const contentX = (x - this.config.resourceAxisWidth) + this.scrollX;
        return this.timeRange.start + contentX * msPerPixel;
    }
    
    getResourceToY(resourceIndex) {
        return this.config.timeAxisHeight + (resourceIndex * this.config.resourceHeight) - this.scrollY;
    }
    
    getYToResource(y) {
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
        const visibleWidth = wrapperRect.width - this.config.resourceAxisWidth;
        const oneDay = 24 * 60 * 60 * 1000;
        const pixelsPerHour = visibleWidth / 24;
        const msPerPixel = (60 * 60 * 1000) / pixelsPerHour;
        
        const startTime = this.timeRange.start + (this.scrollX * msPerPixel);
        const endTime = startTime + (visibleWidth * msPerPixel);
        
        const padding = (endTime - startTime) * 0.1;
        return {
            start: Math.max(this.timeRange.start, startTime - padding),
            end: Math.min(this.timeRange.end, endTime + padding)
        };
    }
    
    render() {
        if (this.resources.length === 0 || !this.timeRange.start || !this.timeRange.end || 
            this.canvas.width === 0 || this.canvas.height === 0) {
            return;
        }
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.animationFrame = requestAnimationFrame(() => {
            try {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.visibleTimeRange = this.calculateVisibleTimeRange();
                
                if (!this.visibleTimeRange) {
                    this.animationFrame = null;
                    return;
                }
                
                this.drawBackground();
                this.drawGridLines();
                this.drawConsumptionBars();
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
        
        const contentX = this.config.resourceAxisWidth;
        const contentY = this.config.timeAxisHeight;
        const contentWidth = wrapperRect.width - this.config.resourceAxisWidth;
        const contentHeight = wrapperRect.height - this.config.timeAxisHeight;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(contentX, contentY, contentWidth, contentHeight);
        
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, this.config.timeAxisHeight, this.config.resourceAxisWidth, contentHeight);
        
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(contentX, 0, contentWidth, this.config.timeAxisHeight);
    }
    
    drawTimeAxis() {
        const axisY = 0;
        const axisHeight = this.config.timeAxisHeight;
        const startX = this.config.resourceAxisWidth;
        const wrapperRect = this.wrapper.getBoundingClientRect();
        const visibleEndX = wrapperRect.width;
        
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(startX, axisY, visibleEndX - startX, axisHeight);
        
        this.ctx.strokeStyle = '#dee2e6';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, axisHeight);
        this.ctx.lineTo(visibleEndX, axisHeight);
        this.ctx.stroke();
        
        if (this.visibleTimeRange && this.timeRange.start && this.timeRange.end) {
            const oneHour = 60 * 60 * 1000;
            
            const firstHour = Math.floor(this.visibleTimeRange.start / oneHour) * oneHour;
            
            let currentTime = firstHour;
            if (currentTime < this.visibleTimeRange.start) {
                currentTime += oneHour;
            }
            
            this.ctx.fillStyle = '#495057';
            this.ctx.font = '12px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            while (currentTime <= this.visibleTimeRange.end) {
                const x = this.getTimeToX(currentTime);
                
                if (x >= startX && x <= visibleEndX) {
                    this.ctx.strokeStyle = '#adb5bd';
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, axisHeight - 10);
                    this.ctx.lineTo(x, axisHeight);
                    this.ctx.stroke();
                    
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
        const axisX = 0;
        const axisWidth = this.config.resourceAxisWidth;
        const startY = this.config.timeAxisHeight;
        const wrapperRect = this.wrapper.getBoundingClientRect();
        const visibleEndY = wrapperRect.height;
        
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(axisX, startY, axisWidth, visibleEndY - startY);
        
        this.ctx.strokeStyle = '#dee2e6';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(axisWidth, startY);
        this.ctx.lineTo(axisWidth, visibleEndY);
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#495057';
        this.ctx.font = '13px sans-serif';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        
        const visibleStart = Math.max(0, Math.floor((this.scrollY) / this.config.resourceHeight) - 1);
        const visibleEnd = Math.min(
            this.resources.length,
            Math.ceil((this.scrollY + wrapperRect.height - this.config.timeAxisHeight) / this.config.resourceHeight) + 1
        );
        
        for (let i = visibleStart; i < visibleEnd; i++) {
            const resource = this.resources[i];
            const y = this.getResourceToY(i);
            
            if (y >= startY && y <= visibleEndY) {
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
        
        const visibleStart = Math.max(0, Math.floor((this.scrollY) / this.config.resourceHeight) - 1);
        const visibleEnd = Math.min(
            this.resources.length,
            Math.ceil((this.scrollY + wrapperRect.height - this.config.timeAxisHeight) / this.config.resourceHeight) + 1
        );
        
        for (let i = visibleStart; i <= visibleEnd; i++) {
            const y = this.getResourceToY(i);
            if (y >= startY && y <= visibleEndY) {
                this.ctx.beginPath();
                this.ctx.moveTo(startX, y);
                this.ctx.lineTo(visibleEndX, y);
                this.ctx.stroke();
            }
        }
        
        if (this.visibleTimeRange && this.timeRange.start && this.timeRange.end) {
            const oneHour = 60 * 60 * 1000;
            
            const firstHour = Math.floor(this.visibleTimeRange.start / oneHour) * oneHour;
            
            let currentTime = firstHour;
            if (currentTime < this.visibleTimeRange.start) {
                currentTime += oneHour;
            }
            
            while (currentTime <= this.visibleTimeRange.end) {
                const x = this.getTimeToX(currentTime);
                
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
        
        const visibleConsumptions = this.consumptions.filter(cons => {
            return (cons.endTime >= this.visibleTimeRange.start && 
                    cons.startTime <= this.visibleTimeRange.end);
        });
        
        const startX = this.config.resourceAxisWidth;
        const startY = this.config.timeAxisHeight;
        const wrapperRect = this.wrapper.getBoundingClientRect();
        const visibleEndX = wrapperRect.width;
        const visibleEndY = wrapperRect.height;
        
        const consumptionsByResource = {};
        visibleConsumptions.forEach(cons => {
            if (!consumptionsByResource[cons.resourceId]) {
                consumptionsByResource[cons.resourceId] = [];
            }
            consumptionsByResource[cons.resourceId].push(cons);
        });
        
        this.resources.forEach((resource, resourceIndex) => {
            const resourceY = this.getResourceToY(resourceIndex);
            const barCenterY = resourceY + this.config.resourceHeight / 2;
            
            if (resourceY + this.config.resourceHeight < startY || resourceY > visibleEndY) {
                return;
            }
            
            const resourceConsumptions = consumptionsByResource[resource.id] || [];
            
            resourceConsumptions.forEach(cons => {
                const barX = this.getTimeToX(cons.startTime);
                const barEndX = this.getTimeToX(cons.endTime);
                const barWidth = Math.max(this.config.minBarWidth, barEndX - barX);
                
                if (barEndX < startX || barX > visibleEndX) {
                    return;
                }
                
                const isSelected = this.selectedBar && this.selectedBar.id === cons.id;
                
                if (isSelected) {
                    this.ctx.fillStyle = '#4dabf7';
                    this.ctx.fillRect(barX, barCenterY - this.config.barHeight / 2, barWidth, this.config.barHeight);
                    
                    this.ctx.strokeStyle = '#1971c2';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(barX - 1, barCenterY - this.config.barHeight / 2 - 1, barWidth + 2, this.config.barHeight + 2);
                } else {
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
        
        if (canvasX < this.config.resourceAxisWidth || canvasY < this.config.timeAxisHeight) {
            this.selectedBar = null;
            this.render();
            return;
        }
        
        const resourceIndex = this.getYToResource(canvasY);
        if (resourceIndex === -1) return;
        
        const resource = this.resources[resourceIndex];
        const clickTime = this.getXToTime(canvasX);
        
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
        
        this.selectedBar = clickedBar;
        this.render();
        
        if (clickedBar) {
            console.log('Selected consumption:', clickedBar);
        }
    }
    
    // Public API methods
    setResources(resources) {
        this.resources = resources;
        if (this.timeRange.start && this.timeRange.end) {
            this.setupCanvas();
        }
    }
    
    setTimeRange(start, end) {
        this.timeRange = { start, end };
        if (this.resources.length > 0) {
            this.setupCanvas();
        }
    }
    
    setConsumptions(consumptions) {
        this.consumptions = consumptions.sort((a, b) => a.startTime - b.startTime);
        if (this.canvas.width > 0 && this.canvas.height > 0) {
            this.render();
        }
    }
    
    getSelectedBar() {
        return this.selectedBar;
    }
}
