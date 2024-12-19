import { GraphCanvas, GraphCanvasRef, useSelection, Theme, darkTheme } from 'reagraph'
import { useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Stream } from '../mocks/streams'
import { populateStreams } from '../mocks/posts'
import StreamModal from './StreamModal'

const holoscopeTheme: Theme = {
    canvas: { background: 'linear-gradient(135deg, #ff7e5f, #feb47b)' },
    node: {
      fill: '#7CA0AB',
      activeFill: '#1DE9AC',
      opacity: 1,
      selectedOpacity: 1,
      inactiveOpacity: 0.2,
      label: {
        color: '#000000', // black color
        stroke: 'transparent', // black color
        activeColor: '#1DE9AC'
      },
      subLabel: {
        color: '#000000', // black color
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
    const [isClustered, setIsClustered] = useState(false);

    // Add useSelection hook
    const {
        selections,
        actives,
        onNodePointerOver,
        onNodePointerOut
    } = useSelection({
        ref: graphRef,
        nodes: graphData.nodes,
        edges: graphData.edges,
        pathHoverType: 'all'
    });

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
            edges: streams.flatMap((stream) => {
                const clusterMembers = streams.filter(s => s.cluster === stream.cluster && s.id !== stream.id);
                if (clusterMembers.length === 0) return [];
                const randomTargetIndex = Math.floor(Math.random() * clusterMembers.length);
                return {
                    id: `${stream.id}-${clusterMembers[randomTargetIndex].id}`,
                    source: stream.id,
                    target: clusterMembers[randomTargetIndex].id,
                    label: '',
                }
            })
        })
    }, [dimensions.width, dimensions.height])

    // Watch both layoutType and isClustered changes
    useEffect(() => {
        // Small timeout to ensure layout has updated before centering
        setTimeout(() => {
            graphRef.current?.fitNodesInView();
        }, 100);
    }, [layoutType, isClustered]); // Add isClustered to dependency array

    // Separate panel rendering logic
    const renderMainGraph = () => (
        <div className="absolute inset-0 w-full h-full">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <button 
                    onClick={() => {
                        setLayoutType(prev => {
                            const newLayout = prev === 'radialOut2d' ? 'radialOut3d' : 'radialOut2d';
                            if (newLayout === 'radialOut3d') {
                                setIsClustered(false); // Turn off clustering in 3D
                            }
                            return newLayout;
                        });
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                    Switch to {layoutType === 'radialOut2d' ? '3D' : '2D'} Layout
                </button>
                {layoutType !== 'radialOut3d' && ( // Only show clustering button in 2D
                    <button 
                        onClick={() => setIsClustered(prev => !prev)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        {isClustered ? 'Disable' : 'Enable'} Clustering
                    </button>
                )}
            </div>
            <GraphCanvas
                ref={graphRef}
                nodes={graphData.nodes}
                edges={graphData.edges}
                onNodeClick={handleNodeClick}
                theme={holoscopeTheme}
                layoutType={isClustered 
                    ? 'forceDirected2d'
                    : (layoutType === 'radialOut3d' ? 'radialOut3d' : 'radialOut2d')}
                cameraMode={layoutType === 'radialOut3d' ? 'orbit' : 'pan'}
                edgeInterpolation="curved"
                edgeArrowPosition="end"
                minDistance={1500}
                maxDistance={5000}
                defaultNodeSize={10}
                animated={true}
                disabled={false}
                clusterAttribute={isClustered ? "cluster" : undefined}
                selections={selections}
                actives={actives}
                onNodePointerOver={onNodePointerOver}
                onNodePointerOut={onNodePointerOut}
            />
        </div>
    );

    const renderSidePanels = () => {
        // Calculate statistics
        const totalStreams = graphData.nodes.length;
        const totalPosts = graphData.nodes.reduce((sum, node) => 
            sum + (node.data.posts?.length || 0), 0);
        

        return (
            <div className="flex-1 flex flex-col gap-8">
                <div className="flex-1 bg-white rounded-xl shadow-2xl p-6">
                    <h3 className="text-2xl font-bold text-orange-500">Stream Statistics</h3>
                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between">
                            <span>Total Streams</span>
                            <span className="font-bold">{totalStreams}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Posts</span>
                            <span className="font-bold">{totalPosts}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Most Active User</span>
                            <span className="font-bold">
                                    Elon Musk 
                            </span>  
                        </div>  
                        <div className="flex justify-between">
                            <span>Total Clusters</span>
                            <span className="font-bold">{new Set(graphData.nodes.map(node => node.data.cluster)).size}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-screen w-screen bg-white flex flex-col">
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

                {layoutType !== 'radialOut3d' && (
                    <div className="absolute right-8 top-8 w-[300px]">
                        {renderSidePanels()}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedStream && layoutType !== 'radialOut3d' && (
                    <StreamModal stream={selectedStream} onClose={() => setSelectedStream(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};
