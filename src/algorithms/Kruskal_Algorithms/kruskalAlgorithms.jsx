import React, { useRef, useState, useEffect } from "react";
import "./KruskalAlgorithms.css";

const KruskalAlgorithms = () => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [mstEdges, setMstEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [tableRows, setTableRows] = useState([]);

  useEffect(() => {
    drawGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, mstEdges]);

  const drawGraph = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    edges.forEach((edge) => {
      ctx.beginPath();
      ctx.moveTo(edge.from.x, edge.from.y);
      ctx.lineTo(edge.to.x, edge.to.y);
      ctx.strokeStyle = edge.included ? "#28a745" : "#999";
      ctx.lineWidth = edge.included ? 3 : 1;
      ctx.stroke();

      const mx = (edge.from.x + edge.to.x) / 2;
      const my = (edge.from.y + edge.to.y) / 2;
      ctx.fillStyle = "#000";
      ctx.font = "16px Arial";
      ctx.fillText(edge.weight, mx, my);
    });

    // Draw nodes
    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.stroke();

      ctx.fillStyle = "#000";
      ctx.font = "16px Arial";
      ctx.fillText(`N${node.id}`, node.x - 10, node.y + 5);
    });
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = nodes.find((n) => Math.hypot(n.x - x, n.y - y) < 20);

    if (clickedNode) {
      if (selectedNode && selectedNode.id !== clickedNode.id) {
        const weightStr = prompt("Enter edge weight:", "1");
        const weight = parseInt(weightStr);
        if (!isNaN(weight)) {
          setEdges((prevEdges) => [
            ...prevEdges,
            { from: selectedNode, to: clickedNode, weight, included: false },
          ]);
        }
        setSelectedNode(null);
      } else {
        setSelectedNode(clickedNode);
      }
    } else {
      const newNode = { id: nodes.length, x, y };
      setNodes((prev) => [...prev, newNode]);
      setSelectedNode(null);
    }
  };

  const resetGraph = () => {
    setNodes([]);
    setEdges([]);
    setMstEdges([]);
    setSelectedNode(null);
    setTableRows([]);
  };

  const generateRandomGraph = () => {
    resetGraph();
    const count = Math.floor(Math.random() * 3) + 5; // 5 to 7 nodes
    const newNodes = [];
    for (let i = 0; i < count; i++) {
      newNodes.push({
        id: i,
        x: Math.random() * 700 + 50,
        y: Math.random() * 500 + 50,
      });
    }

    const newEdges = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (Math.random() < 0.5) {
          const weight = Math.floor(Math.random() * 20) + 1;
          newEdges.push({
            from: newNodes[i],
            to: newNodes[j],
            weight,
            included: false,
          });
        }
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const startKruskal = async () => {
    if (nodes.length === 0) return;

    const parent = Array(nodes.length)
      .fill(0)
      .map((_, i) => i);

    const find = (x) => {
      if (parent[x] !== x) parent[x] = find(parent[x]);
      return parent[x];
    };
    const union = (x, y) => {
      parent[find(x)] = find(y);
    };

    // Sort edges by weight ascending
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    const mst = [];
    const newEdges = [...edges];
    const newTableRows = [];

    for (const edge of sortedEdges) {
      const u = edge.from.id;
      const v = edge.to.id;

      if (find(u) !== find(v)) {
        union(u, v);
        edge.included = true;
        mst.push(edge);
      } else {
        edge.included = false;
      }

      setEdges([...newEdges]);
      setMstEdges([...mst]);
      newTableRows.push({
        edge: `N${u} - N${v}`,
        weight: edge.weight,
        included: edge.included ? "Yes" : "No",
      });
      setTableRows([...newTableRows]);

      await new Promise((res) => setTimeout(res, 700));
    }
  };

  return (
    <div className="container">
      <h1>Kruskal's Algorithm Visualizer</h1>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
        className="graphCanvas"
      />
      <div id="controls">
        <button onClick={startKruskal}>Start Kruskal</button>
        <button onClick={resetGraph}>Reset</button>
        <button onClick={generateRandomGraph}>Random Graph</button>
      </div>
      <table id="table">
        <thead>
          <tr>
            <th>Edge</th>
            <th>Weight</th>
            <th>Included in MST</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, i) => (
            <tr key={i}>
              <td>{row.edge}</td>
              <td>{row.weight}</td>
              <td>{row.included}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div id="complexity">Time Complexity: O(E log E)</div>
    </div>
  );
};

export default KruskalAlgorithms;
