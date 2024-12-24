import { GraphCanvas, GraphCanvasRef, useSelection, Theme, NodePositionArgs, InternalGraphEdge, InternalGraphNode, ForceDirectedLayoutInputs, lightTheme } from 'reagraph'
// import { LayoutOverrides } from 'reagraph/dist/layout/types'
import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Stream } from '../mocks/streams'
import StreamModal from './StreamModal' 
import { processGraphData, calculateClusters } from '../utilities/holoscope'

export const Holoscope = () => {
    const [selectedStream, setSelectedStream] = useState<Stream | null>(null)
    const [graphData, setGraphData] = useState<{ nodes: any[], edges: any[] }>({ nodes: [], edges: [] })
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const containerRef = useRef<HTMLDivElement>(null)
    const graphRef = useRef<GraphCanvasRef>(null)
    const [is3D, setIs3D] = useState(false)
    const [isClustered, setIsClustered] = useState(false)
    const [similarityMatrix, setSimilarityMatrix] = useState<Record<string, Record<string, number>>>({});

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

    // Data fetching effect
    useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return;

        const fetchGraphData = async () => {
            try {
                const response = await fetch('/holoscope/holoscope-load-balancer:holoscope-load-balancer:template.os/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ GetStreamSimilarityMap: null })
                });
                
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const matrix = await response.json();
                setSimilarityMatrix(matrix);
                
                // Create nodes from matrix keys
                const nodes = Object.keys(matrix).map(id => ({
                    id,
                    label: id,
                    data: { id }
                }));
                
                setGraphData({
                    nodes,
                    edges: [] // We'll use the matrix for relationships instead of edges
                });
            } catch (error) {
                console.error('Error fetching graph data:', error);
            }
        };

        fetchGraphData();
        const intervalId = setInterval(fetchGraphData, 30000);
        return () => clearInterval(intervalId);
    }, [dimensions.width, dimensions.height]);

    // Watch both layoutType and isClustered changes
    useEffect(() => {
        if (!graphData.nodes.length) return; // Don't try to fit if no nodes

        const timer = setTimeout(() => {
            if (graphRef.current) {
                graphRef.current.fitNodesInView();
            }
        }, 500); // Increased timeout to ensure graph is ready

        return () => clearTimeout(timer);
    }, [is3D, isClustered, graphData.nodes]); // Add graphData.nodes to dependencies

    // K-means calculation (now used whenever clustering is enabled)
    useMemo(() => {
        if (!isClustered) return;
        
        // Print similarity matrix in a readable format
        console.group('Similarity Matrix');
        const nodes = graphData.nodes.map(n => n.id);
        const matrix: Record<string, Record<string, number>> = {};
        
        // Initialize matrix
        nodes.forEach(source => {
            matrix[source] = {};
            nodes.forEach(target => {
                matrix[source][target] = 0;
            });
        });
        
        // Fill matrix with edge weights
        graphData.edges.forEach(edge => {
            matrix[edge.source][edge.target] = edge.weight || 0;
            matrix[edge.target][edge.source] = edge.weight || 0; // Assuming undirected graph
        });
        
        // Print matrix in table format
        console.table(matrix);
        console.groupEnd();
        
        const clusters = calculateClusters(graphData);
        
        // Print clustering results
        console.group('Clustering Results');
        const clusterGroups: Record<number, string[]> = {};
        clusters.forEach((cluster, nodeId) => {
            if (!clusterGroups[cluster]) clusterGroups[cluster] = [];
            clusterGroups[cluster].push(nodeId);
        });
        console.table(clusterGroups);
        console.groupEnd();
        
        // Update node data with cluster information
        graphData.nodes.forEach(node => {
            node.data.cluster = clusters.get(node.id);
        });
    }, [graphData, isClustered]);

    // Separate panel rendering logic
    const renderMainGraph = () => (
        <div className="absolute inset-0 w-full h-full">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <button 
                    onClick={() => {
                        setIs3D((prev: boolean) => {
                            if (!prev) setIsClustered(false);
                            return !prev;
                        });
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                    {is3D ? '2D View' : '3D View'}
                </button>
                {!is3D && (
                    <button 
                        onClick={() => setIsClustered(prev => !prev)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        {isClustered ? 'Disable' : 'Enable'} Clustering
                    </button>
                )}
            </div>
            {graphData.nodes.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-xl text-gray-500">Loading graph data...</div>
                </div>
            ) : (
                <GraphCanvas
                    ref={graphRef}
                    nodes={graphData.nodes}
                    edges={graphData.edges}
                    onNodeClick={handleNodeClick}
                    theme={{
                        ...lightTheme,
                        node: {
                            ...lightTheme.node,
                            label: {
                                ...lightTheme.node.label,
                                color: '#000000',
                                stroke: '#ffffff',
                            }
                        }
                    }}
                    layoutType={isClustered 
                        ? 'forceDirected2d'
                        : (is3D ? 'radialOut3d' : "radialOut2d")}
                    cameraMode={is3D ? 'orbit' : 'pan'}
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
                    onNodePointerOver={(!is3D && !isClustered) ? undefined : onNodePointerOver}
                    onNodePointerOut={(!is3D && !isClustered) ? undefined : onNodePointerOut}
                />
            )}
        </div>
    );

    const renderSidePanels = () => {
        // Add null checks and default values
        const totalStreams = graphData.nodes.length;
        const totalPosts = graphData.nodes.reduce((sum, node) => 
            sum + ((node.data?.posts?.length) || 0), 0);
        

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

                {is3D !== true && (
                    <div className="absolute right-8 top-8 w-[300px]">
                        {renderSidePanels()}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedStream && is3D !== true && (
                    <StreamModal stream={selectedStream} onClose={() => setSelectedStream(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};
