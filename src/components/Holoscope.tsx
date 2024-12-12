import { ForceGraph2D } from 'react-force-graph'
import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Stream } from '../mocks/streams'
import { populateStreams } from '../mocks/posts'
import debounce from 'lodash/debounce'
import StreamModal from './StreamModal'

export const Holoscope = () => {
    const [selectedStream, setSelectedStream] = useState<Stream | null>(null)
    const [graphData, setGraphData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] })
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const [isResizing, setIsResizing] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const graphRef = useRef<any>(null)

    // Debounced dimension update to prevent jitter
    const debouncedDimensionUpdate = useCallback(
        debounce((width: number, height: number) => {
            setDimensions({ width, height })
            setIsResizing(false)
        }, 150),
        []
    )

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setIsResizing(true)
                const { width, height } = containerRef.current.getBoundingClientRect()
                debouncedDimensionUpdate(
                    width - 32,
                    Math.min(height - 32, window.innerHeight * 0.8)
                )
            }
        }

        const resizeObserver = new ResizeObserver(updateDimensions)
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        window.addEventListener('resize', updateDimensions)

        return () => {
            resizeObserver.disconnect()
            window.removeEventListener('resize', updateDimensions)
            debouncedDimensionUpdate.cancel()
        }
    }, [debouncedDimensionUpdate])

    useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return

        const streams = populateStreams()
        setGraphData({
            nodes: streams.map(stream => ({
                ...stream,
                x: Math.random() * dimensions.width,
                y: Math.random() * dimensions.height
            })),
            links: streams.map((stream, idx) => ({
                source: stream.id,
                target: streams[(idx + 1) % streams.length].id,
                value: 1
            }))
        })
    }, [dimensions.width, dimensions.height])

    const handleNodeClick = useCallback((node: any) => {
        setSelectedStream(node)
    }, [])

    return (
        <motion.div
            className="flex-1 flex flex-col justify-center items-center bg-gradient-to-b from-white to-orange/10 p-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ width: '100%', height: '100%' }}
        >
            <h1 className="text-4xl font-bold text-center">Dial Holoscope</h1>
            <p className="text-center text-lg">
                A comprehensive view of the content network.
            </p>
            <motion.div
                ref={containerRef}
                className="holoscope-container grow self-stretch relative"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <AnimatePresence>
                    {isResizing && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex flex-col items-center gap-4 rounded-2xl">
                                <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin" />
                                <p className="text-lg text-gray-600">Adjusting view...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {dimensions.width > 0 && dimensions.height > 0 && (
                    <ForceGraph2D
                        ref={graphRef}
                        graphData={graphData}
                        nodeLabel="name"
                        nodeColor={node => node.color}
                        nodeRelSize={8}
                        onNodeClick={handleNodeClick}
                        width={dimensions.width}
                        height={dimensions.height}
                        backgroundColor="transparent"
                        linkColor={() => '#00000020'}
                        linkWidth={2}
                        cooldownTicks={50}
                        cooldownTime={2000}
                        d3AlphaDecay={0.02} // Slower decay for smoother transitions
                        d3VelocityDecay={0.3} // Additional motion dampening
                        nodeCanvasObject={(node: any, ctx, globalScale) => {
                            const label = node.name
                            const fontSize = 14 / globalScale
                            ctx.font = `${fontSize}px Arial`
                            const textWidth = ctx.measureText(label).width
                            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2)

                            ctx.fillStyle = node.color
                            ctx.beginPath()
                            ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI)
                            ctx.fill()

                            // if ((node as any).__hover) {
                            //     // Animate hover effect
                            ctx.save()
                            ctx.beginPath()
                            ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI)
                            ctx.fillStyle = node.color
                            ctx.fill()
                            ctx.restore()

                            // Label background
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
                            ctx.fillRect(
                                node.x - bckgDimensions[0] / 2,
                                node.y - bckgDimensions[1] / 2,
                                bckgDimensions[0],
                                bckgDimensions[1]
                            )

                            ctx.textAlign = 'center'
                            ctx.textBaseline = 'middle'
                            ctx.fillStyle = '#000'
                            ctx.fillText(label, node.x, node.y)
                            // }
                        }}
                        onNodeHover={node => {
                            if (node) {
                                (node as any).__hover = true
                            }
                            graphData.nodes.forEach((n: any) => {
                                if (n !== node) n.__hover = false
                            })
                        }}
                    />
                )}

                <AnimatePresence>
                    {selectedStream && (
                        <StreamModal stream={selectedStream} onClose={() => setSelectedStream(null)} />
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    )
}
