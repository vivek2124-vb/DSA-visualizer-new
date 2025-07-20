import { useRef, useEffect, useState } from "react";
import "./breadthFirstSearch.css"; // Assuming this path is correct

const BreadthFirstSearch = () => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [resultRows, setResultRows] = useState([]);

  const NODE_RADIUS = 10; // Node radius

  useEffect(() => {
    if (canvasRef.current) {
      // Set canvas dimensions - these could be dynamic
      // For this example, using fixed. The CSS handles width: 100%
      canvasRef.current.width = canvasRef.current.offsetWidth; // Use offsetWidth for initial width
      canvasRef.current.height = 300; // Fixed height, or make it dynamic
      drawGraph();
    }
    // Add resize listener if you want the canvas to redraw on window resize
    // and adjust width/height dynamically.
  }, [nodes, edges]); // Redraw when nodes or edges change

  // Debounce resize handler
  useEffect(() => {
    const handleResize = () => {
        if (canvasRef.current) {
            // Preserve drawing buffer if needed, or simply clear and redraw
            canvasRef.current.width = canvasRef.current.offsetWidth;
            // canvasRef.current.height = ...; // adjust height if necessary
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
  }, [nodes, edges]); // Re-attach if drawGraph dependencies change

  const drawGraph = (highlightEdges = []) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    edges.forEach(({ u, v, weight }) => {
      if (!nodes[u] || !nodes[v]) return;

      const highlight = highlightEdges.some(
        (e) => (e.u === u && e.v === v) || (e.u === v && e.v === u)
      );

      ctx.beginPath();
      ctx.lineWidth = highlight ? 3 : 1;
      ctx.strokeStyle = highlight ? "#00cc00" : "#94a3b8"; // Brighter green for highlight
      ctx.shadowColor = highlight ? "#00cc00" : "transparent";
      ctx.shadowBlur = highlight ? 7 : 0;

      ctx.moveTo(nodes[u].x, nodes[u].y);
      ctx.lineTo(nodes[v].x, nodes[v].y);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#1c1c1c"; // Darker text for weight
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "10px Roboto";
      ctx.fillText(
        weight,
        (nodes[u].x + nodes[v].x) / 2 + 6, // Offset for visibility
        (nodes[u].y + nodes[v].y) / 2 - 6  // Offset for visibility
      );
    });

    // Draw nodes
    nodes.forEach((node, index) => {
      ctx.beginPath();
      ctx.fillStyle = selectedNodes.includes(index) ? "#f59e0b" : "#38bdf8";
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = "#1e293b"; 
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#0f172a"; 
      ctx.font = `bold ${NODE_RADIUS * 0.8}px Roboto`; // Scale font with radius
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(index, node.x, node.y);
    });
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNodeIndex = nodes.findIndex(
      (n) => Math.hypot(n.x - x, n.y - y) < NODE_RADIUS + 2 // Add small buffer for easier clicking
    );

    if (clickedNodeIndex === -1) {
      const clampedX = Math.min(Math.max(x, NODE_RADIUS), canvas.width - NODE_RADIUS);
      const clampedY = Math.min(Math.max(y, NODE_RADIUS), canvas.height - NODE_RADIUS);
      setNodes((prev) => [...prev, { x: clampedX, y: clampedY }]);
    } else {
      setSelectedNodes((prevSelected) => {
        if (prevSelected.includes(clickedNodeIndex)) {
          return prevSelected.filter((i) => i !== clickedNodeIndex);
        }
        const updatedSelected = [...prevSelected, clickedNodeIndex];
        if (updatedSelected.length === 2) {
          const [u, v] = updatedSelected;
          const edgeExists = edges.some(
            (edge) =>
              (edge.u === u && edge.v === v) ||
              (edge.u === v && edge.v === u)
          );
          if (u !== v && !edgeExists) {
            const weight = Math.floor(Math.random() * 20) + 1;
            setEdges((prevEdges) => [...prevEdges, { u, v, weight }]);
          }
          return []; 
        }
        return updatedSelected;
      });
    }
  };

  const resetGraph = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNodes([]);
    setResultRows([]);
    if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const generateRandomGraph = () => {
    resetGraph();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const nodeCount = Math.floor(Math.random() * 4) + 5; // 5 to 8 nodes
    const graphRadius = Math.min(canvas.width, canvas.height) * 0.30; // Smaller radius
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const newNodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = (2 * Math.PI * i) / nodeCount;
      const x = centerX + graphRadius * Math.cos(angle) + (Math.random() - 0.5) * 20;
      const y = centerY + graphRadius * Math.sin(angle) + (Math.random() - 0.5) * 20;
      newNodes.push({ 
        x: Math.min(Math.max(x, NODE_RADIUS), canvas.width - NODE_RADIUS), 
        y: Math.min(Math.max(y, NODE_RADIUS), canvas.height - NODE_RADIUS)
      });
    }
    setNodes(newNodes);

    const newEdges = [];
    if (nodeCount > 1) { // Ensure at least two nodes to form edges
        for (let i = 0; i < nodeCount -1; i++) {
             if(newNodes[i] && newNodes[i+1]){
                const weight = Math.floor(Math.random() * 20) + 1;
                newEdges.push({ u: i, v: i + 1, weight });
            }
        }
        // Add a closing edge for a cycle if more than 2 nodes
        if (nodeCount > 2) {
            const weight = Math.floor(Math.random() * 20) + 1;
            newEdges.push({ u: nodeCount -1, v: 0, weight});
        }
    }
    
    const additionalEdges = Math.floor(nodeCount / 3); // Fewer additional edges
    for (let k = 0; k < additionalEdges; k++) {
        let u = Math.floor(Math.random() * nodeCount);
        let v = Math.floor(Math.random() * nodeCount);
        const edgeExists = newEdges.some(edge => (edge.u === u && edge.v ===v) || (edge.u ===v && edge.v ===u));
        if (u !== v && !edgeExists && newNodes[u] && newNodes[v]) {
            const weight = Math.floor(Math.random() * 20) + 1;
            newEdges.push({ u, v, weight });
        }
    }
    setEdges(newEdges);
  };

  const startBFS = async () => {
    if (nodes.length === 0) {
      // Consider adding a user-friendly message here, e.g., using a state variable
      // For now, console log is fine.
      console.log("Graph is empty. Add nodes or generate a random graph.");
      return;
    }

    setResultRows([]); 
    const visited = Array(nodes.length).fill(false);
    const queue = []; 
    const startNodeIndex = 0; 

    if (nodes[startNodeIndex]) { // Check if start node exists
        queue.push(startNodeIndex);
        visited[startNodeIndex] = true;
    } else if (nodes.length > 0) { // Fallback if node 0 doesn't exist but others do
        queue.push(0); // This will likely cause issues if node 0 is not the actual first node index.
                       // A better approach would be to pick the first available node index.
                       // For simplicity, sticking to 0, but this is a potential bug if nodes are not 0-indexed.
        visited[0] = true;
    } else {
        return; // No nodes to start BFS
    }
    
    const edgeSetForHighlight = []; 

    setResultRows(prevRows => [...prevRows, {
        visited: visited.map((v, i) => (v ? i : null)).filter(v => v !== null).join(", "),
        queue: queue.join(", "),
        edge: "Start",
        weight: "-",
    }]);
    drawGraph(edgeSetForHighlight); 
    await new Promise((res) => setTimeout(res, 700)); 

    while (queue.length > 0) {
      const u = queue.shift(); 

      for (let edge of edges) {
        let v = -1;
        if (edge.u === u && nodes[edge.v] && !visited[edge.v]) {
          v = edge.v;
        } else if (edge.v === u && nodes[edge.u] && !visited[edge.u]) {
          v = edge.u;
        }

        if (v !== -1) {
          visited[v] = true;
          queue.push(v);
          edgeSetForHighlight.push(edge); 
          
          const newRow = {
            visited: visited
              .map((val, i) => (val ? i : null))
              .filter(val => val !== null)
              .join(", "),
            queue: [...queue].join(", "), 
            edge: `${edge.u} - ${edge.v}`,
            weight: edge.weight,
          };
          setResultRows(prevRows => [...prevRows, newRow]);
          
          drawGraph(edgeSetForHighlight); 
          await new Promise((res) => setTimeout(res, 700)); 
        }
      }
    }
    drawGraph(edgeSetForHighlight); 
  };

  return (
    // Using class names from breadthFirstSearch.css
    <div className="container">
      <h1>BFS Graph Visualizer</h1> {/* CSS has h1 tag selector */}
      <div className="grid-container">
        {/* Table section - styled by table, th, td tag selectors in CSS */}
        <div style={{overflowX: "auto", maxHeight: "450px", overflowY: "auto"}}> {/* Added inline style for scrollable table container */}
          <table>
            <thead>
              <tr>
                <th>Visited</th>
                <th>Queue</th>
                <th>Edge Traversed</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {resultRows.length === 0 ? (
                <tr>
                    <td colSpan="4" style={{textAlign: "center"}}>Click "Start BFS" to see the steps.</td>
                </tr>
              ) : (
                resultRows.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.visited}</td>
                    <td>{row.queue}</td>
                    <td>{row.edge}</td>
                    <td>{row.weight}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Canvas and Controls section */}
        <div> {/* This div will be the second item in the grid-container */}
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            // Canvas tag selector in CSS handles border, background, margin, width
          />
          <div className="controls">
            {/* Button tag selector in CSS handles styling */}
            <button onClick={generateRandomGraph}>
              Generate Random Graph
            </button>
            <button onClick={resetGraph}>
              Reset Graph
            </button>
            <button 
              onClick={startBFS}
              disabled={nodes.length === 0}
            >
              Start BFS
            </button>
          </div>
        </div>
      </div>
      <div className="complexity">
        <strong>Time Complexity (BFS):</strong> O(V + E) where V is vertices, E is edges.
      </div>
    </div>
  );
};

export default BreadthFirstSearch;
