import { GraphCanvas, GraphCanvasRef, useSelection, Theme } from 'reagraph'
import { useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Stream } from '../mocks/streams'
import { populateStreams } from '../mocks/posts'
import StreamModal from './StreamModal'

const holoscopeTheme: Theme = {
    canvas: { background: '#fff' },
    node: {
      fill: '#7CA0AB',
      activeFill: '#1DE9AC',
      opacity: 1,
      selectedOpacity: 1,
      inactiveOpacity: 0.2,
      label: {
        color: '#2A6475',
        stroke: '#fff',
        activeColor: '#1DE9AC'
      },
      subLabel: {
        color: '#ddd',
        stroke: 'transparent',
        activeColor: '#1DE9AC'
      }
    },
    lasso: {
      border: '1px solid #55aaff',
      background: 'rgba(75, 160, 255, 0.1)'
    },
    ring: {
      fill: '#D8E6EA',
      activeFill: '#1DE9AC'
    },
    edge: {
      fill: '#D8E6EA',
      activeFill: '#1DE9AC',
      opacity: 1,
      selectedOpacity: 1,
      inactiveOpacity: 0.1,
      label: {
        stroke: '#fff',
        color: '#2A6475',
        activeColor: '#1DE9AC',
        fontSize: 6
      }
    },
    arrow: {
      fill: '#D8E6EA',
      activeFill: '#1DE9AC'
    },
    cluster: {
      stroke: '#D8E6EA',
      opacity: 1,
      selectedOpacity: 1,
      inactiveOpacity: 0.1,
      label: {
        stroke: '#fff',
        color: '#2A6475'
      }
    }
  }
  
export const Holoscope = () => {
    const [selectedStream, setSelectedStream] = useState<Stream | null>(null)
    const [graphData, setGraphData] = useState<{ nodes: any[], edges: any[] }>({ nodes: [], edges: [] })
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const containerRef = useRef<HTMLDivElement>(null)
    const graphRef = useRef<GraphCanvasRef>(null)
    const [layoutType, setLayoutType] = useState<'radialOut2d' | 'radialOut3d'>('radialOut2d')

    
    const handleNodeClick = useCallback((node: any) => {
        setSelectedStream(node.data)
    }, [])

    // Single useEffect for dimension handling
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect()
                console.log('Container dimensions:', { width, height })
                setDimensions({
                    width: width - 32,  // accounting for padding
                    height: height - 32
                })
            }
        }

        // Initial measurement
        updateDimensions()

        // Setup resize observer
        const resizeObserver = new ResizeObserver(updateDimensions)
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        return () => resizeObserver.disconnect()
    }, [])

    useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return

        const streams = populateStreams()
    
        setGraphData({
            nodes: streams.map(stream => ({
                id: stream.id,
                label: stream.name,
                data: stream,
                fill: stream.color,
            })),
            edges: streams.map((stream) => {
                const randomTargetIndex = Math.floor(Math.random() * streams.length);
                return {
                    id: `${stream.id}-${streams[randomTargetIndex].id}`,
                    source: stream.id,
                    target: streams[randomTargetIndex].id,
                    label: '',
                }
            })
        })
    }, [dimensions.width, dimensions.height])

    // Add this useEffect to watch layoutType changes
    useEffect(() => {
        if (layoutType === 'radialOut2d') {
            // Small timeout to ensure layout has updated before centering
            setTimeout(() => {
                graphRef.current?.fitNodesInView();
            }, 100);
        }
    }, [layoutType]);

    // Separate panel rendering logic
    const renderMainGraph = () => (
        <div className="absolute inset-0 w-full h-full">
            <button 
                onClick={() => setLayoutType(prev => prev === 'radialOut2d' ? 'radialOut3d' : 'radialOut2d')}
                className="absolute top-4 left-4 z-10 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
                Switch to {layoutType === 'radialOut2d' ? '3D' : '2D'} Layout
            </button>
            <GraphCanvas
                ref={graphRef}
                nodes={graphData.nodes}
                edges={graphData.edges}
                onNodeClick={handleNodeClick}
                theme={holoscopeTheme}
                layoutType={layoutType}
                cameraMode={layoutType === 'radialOut3d' ? 'orbit' : 'pan'}
                edgeInterpolation="curved"
                edgeArrowPosition="end"
                minDistance={1500}
                maxDistance={5000}
                defaultNodeSize={10}
                animated={true}
                disabled={false}
            />
        </div>
    );

    const renderSidePanels = () => (
        <div className="flex-1 flex flex-col gap-8">
            <div className="flex-1 bg-white rounded-xl shadow-2xl p-6">
                <h3 className="text-2xl font-bold text-orange-500">Stream Statistics</h3>
                {/* Add stream statistics similar to CuratorDashboard metrics */}
                <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                        <span>Total Nodes</span>
                        <span className="font-bold">{graphData.nodes.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Total Connections</span>
                        <span className="font-bold">{graphData.edges.length}</span>
                    </div>
                </div>
            </div>
            <div className="flex-1 bg-white rounded-xl shadow-2xl p-6">
                <h3 className="text-2xl font-bold text-orange-500">Network Details</h3>
                {/* Add network metrics here */}
            </div>
        </div>
    );

    return (
        <div className="h-screen w-screen bg-white flex flex-col">
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10">
                <div className="relative">
                    <h1 className="text-4xl font-bold text-center text-orange-500 mb-2 bg-white bg-opacity-50 p-2 rounded-lg shadow-lg">
                        Holoscope
                    </h1>
                </div>
            </div>
            
            <div className="flex-1 relative min-h-0">
                <div 
                    ref={containerRef}
                    className="absolute inset-0"
                >
                    {dimensions.width > 0 && dimensions.height > 0 && (
                        <div style={{ width: dimensions.width, height: dimensions.height }}>
                            {renderMainGraph()}
                        </div>
                    )}
                </div>

                <div className="absolute right-8 top-8 w-[300px]">
                    {renderSidePanels()}
                </div>
            </div>

            <AnimatePresence>
                {selectedStream && (
                    <StreamModal stream={selectedStream} onClose={() => setSelectedStream(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};
