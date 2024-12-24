// Types
export interface Point {
    id: string;
    coordinates: number[];
}

export interface GraphData {
    nodes: any[];
    edges: any[];
}

// Data processing utilities
export const processGraphData = (relations: Record<string, Record<string, number>>): GraphData => {
    // First, collect all unique node IDs (both sources and targets)
    const nodeIds = new Set<string>();
    Object.keys(relations).forEach(source => {
        nodeIds.add(source);
        Object.keys(relations[source]).forEach(target => {
            nodeIds.add(target);
        });
    });

    // Create nodes for all IDs
    const nodes = Array.from(nodeIds).map(id => ({
        id,
        label: id,
        data: {
            id,
            posts: [],
            cluster: id.split('/')[0]
        }
    }));

    // Create edges only for non-zero weights
    const edges = Object.entries(relations).flatMap(([source, targets]) => 
        Object.entries(targets)
            .filter(([_, weight]) => weight > 0) // Only include edges with weight > 0
            .map(([target, weight]) => ({
                id: `${source}-${target}`,
                source,
                target,
                weight // Optionally keep the weight information
            }))
    );

    return { nodes, edges };
};

export const louvainClustering = (graphData: GraphData): Map<string, number> => {
    const nodeMap = new Map<string, number>();
    if (!graphData.nodes.length) return nodeMap;

    // Initialize communities and edge weights
    const communities = new Map<string, number>();
    const weights = new Map<string, Map<string, number>>();
    let totalWeight = 0;

    // Initialize each node in its own community
    graphData.nodes.forEach((node, index) => {
        communities.set(node.id, index);
        weights.set(node.id, new Map());
    });

    // Build weight matrix and calculate total weight
    graphData.edges.forEach(edge => {
        const w = edge.weight || 1;
        weights.get(edge.source)?.set(edge.target, w);
        weights.get(edge.target)?.set(edge.source, w);
        totalWeight += w;
    });

    // Single pass of community detection
    let improved = true;
    let iterations = 0;
    const MAX_ITERATIONS = 5; // Limit iterations for performance

    while (improved && iterations < MAX_ITERATIONS) {
        improved = false;
        iterations++;

        for (const node of graphData.nodes) {
            const nodeId = node.id;
            const currentComm = communities.get(nodeId)!;
            const neighborComms = new Map<number, number>();

            // Get neighboring communities and their weights
            weights.get(nodeId)?.forEach((weight, neighbor) => {
                const neighborComm = communities.get(neighbor)!;
                neighborComms.set(
                    neighborComm,
                    (neighborComms.get(neighborComm) || 0) + weight
                );
            });

            // Find best community
            let bestComm = currentComm;
            let bestGain = 0;

            neighborComms.forEach((weight, comm) => {
                if (comm !== currentComm && weight > bestGain) {
                    bestGain = weight;
                    bestComm = comm;
                }
            });

            // Move to best community if there's improvement
            if (bestGain > 0 && bestComm !== currentComm) {
                communities.set(nodeId, bestComm);
                improved = true;
            }
        }
    }

    // Renumber communities sequentially
    const uniqueComms = new Map<number, number>();
    let nextComm = 0;

    communities.forEach((comm, nodeId) => {
        if (!uniqueComms.has(comm)) {
            uniqueComms.set(comm, nextComm++);
        }
        nodeMap.set(nodeId, uniqueComms.get(comm)!);
    });

    return nodeMap;
};
// Replace the existing calculateKMeansClusters with:
export const calculateClusters = (graphData: GraphData): Map<string, number> => {
    return louvainClustering(graphData);
};
