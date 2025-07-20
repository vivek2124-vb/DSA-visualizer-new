import React, { useEffect, useRef, useState } from "react";
import "./binaryTree.css";

const radius = 20;
const verticalSpacing = 80;

const binaryTree = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [nodeCount, setNodeCount] = useState(7);
  const [nodes, setNodes] = useState([]);
  const [animationRunning, setAnimationRunning] = useState(false);

  // Resize canvas to container width and fixed height
  const resizeCanvas = () => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    canvas.width = container.clientWidth;
    canvas.height = 400;
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // Clear canvas
  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // Draw a single node
  const drawNode = (x, y, value, isHighlight = false) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.fillStyle = isHighlight ? "#4caf50" : "#81c784";
    ctx.strokeStyle = "#33691e";
    ctx.lineWidth = 3;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "bold 16px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(value, x, y);
  };

  // Draw a line between nodes
  const drawLine = (x1, y1, x2, y2) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.strokeStyle = "#33691e";
    ctx.lineWidth = 3;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  // Generate nodes array based on count
  const generateNodes = (n) => {
    let values = Array.from({ length: n }, (_, i) => i + 1);
    const newNodes = values.map((val, i) => ({
      index: i,
      value: val,
      parent: i === 0 ? null : Math.floor((i - 1) / 2),
      level: Math.floor(Math.log2(i + 1)),
    }));
    setNodes(newNodes);
  };

  // Calculate node positions on canvas
  const calculatePositions = () => {
    const positions = [];
    const levels = Math.floor(Math.log2(nodes.length)) + 1;
    const canvasWidth = canvasRef.current.width;

    for (let i = 0; i < nodes.length; i++) {
      const level = nodes[i].level;
      const nodesInLevel = Math.pow(2, level);
      const indexInLevel = i - (nodesInLevel - 1);
      const space = canvasWidth / (nodesInLevel + 1);

      const x = space * (indexInLevel + 1);
      const y = verticalSpacing * (level + 1);
      positions.push({ x, y });
    }

    return positions;
  };

  // Draw the whole tree without animation (for resizing)
  const drawStaticTree = () => {
    clearCanvas();
    const positions = calculatePositions();

    nodes.forEach((node, i) => {
      if (node.parent !== null) {
        drawLine(
          positions[node.parent].x,
          positions[node.parent].y + radius,
          positions[i].x,
          positions[i].y - radius
        );
      }
    });

    nodes.forEach((node, i) => {
      drawNode(positions[i].x, positions[i].y, node.value);
    });
  };

  // Animate tree build step by step
  const animateTree = async () => {
    setAnimationRunning(true);
    clearCanvas();
    const positions = calculatePositions();

    for (let i = 0; i < nodes.length; i++) {
      if (!animationRunning) break;

      if (nodes[i].parent !== null) {
        drawLine(
          positions[nodes[i].parent].x,
          positions[nodes[i].parent].y + radius,
          positions[i].x,
          positions[i].y - radius
        );
      }

      for (let j = 0; j <= i; j++) {
        drawNode(positions[j].x, positions[j].y, nodes[j].value, j === i);
      }
      // Pause 500ms between nodes
      await new Promise((r) => setTimeout(r, 500));
    }
    setAnimationRunning(false);
  };

  // Populate node table JSX
  const renderNodeTable = () => {
    return nodes.map((node) => (
      <tr key={node.index}>
        <td>{node.index}</td>
        <td>{node.value}</td>
        <td>{node.parent !== null ? node.parent : "-"}</td>
        <td>{node.level}</td>
      </tr>
    ));
  };

  // Handle build tree button click
  const onBuildTree = async () => {
    if (animationRunning) return;

    if (nodeCount < 1 || nodeCount > 31) {
      alert("Please enter a valid number between 1 and 31");
      return;
    }

    generateNodes(nodeCount);
  };

  // When nodes state changes, animate the tree
  useEffect(() => {
    if (nodes.length === 0) {
      clearCanvas();
      return;
    }

    animateTree();
  }, [nodes]);

  // Redraw static tree on resize
  useEffect(() => {
    if (nodes.length > 0) {
      drawStaticTree();
    }
  }, [nodeCount]);

  // Reset everything
  const resetAll = () => {
    setAnimationRunning(false);
    setNodes([]);
    setNodeCount("");
    clearCanvas();
  };

  // Initialize with 7 nodes on mount
  useEffect(() => {
    setNodeCount(7);
  }, []);

  return (
    <>
      <div className="binaryTreeHeader">Binary Tree Visualizer</div>
      <main>
        <div className="controls">
          <input
            type="number"
            min="1"
            max="31"
            placeholder="Number of nodes (1-31)"
            value={nodeCount}
            onChange={(e) => setNodeCount(Number(e.target.value))}
            disabled={animationRunning}
          />
          <button
            onClick={() => {
              if (animationRunning) return;
              const rand = Math.floor(Math.random() * 31) + 1;
              setNodeCount(rand);
            }}
            disabled={animationRunning}
          >
            Random Question
          </button>
          <button onClick={onBuildTree} disabled={animationRunning}>
            Build Tree
          </button>
          <button onClick={resetAll} disabled={animationRunning}>
            Reset
          </button>
        </div>

        <div id="canvasContainer" ref={containerRef}>
          <canvas id="treeCanvas" ref={canvasRef}></canvas>
        </div>

        <table id="nodeTable" aria-label="Node Information Table">
          <thead>
            <tr>
              <th>Node Index</th>
              <th>Value</th>
              <th>Parent</th>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>{renderNodeTable()}</tbody>
        </table>

        <div className="complexity" aria-live="polite">
          <strong>Time Complexity:</strong> O(n) — where n is the number of nodes
          <br />
          <strong>Space Complexity:</strong> O(n)
        </div>
      </main>
    </>
  );
};

export default binaryTree;
