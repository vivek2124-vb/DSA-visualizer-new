import React, { useRef, useState, useEffect, useCallback } from "react";
import "./dijkstrasAlgorithm.css"; // Ensure this CSS file is updated

// Priority Queue Implementation (Min-Heap) for Dijkstra's
class PriorityQueue {
  constructor() {
    this.values = [];
  }
  enqueue(val, priority) {
    this.values.push({ val, priority });
    this.sort();
  }
  dequeue() {
    return this.values.shift();
  }
  sort() {
    this.values.sort((a, b) => a.priority - b.priority);
  }
  isEmpty() {
    return this.values.length === 0;
  }
}

const DijkstrasAlgorithm = () => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]); // Array of { id: number, x: number, y: number }
  const [edges, setEdges] = useState([]); // Array of { u: number, v: number, weight: number }
  const [selectedNodes, setSelectedNodes] = useState([]); // Stores indices of selected nodes for edge creation
  const [tableData, setTableData] = useState([]); // For Dijkstra's steps table
  const [message, setMessage] = useState({ text: "", type: "" }); // For user feedback
  
  // For visualization state during Dijkstra's
  const [currentNodeDijkstra, setCurrentNodeDijkstra] = useState(null);
  const [visitedDijkstra, setVisitedDijkstra] = useState(new Set());
  const [pathEdgesDijkstra, setPathEdgesDijkstra] = useState([]); // Edges in the final shortest path
  const [relaxedEdgesDijkstra, setRelaxedEdgesDijkstra] = useState([]); // Edges currently being relaxed

  const NODE_RADIUS = 10;
  const ANIMATION_DELAY = 700;

  const clearMessage = () => setMessage({ text: "", type: "" });

  const displayMessage = (text, type = "info", duration = 3000) => {
    setMessage({ text, type });
    setTimeout(clearMessage, duration);
  };

  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    edges.forEach(({ u, v, weight }) => {
      if (!nodes[u] || !nodes[v]) return;

      const isPathEdge = pathEdgesDijkstra.some(pathEdge => (pathEdge.u === u && pathEdge.v === v) || (pathEdge.u === v && pathEdge.v === u));
      const isRelaxedEdge = relaxedEdgesDijkstra.some(relEdge => (relEdge.u === u && relEdge.v === v) || (relEdge.u === v && relEdge.v === u));
      
      ctx.beginPath();
      ctx.lineWidth = isPathEdge ? 3.5 : (isRelaxedEdge ? 2.5 : 1);
      ctx.strokeStyle = isPathEdge ? "#16a34a" : (isRelaxedEdge ? "#fb923c" : "#94a3b8");
      
      ctx.moveTo(nodes[u].x, nodes[u].y);
      ctx.lineTo(nodes[v].x, nodes[v].y);
      ctx.stroke();

      ctx.fillStyle = "#1c1c1c";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "10px Roboto";
      ctx.fillText(
        weight,
        (nodes[u].x + nodes[v].x) / 2 + 6,
        (nodes[u].y + nodes[v].y) / 2 - 6
      );
    });

    // Draw nodes
    nodes.forEach((node, index) => {
      ctx.beginPath();
      let fillStyle = "#38bdf8"; // Default
      if (selectedNodes.includes(index)) fillStyle = "#f59e0b"; // Selected for edge creation
      else if (index === currentNodeDijkstra) fillStyle = "#facc15"; // Current in Dijkstra
      else if (visitedDijkstra.has(index)) fillStyle = "#a5b4fc"; // Visited in Dijkstra
      
      ctx.fillStyle = fillStyle;
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = (index === currentNodeDijkstra) ? "#a16207" : "#1e293b";
      ctx.lineWidth = (index === currentNodeDijkstra) ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = "#0f172a"; 
      ctx.font = `bold ${NODE_RADIUS * 0.8}px Roboto`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(index, node.x, node.y); // Use index as ID
    });
  }, [nodes, edges, selectedNodes, currentNodeDijkstra, visitedDijkstra, pathEdgesDijkstra, relaxedEdgesDijkstra]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.offsetWidth;
      canvasRef.current.height = 350; 
      drawGraph();
    }
  }, [nodes, edges, drawGraph]); // drawGraph is a dependency

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        drawGraph();
      }
    };
    let timeoutId;
    const debouncedHandleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };
    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      clearTimeout(timeoutId);
    };
  }, [drawGraph]);


  const handleCanvasClick = (e) => {
    clearMessage();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNodeIndex = nodes.findIndex(
      (n) => Math.hypot(n.x - x, n.y - y) < NODE_RADIUS + 3
    );

    if (clickedNodeIndex === -1) {
      const newNodeId = nodes.length;
      const clampedX = Math.min(Math.max(x, NODE_RADIUS), canvas.width - NODE_RADIUS);
      const clampedY = Math.min(Math.max(y, NODE_RADIUS), canvas.height - NODE_RADIUS);
      setNodes((prev) => [...prev, { id: newNodeId, x: clampedX, y: clampedY }]);
    } else {
      setSelectedNodes((prevSelected) => {
        if (prevSelected.includes(clickedNodeIndex)) {
          return prevSelected.filter((i) => i !== clickedNodeIndex);
        }
        const updatedSelected = [...prevSelected, clickedNodeIndex];
        if (updatedSelected.length === 2) {
          const [u, v] = updatedSelected;
          const weightStr = prompt(`Enter weight for edge between node ${u} and ${v}:`, "1");
          const weight = parseInt(weightStr);

          if (weightStr === null) { // User cancelled prompt
            return [];
          }
          if (isNaN(weight) || weight <= 0) {
            displayMessage("Invalid weight. Please enter a positive number.", "error");
            return []; // Reset selection
          }
          
          const edgeExists = edges.some(
            (edge) => (edge.u === u && edge.v === v) || (edge.u === v && edge.v === u)
          );
          if (u !== v && !edgeExists) {
            setEdges((prevEdges) => [...prevEdges, { u, v, weight }]);
          } else if (edgeExists) {
            displayMessage("Edge already exists.", "error");
          }
          return []; 
        }
        return updatedSelected;
      });
    }
  };

  const resetGraph = () => {
    clearMessage();
    setNodes([]);
    setEdges([]);
    setSelectedNodes([]);
    setTableData([]);
    setCurrentNodeDijkstra(null);
    setVisitedDijkstra(new Set());
    setPathEdgesDijkstra([]);
    setRelaxedEdgesDijkstra([]);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const generateRandomGraph = () => {
    resetGraph();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const nodeCount = Math.floor(Math.random() * 4) + 5; // 5 to 8 nodes
    const graphRadius = Math.min(canvas.width, canvas.height) * 0.30;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const newNodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = (2 * Math.PI * i) / nodeCount;
      const x = centerX + graphRadius * Math.cos(angle) + (Math.random() - 0.5) * 20;
      const y = centerY + graphRadius * Math.sin(angle) + (Math.random() - 0.5) * 20;
      newNodes.push({ 
        id: i,
        x: Math.min(Math.max(x, NODE_RADIUS), canvas.width - NODE_RADIUS), 
        y: Math.min(Math.max(y, NODE_RADIUS), canvas.height - NODE_RADIUS)
      });
    }
    
    const newEdges = [];
    if (nodeCount > 1) {
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          if (Math.random() < 0.45) { // Adjust density
             const weight = Math.floor(Math.random() * 15) + 1; // Weights 1-15
             newEdges.push({ u: i, v: j, weight });
          }
        }
      }
       // Ensure graph is connected (simple way, not guaranteed for all random graphs)
      if (newEdges.length === 0 && nodeCount > 1) {
        for(let i=0; i< nodeCount -1; ++i){
            const weight = Math.floor(Math.random() * 15) + 1;
            newEdges.push({u: i, v: i+1, weight});
        }
      }
    }
    setNodes(newNodes); // Set nodes first
    setEdges(newEdges); // Then edges
  };

  const startDijkstra = async () => {
    clearMessage();
    if (nodes.length === 0) {
      displayMessage("Graph is empty. Add nodes and edges first.", "error");
      return;
    }

    const startIdStr = prompt("Enter starting node ID (index):");
    const endIdStr = prompt("Enter destination node ID (index):");

    if (startIdStr === null || endIdStr === null) { // User cancelled
        displayMessage("Dijkstra's algorithm cancelled.", "info");
        return;
    }

    const startNodeId = parseInt(startIdStr);
    const endNodeId = parseInt(endIdStr);

    if (
      isNaN(startNodeId) || isNaN(endNodeId) ||
      startNodeId < 0 || startNodeId >= nodes.length ||
      endNodeId < 0 || endNodeId >= nodes.length
    ) {
      displayMessage("Invalid node IDs. Please enter valid indices.", "error");
      return;
    }

    // Reset visualization states
    setCurrentNodeDijkstra(null);
    setVisitedDijkstra(new Set());
    setPathEdgesDijkstra([]);
    setRelaxedEdgesDijkstra([]);

    const numNodes = nodes.length;
    const dist = new Array(numNodes).fill(Infinity);
    const prev = new Array(numNodes).fill(null); // Stores {nodeId: number, edge: object}
    
    dist[startNodeId] = 0;

    const pq = new PriorityQueue();
    pq.enqueue(startNodeId, 0);

    const initialTable = nodes.map((node, i) => ({
      node: i,
      distance: i === startNodeId ? 0 : "∞",
      previous: "-",
    }));
    setTableData(initialTable);
    await new Promise(res => setTimeout(res, ANIMATION_DELAY / 2));


    const adj = Array(numNodes).fill(null).map(() => []);
    edges.forEach(edge => {
        adj[edge.u].push({ node: edge.v, weight: edge.weight, originalEdge: edge });
        adj[edge.v].push({ node: edge.u, weight: edge.weight, originalEdge: edge });
    });

    let step = 0;

    while (!pq.isEmpty()) {
      const { val: u, priority: currentDistU } = pq.dequeue();

      if (currentDistU > dist[u]) continue; // Skip if a shorter path was already found
      if (visitedDijkstra.has(u)) continue; // Already processed this node with its shortest path

      setCurrentNodeDijkstra(u);
      setVisitedDijkstra(prevVisited => new Set(prevVisited).add(u));
      setRelaxedEdgesDijkstra([]); // Clear previously relaxed edges for this step

      // Update table for current node u processing
      const currentTableData = nodes.map((node, i) => ({
          node: i,
          distance: dist[i] === Infinity ? "∞" : dist[i],
          previous: prev[i] !== null ? `${prev[i].nodeId} (via ${prev[i].edge.u}-${prev[i].edge.v})` : "-",
          status: i === u ? "Current" : (visitedDijkstra.has(i) ? "Visited" : "")
      }));
      setTableData(currentTableData);
      await new Promise(res => setTimeout(res, ANIMATION_DELAY));


      if (u === endNodeId) {
        displayMessage(`Shortest path found to node ${endNodeId}!`, "info");
        break; // Found shortest path to destination
      }
      
      let tempRelaxedEdges = [];
      for (const { node: v, weight, originalEdge } of adj[u]) {
        if (!visitedDijkstra.has(v)) { // Only consider unvisited neighbors for relaxation
            tempRelaxedEdges.push(originalEdge);
            const alt = dist[u] + weight;
            if (alt < dist[v]) {
              dist[v] = alt;
              prev[v] = { nodeId: u, edge: originalEdge };
              pq.enqueue(v, alt);
            }
        }
      }
      setRelaxedEdgesDijkstra(tempRelaxedEdges);
      // Update table after relaxing edges from u
      const relaxedTableData = nodes.map((node, i) => ({
          node: i,
          distance: dist[i] === Infinity ? "∞" : dist[i],
          previous: prev[i] !== null ? `${prev[i].nodeId} (via ${prev[i].edge.u}-${prev[i].edge.v})` : "-",
          status: i === u ? "Processed" : (visitedDijkstra.has(i) ? "Visited" : "")
      }));
      setTableData(relaxedTableData);
      await new Promise(res => setTimeout(res, ANIMATION_DELAY));
      step++;
    }
    
    setCurrentNodeDijkstra(null); // Done processing
    setRelaxedEdgesDijkstra([]);

    // Reconstruct and highlight path
    const path = [];
    const finalPathEdges = [];
    let curr = endNodeId;
    while (curr !== null && prev[curr] !== null) {
      path.unshift(curr);
      const prevNodeInfo = prev[curr];
      if (prevNodeInfo) {
        finalPathEdges.push(prevNodeInfo.edge);
        curr = prevNodeInfo.nodeId;
      } else {
        break; 
      }
    }
    if (path.length > 0 || startNodeId === endNodeId) {
        path.unshift(startNodeId); // Add start node to path
    }
    
    if (dist[endNodeId] === Infinity && startNodeId !== endNodeId) {
        displayMessage(`Node ${endNodeId} is not reachable from node ${startNodeId}.`, "error");
    } else {
        setPathEdgesDijkstra(finalPathEdges);
        displayMessage(`Dijkstra's algorithm complete. Shortest distance to ${endNodeId} is ${dist[endNodeId]}.`, "info");
    }
     // Final table update
    const finalTableData = nodes.map((node, i) => ({
        node: i,
        distance: dist[i] === Infinity ? "∞" : dist[i],
        previous: prev[i] !== null ? `${prev[i].nodeId} (via ${prev[i].edge.u}-${prev[i].edge.v})` : "-",
        status: path.includes(i) ? "Path" : (visitedDijkstra.has(i) ? "Visited" : "")
    }));
    setTableData(finalTableData);
  };


  return (
    <div className="container">
      <h1>Dijkstra's Algorithm Visualizer</h1>
      {message.text && (
        <div className={`message-area ${message.type === 'error' ? 'message-error' : 'message-info'}`}>
          {message.text}
        </div>
      )}
      <div className="grid-container">
        <div style={{overflowX: "auto", maxHeight: "450px", overflowY: "auto"}}>
          <table>
            <thead>
              <tr>
                <th>Node</th>
                <th>Distance from Start</th>
                <th>Previous Node (Edge)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length === 0 && nodes.length > 0 ? (
                 nodes.map((node, idx) => (
                    <tr key={idx}>
                        <td>{idx}</td>
                        <td>∞</td>
                        <td>-</td>
                        <td></td>
                    </tr>
                 ))
              ) : tableData.length === 0 && nodes.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{textAlign: "center"}}>Graph is empty. Add nodes or generate a graph.</td>
                </tr>
              ) : (
                tableData.map((row) => (
                  <tr key={row.node}>
                    <td>{row.node}</td>
                    <td>{row.distance}</td>
                    <td>{row.previous}</td>
                    <td>{row.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div>
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            // width and height are set in useEffect, CSS handles responsive width
          />
          <div className="controls">
            <button onClick={startDijkstra} disabled={nodes.length === 0}>
              Start Dijkstra
            </button>
            <button onClick={resetGraph}>
              Reset Graph
            </button>
            <button onClick={generateRandomGraph}>
              Generate Random Graph
            </button>
          </div>
        </div>
      </div>
      <div className="complexity">
        <strong>Time Complexity (Dijkstra with Priority Queue):</strong> O((V + E) log V)
      </div>
    </div>
  );
};

export default DijkstrasAlgorithm;
