import React, { useRef, useEffect, useState } from "react";
import "./BellmanFord.css";

const BellmanFord = () => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [distances, setDistances] = useState([]);
  const [tableRows, setTableRows] = useState([]);

  useEffect(() => {
    drawGraph();
  }, [nodes, edges, distances]);

  const generateRandomGraph = () => {
    resetGraph();
    const count = 6;
    const centerX = 800 / 2;
    const centerY = 500 / 2;
    const radius = 200;
    const newNodes = [];
    const newEdges = [];

    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      newNodes.push({ x, y });
    }

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        if (i !== j && Math.random() < 0.5) {
          const weight = Math.floor(Math.random() * 20) - 5;
          newEdges.push({ u: i, v: j, weight });
        }
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let edge of edges) {
      ctx.beginPath();
      ctx.strokeStyle = "#facc15";
      ctx.moveTo(nodes[edge.u].x, nodes[edge.u].y);
      ctx.lineTo(nodes[edge.v].x, nodes[edge.v].y);
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(
        edge.weight,
        (nodes[edge.u].x + nodes[edge.v].x) / 2,
        (nodes[edge.u].y + nodes[edge.v].y) / 2
      );
    }

    for (let i = 0; i < nodes.length; i++) {
      ctx.beginPath();
      ctx.fillStyle = "#3b82f6";
      ctx.arc(nodes[i].x, nodes[i].y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      const label = distances.length ? `${i} (${distances[i]})` : `${i}`;
      ctx.fillText(label, nodes[i].x - 10, nodes[i].y + 5);
    }
  };

  const resetGraph = () => {
    setNodes([]);
    setEdges([]);
    setDistances([]);
    setTableRows([]);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const runBellmanFord = async () => {
    const dist = Array(nodes.length).fill(Infinity);
    dist[0] = 0;
    const newTableRows = [];

    for (let i = 0; i < nodes.length - 1; i++) {
      for (let edge of edges) {
        const { u, v, weight } = edge;
        if (dist[u] + weight < dist[v]) {
          dist[v] = dist[u] + weight;
          newTableRows.push({ visited: u, queue: v, edge: `${u} → ${v}`, weight });
          setDistances([...dist]);
          await new Promise((res) => setTimeout(res, 500));
        }
      }
    }

    setTableRows(newTableRows);
  };

  return (
    <div className="container">
      <h1>Bellman-Ford Algorithm Visualizer</h1>
      <p className="theory">
        The Bellman-Ford algorithm is used to find the shortest paths from a single source vertex to all other vertices in a weighted graph.
        Unlike Dijkstra's algorithm, it works with graphs that have negative weight edges. It relaxes all edges up to (V - 1) times.
        If it finds a shorter path, it updates the distance. It can also detect negative weight cycles.
      </p>
      <canvas ref={canvasRef} width="800" height="500"></canvas>
      <div className="controls">
        <button onClick={generateRandomGraph}>Generate Random Graph</button>
        <button onClick={resetGraph}>Reset</button>
        <button onClick={runBellmanFord}>Run Bellman-Ford</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Visited</th>
            <th>Queue</th>
            <th>Edge</th>
            <th>Weight</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, index) => (
            <tr key={index}>
              <td>{row.visited}</td>
              <td>{row.queue}</td>
              <td>{row.edge}</td>
              <td>{row.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="complexity">
        <strong>Time Complexity:</strong> O(VE)
      </div>
    </div>
  );
};

export default BellmanFord;
