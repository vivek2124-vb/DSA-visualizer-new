import React, { useRef, useState, useEffect } from "react";
import "./PrimsAlgirithms.css";

const PrimsAlgirithms = () => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [mstEdges, setMstEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [visitedNodes, setVisitedNodes] = useState([]);

  // Draw graph on canvas
  const drawGraph = (highlighted = []) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    edges.forEach((edge) => {
      ctx.beginPath();
      ctx.moveTo(edge.from.x, edge.from.y);
      ctx.lineTo(edge.to.x, edge.to.y);
      const isInMST = mstEdges.includes(edge);
      ctx.strokeStyle = isInMST ? "green" : "#aaa";
      ctx.lineWidth = isInMST ? 3 : 1;
      ctx.stroke();

      // Draw weight
      const mx = (edge.from.x + edge.to.x) / 2;
      const my = (edge.from.y + edge.to.y) / 2;
      ctx.fillStyle = "black";
      ctx.font = "14px Arial";
      ctx.fillText(edge.weight, mx, my);
    });

    // Draw nodes
    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = highlighted.includes(node.id) ? "lightgreen" : "white";
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "black";
      ctx.font = "16px Arial";
      ctx.fillText(`N${node.id}`, node.x - 10, node.y + 5);
    });
  };

  // Redraw on nodes/edges/mstEdges/visitedNodes changes
  useEffect(() => {
    drawGraph(visitedNodes);
  }, [nodes, edges, mstEdges, visitedNodes]);

  // Canvas click handler
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on existing node
    const clickedNode = nodes.find((n) => Math.hypot(n.x - x, n.y - y) < 20);

    if (clickedNode) {
      if (selectedNode && selectedNode.id !== clickedNode.id) {
        // Prompt for weight and add edge
        const weightStr = prompt("Enter edge weight:", "1");
        const weight = parseInt(weightStr);
        if (!isNaN(weight)) {
          setEdges((prev) => [
            ...prev,
            { from: selectedNode, to: clickedNode, weight },
          ]);
        }
        setSelectedNode(null);
      } else {
        setSelectedNode(clickedNode);
      }
    } else {
      // Add new node
      const id = nodes.length;
      setNodes((prev) => [...prev, { id, x, y }]);
    }
  };

  // Reset graph
  const resetGraph = () => {
    setNodes([]);
    setEdges([]);
    setMstEdges([]);
    setSelectedNode(null);
    setTableData([]);
    setVisitedNodes([]);
  };

  // Generate random MST graph
  const generateRandomMST = () => {
    resetGraph();
    const count = Math.floor(Math.random() * 3) + 6; // 6 to 8 nodes
    const newNodes = [];
    for (let i = 0; i < count; i++) {
      newNodes.push({
        id: i,
        x: Math.random() * 700 + 50,
        y: Math.random() * 500 + 50,
      });
    }

    const newEdges = [];
    for (let i = 1; i < count; i++) {
      const j = Math.floor(Math.random() * i);
      const weight = Math.floor(Math.random() * 20) + 1;
      newEdges.push({ from: newNodes[i], to: newNodes[j], weight });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  };

  // Run Prim's algorithm with animation
  const startPrims = async () => {
    const startStr = prompt("Enter starting node ID:");
    const startId = parseInt(startStr);
    if (isNaN(startId) || startId < 0 || startId >= nodes.length) {
      alert("Invalid node ID");
      return;
    }

    let dist = Array(nodes.length).fill(Infinity);
    let prev = Array(nodes.length).fill(null);
    let visited = Array(nodes.length).fill(false);
    dist[startId] = 0;

    let mstEdgesTemp = [];
    for (let count = 0; count < nodes.length; count++) {
      let u = -1;
      for (let i = 0; i < nodes.length; i++) {
        if (!visited[i] && (u === -1 || dist[i] < dist[u])) u = i;
      }
      if (u === -1) break;
      visited[u] = true;

      for (const edge of edges) {
        const v =
          edge.from.id === u
            ? edge.to.id
            : edge.to.id === u
            ? edge.from.id
            : -1;
        if (v !== -1 && !visited[v] && edge.weight < dist[v]) {
          dist[v] = edge.weight;
          prev[v] = u;
        }
      }

      setTableData(
        nodes.map((node, i) => ({
          node: `N${i}`,
          dist: dist[i],
          prev: prev[i] !== null ? `N${prev[i]}` : "-",
        }))
      );

      if (prev[u] !== null) {
        const edgeFound = edges.find(
          (e) =>
            (e.from.id === u && e.to.id === prev[u]) ||
            (e.to.id === u && e.from.id === prev[u])
        );
        if (edgeFound && !mstEdgesTemp.includes(edgeFound)) {
          mstEdgesTemp.push(edgeFound);
          setMstEdges([...mstEdgesTemp]);
        }
      }

      setVisitedNodes(
        visited
          .map((v, i) => (v ? i : -1))
          .filter((i) => i !== -1)
      );

      await new Promise((res) => setTimeout(res, 600));
    }
  };

  return (
    <div className="container">
      <h1>Prim's Minimum Spanning Tree Visualizer</h1>
      <canvas
        id="graphCanvas"
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
      />
      <div id="controls">
        <button onClick={startPrims}>Start Prim's</button>
        <button onClick={resetGraph}>Reset</button>
        <button onClick={generateRandomMST}>Random MST</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Node</th>
            <th>Distance</th>
            <th>Previous</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map(({ node, dist, prev }, idx) => (
            <tr key={idx}>
              <td>{node}</td>
              <td>{dist === Infinity ? "∞" : dist}</td>
              <td>{prev}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div id="complexity">Time Complexity: O((V + E) log V)</div>
    </div>
  );
};

export default PrimsAlgirithms;
