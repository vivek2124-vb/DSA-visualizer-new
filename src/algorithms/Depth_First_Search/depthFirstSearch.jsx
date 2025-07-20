import React, { useRef, useState, useEffect } from "react";
import "./depthFirstSearch.css"; // Ensure this CSS file is created and styled as above

const DepthFirstSearch = () => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [resultRows, setResultRows] = useState([]);

  const NODE_RADIUS = 10; // Consistent node radius

  // Effect for initial canvas setup and drawing on node/edge changes
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.offsetWidth;
      canvasRef.current.height = 350; // Adjust height as needed, or make dynamic
      drawGraph();
    }
  }, [nodes, edges]);

  // Effect for handling window resize and redrawing canvas
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        // Adjust height on resize if necessary, e.g., maintain aspect ratio or fixed height
        // canvasRef.current.height = 350; 
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
  }, [nodes, edges, drawGraph]); // drawGraph is a dependency if it's not memoized and defined outside


  // Function to draw the graph (nodes and edges)
  // Memoize drawGraph if it becomes complex or causes performance issues
  // For now, keeping it as a direct function definition
  function drawGraph(highlightEdges = []) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    edges.forEach(({ u, v, weight }) => {
      if (!nodes[u] || !nodes[v]) return; // Ensure nodes exist

      const highlight = highlightEdges.some(
        (e) => (e.u === u && e.v === v) || (e.u === v && e.v === u)
      );

      ctx.beginPath();
      ctx.lineWidth = highlight ? 3 : 1;
      ctx.strokeStyle = highlight ? "#00cc00" : "#94a3b8"; // Green for highlight
      ctx.shadowColor = highlight ? "#00cc00" : "transparent";
      ctx.shadowBlur = highlight ? 7 : 0;

      ctx.moveTo(nodes[u].x, nodes[u].y);
      ctx.lineTo(nodes[v].x, nodes[v].y);
      ctx.stroke();

      ctx.shadowBlur = 0;
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
      ctx.fillStyle = selectedNodes.includes(index) ? "#f59e0b" : "#38bdf8"; // Amber if selected
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = "#1e293b"; 
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#0f172a"; 
      ctx.font = `bold ${NODE_RADIUS * 0.8}px Roboto`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(index, node.x, node.y);
    });
  }


  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNodeIndex = nodes.findIndex(
      (n) => Math.hypot(n.x - x, n.y - y) < NODE_RADIUS + 2 // Click buffer
    );

    if (clickedNodeIndex === -1) {
      // Add new node, ensuring it's within canvas bounds
      const clampedX = Math.min(Math.max(x, NODE_RADIUS), canvas.width - NODE_RADIUS);
      const clampedY = Math.min(Math.max(y, NODE_RADIUS), canvas.height - NODE_RADIUS);
      setNodes((prev) => [...prev, { x: clampedX, y: clampedY }]);
    } else {
      // Handle node selection for creating edges
      setSelectedNodes((prevSelected) => {
        if (prevSelected.includes(clickedNodeIndex)) {
          return prevSelected.filter((i) => i !== clickedNodeIndex); // Deselect
        }
        const updatedSelected = [...prevSelected, clickedNodeIndex];
        if (updatedSelected.length === 2) {
          const [u, v] = updatedSelected;
          const edgeExists = edges.some(
            (edge) => (edge.u === u && edge.v === v) || (edge.u === v && edge.v === u)
          );
          if (u !== v && !edgeExists) {
            const weight = Math.floor(Math.random() * 20) + 1;
            setEdges((prevEdges) => [...prevEdges, { u, v, weight }]);
          }
          return []; // Reset selection
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
        x: Math.min(Math.max(x, NODE_RADIUS), canvas.width - NODE_RADIUS), 
        y: Math.min(Math.max(y, NODE_RADIUS), canvas.height - NODE_RADIUS)
      });
    }
    setNodes(newNodes);

    const newEdges = [];
    if (nodeCount > 1) {
      for (let i = 0; i < nodeCount - 1; i++) { // Create a path
        if(newNodes[i] && newNodes[i+1]){
           const weight = Math.floor(Math.random() * 20) + 1;
           newEdges.push({ u: i, v: i + 1, weight });
        }
      }
      if (nodeCount > 2 && Math.random() < 0.7) { // Occasionally close the loop
        const weight = Math.floor(Math.random() * 20) + 1;
        newEdges.push({ u: nodeCount -1, v: 0, weight});
      }
    }
    
    const additionalEdges = Math.floor(nodeCount / 2.5); // Fewer additional edges for DFS clarity
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

  // Iterative DFS Implementation
  const startDFS = async () => {
    if (nodes.length === 0) {
      console.log("Graph is empty.");
      return;
    }

    setResultRows([]);
    const visited = Array(nodes.length).fill(false);
    const stack = []; // Use an array as a stack
    const startNodeIndex = 0; // Assuming DFS starts from node 0

    // Adjacency list representation for easier neighbor lookup
    const adj = Array(nodes.length).fill(null).map(() => []);
    edges.forEach(edge => {
        adj[edge.u].push({ node: edge.v, weight: edge.weight, originalEdge: edge });
        adj[edge.v].push({ node: edge.u, weight: edge.weight, originalEdge: edge });
    });


    if (!nodes[startNodeIndex]) {
        console.error("Start node does not exist.");
        return;
    }

    stack.push(startNodeIndex); 
    // No need to mark visited here, will do it when popped if using that DFS variant,
    // or mark when pushed to avoid cycles with unvisited neighbors.
    // For this visualization, marking when pushed is often clearer.
    // visited[startNodeIndex] = true; // Mark when pushed

    const edgeSetForHighlight = [];

    // Initial table row
    setResultRows(prevRows => [...prevRows, {
        visited: visited.map((v, i) => (v ? i : null)).filter(v => v !== null).join(", "),
        stack: stack.join(", "),
        edge: "Start DFS",
        weight: "-",
    }]);
    drawGraph(edgeSetForHighlight);
    await new Promise((res) => setTimeout(res, 700));


    while (stack.length > 0) {
      const u = stack.pop(); // Pop from stack

      if (!visited[u]) { // Process node if not visited
          visited[u] = true;

          // Add row for processing node u
          setResultRows(prevRows => [...prevRows, {
              visited: visited.map((v, i) => (v ? i : null)).filter(v => v !== null).join(", "),
              stack: [...stack].join(", "), // Show stack *after* pop but before pushes
              edge: `Process ${u}`,
              weight: "-",
          }]);
          drawGraph(edgeSetForHighlight); // Redraw to show current state (e.g. node u is current)
          await new Promise((res) => setTimeout(res, 700));


          // Explore neighbors
          // Iterate in reverse if you want to explore smallest index neighbor first (typical for stack)
          // Or iterate normally, depending on desired exploration order.
          // For consistency with visual, iterating through adj[u] as is.
          for (const neighborEdge of adj[u]) { 
            const v = neighborEdge.node;
            if (!visited[v]) {
              stack.push(v);
              // visited[v] = true; // Mark visited when pushed to avoid re-adding
              edgeSetForHighlight.push(neighborEdge.originalEdge); // Highlight edge

              setResultRows(prevRows => [...prevRows, {
                  visited: visited.map((val, i) => (val ? i : null)).filter(val => val !== null).join(", "),
                  stack: [...stack].join(", "), // Show stack *after* push
                  edge: `${u} - ${v}`,
                  weight: neighborEdge.weight,
              }]);
              drawGraph(edgeSetForHighlight);
              await new Promise((res) => setTimeout(res, 700));
            }
          }
      }
    }
    // Final draw to ensure all highlights are correct
    drawGraph(edgeSetForHighlight);
    setResultRows(prevRows => [...prevRows, {
        visited: visited.map((v, i) => (v ? i : null)).filter(v => v !== null).join(", "),
        stack: stack.join(", "),
        edge: "DFS Complete",
        weight: "-",
    }]);
  };


  return (
    <div className="container">
      <h1>DFS Graph Visualizer</h1>
      <div className="grid-container">
        <div style={{overflowX: "auto", maxHeight: "450px", overflowY: "auto"}}>
          <table>
            <thead>
              <tr>
                <th>Visited</th>
                <th>Stack</th>
                <th>Edge / Action</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {resultRows.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{textAlign: "center"}}>Click "Start DFS" to see the steps.</td>
                </tr>
              ) : (
                resultRows.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.visited}</td>
                    <td>{row.stack}</td>
                    <td>{row.edge}</td>
                    <td>{row.weight}</td>
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
            <button onClick={generateRandomGraph}>
              Generate Random Graph
            </button>
            <button onClick={resetGraph}>
              Reset Graph
            </button>
            <button 
              onClick={startDFS}
              disabled={nodes.length === 0}
            >
              Start DFS
            </button>
          </div>
        </div>
      </div>
      <div className="complexity">
        <strong>Time Complexity (DFS):</strong> O(V + E) where V is vertices, E is edges.
      </div>
    </div>
  );
};

export default DepthFirstSearch;
