import React, { useRef, useEffect, useState } from 'react';
import { Loader2, Eye, Code, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MermaidDiagramProps {
  chart: string;
  zoomingEnabled?: boolean;
}

export function MermaidDiagram({ chart, zoomingEnabled = true }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [renderError, setRenderError] = useState<string>('');
  const [showCode, setShowCode] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [svgContent, setSvgContent] = useState<string>('');

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !chart || showCode) {
      return;
    }

    const renderDiagram = async () => {
      try {
        console.log('🎨 Starting render process...');
        setIsRendering(true);
        setRenderError('');

        // Wait a tiny bit for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Import and initialize Mermaid
        console.log('🔧 Loading Mermaid...');
        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default;

        // Enhanced initialization for better styling and colors
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          logLevel: 3, // Show warnings but not all debug info
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          },
          themeVariables: {
            primaryColor: '#3b82f6',
            primaryTextColor: '#1f2937',
            primaryBorderColor: '#3b82f6',
            lineColor: '#6b7280',
            secondaryColor: '#f3f4f6',
            tertiaryColor: '#e5e7eb'
          }
        });

        // Clean the chart syntax before rendering - PRESERVE STYLING
        let cleanChart = chart;
        
        // Fix common AI-generated syntax errors
        // Fix nested parentheses in node labels - this is the main issue
        cleanChart = cleanChart.replace(/\(\("[^"]*"\)\)/g, '$1');
        
        // Fix specific malformed node patterns from AI
        cleanChart = cleanChart.replace(/D\("Mainframe Emulator\("Hercules"\)"\)/g, 'D("Mainframe Emulator (Hercules)")');
        cleanChart = cleanChart.replace(/E\("Database\("MariaDB"\)"\)/g, 'E("Database (MariaDB)")');
        
        // Fix any remaining nested parentheses patterns
        cleanChart = cleanChart.replace(/([A-Z])\(\("[^"]*\("([^"]*)"\)"\)\)/g, '$1("$2")');
        
        // PRESERVE all class references - they are needed for colors!
        // Only remove truly malformed ones that might cause parsing errors
        cleanChart = cleanChart.replace(/:::[^a-zA-Z0-9_-]+/g, ''); // Only remove class refs with invalid characters
        cleanChart = cleanChart.replace(/^\s*click\s+.*$/gm, ''); // Remove click events that might cause issues
        
        // PRESERVE these important styling elements:
        // - classDef (color definitions)
        // - style (component styling)
        // - class (component class assignments)
        
        // Ensure chart is not empty after cleaning
        if (!cleanChart.trim()) {
          throw new Error('Chart is empty after cleaning');
        }

        // Generate unique ID
        const diagramId = `diagram-${Date.now()}`;
        
        console.log('🚀 Rendering diagram...');
        console.log('📊 Original chart preview:', chart.substring(0, 200) + '...');
        console.log('🧹 Cleaned chart preview:', cleanChart.substring(0, 200) + '...');
        console.log('🎨 Checking for styling elements...');
        console.log('   - Has classDef:', /classDef/.test(cleanChart));
        console.log('   - Has style:', /style/.test(cleanChart));
        console.log('   - Has class:', /class/.test(cleanChart));
        console.log('   - Has class references (:::)', /:::[a-zA-Z0-9_-]+/.test(cleanChart));
        
        // Log the class references found
        const classRefs = cleanChart.match(/:::[a-zA-Z0-9_-]+/g);
        if (classRefs) {
          console.log('   - Class references found:', classRefs);
        }

        // Render the diagram
        const result = await mermaid.render(diagramId, cleanChart);
        
        // Store the SVG content in state instead of manipulating DOM directly
        if (result.svg) {
          // Add mermaid class and other attributes to the SVG
          let svgWithClasses = result.svg.replace(
            '<svg',
            '<svg class="mermaid-diagram" data-testid="mermaid-svg" style="width: 100%; height: auto; max-width: 100%;"'
          );
          
          setSvgContent(svgWithClasses);
          console.log('✅ Diagram rendered successfully!');
          setIsRendering(false);
        } else {
          throw new Error('No SVG returned from Mermaid');
        }

      } catch (error) {
        console.error('❌ Mermaid rendering error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown rendering error';
        
        // Provide helpful error messages for common issues
        let friendlyError = errorMessage;
        if (errorMessage.includes('Parse error')) {
          friendlyError = 'Diagram syntax error. The AI generated malformed code. Try regenerating with simpler instructions.';
        } else if (errorMessage.includes('Unterminated string')) {
          friendlyError = 'String formatting error in the diagram code. Try regenerating the diagram.';
        } else if (errorMessage.includes('STYLE_SEPARATOR')) {
          friendlyError = 'Style definition error in the diagram. Try regenerating without style customization.';
        } else if (errorMessage.includes('LINK_TARGET')) {
          friendlyError = 'Click event formatting error. Try regenerating the diagram.';
        }
        
        setRenderError(friendlyError);
        setIsRendering(false);
      }
    };

    // Use setTimeout to ensure this runs after React has finished rendering
    const timeoutId = setTimeout(renderDiagram, 10);
    return () => clearTimeout(timeoutId);
  }, [chart, isClient, showCode]);

  // Zoom and pan handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!zoomingEnabled) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!zoomingEnabled || !isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const downloadSVG = () => {
    if (svgContent) {
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading diagram renderer...</p>
        </div>
      </div>
    );
  }

  if (!chart) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No diagram content available</p>
      </div>
    );
  }

  if (showCode) {
    return (
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">Diagram Code</h3>
          <button
            onClick={() => setShowCode(false)}
            className="text-gray-400 hover:text-white"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
        <pre className="text-green-400 text-sm overflow-auto max-h-96">
          <code>{chart}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCode(true)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Show Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={downloadSVG}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Download SVG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
        
        {zoomingEnabled && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Diagram Container */}
      <div 
        className="relative overflow-hidden bg-white rounded-lg border border-gray-200"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="w-full p-4"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'top left',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {isRendering && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Rendering diagram...</p>
              </div>
            </div>
          )}
          
          {renderError && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 font-medium mb-2">Rendering Error</p>
                <p className="text-sm text-gray-600 max-w-md">{renderError}</p>
              </div>
            </div>
          )}
          
          {!isRendering && !renderError && svgContent && (
            <div 
              ref={containerRef}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default MermaidDiagram; 