import React, { useEffect, useRef, useState } from "react";
import "./balanceTree.css";

function BalancedBinaryTreeVisualizer() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [input, setInput] = useState("");
  const [buildDisabled, setBuildDisabled] = useState(true);
  const [nodeTable, setNodeTable] = useState([]);
  const [complexity, setComplexity] = useState("");
  const [overlay, setOverlay] = useState(false);
  const [root, setRoot] = useState(null);
  const nodePositions = useRef(new Map());
  const [canvasWidth, setCanvasWidth] = useState(900);

  const nodeRadius = 22;
  const verticalSpacing = 130;
  let currentX = 0;

  useEffect(() => {
    function resizeCanvas() {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.clientWidth);
        if (root) drawTree(root);
      }
    }
    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [root]);

  class TreeNode {
    constructor(val) {
      this.val = val;
      this.left = null;
      this.right = null;
    }
  }

  function buildBalancedTree(arr, start = 0, end = arr.length - 1) {
    if (start > end) return null;
    const mid = Math.floor((start + end) / 2);
    const node = new TreeNode(arr[mid]);
    node.left = buildBalancedTree(arr, start, mid - 1);
    node.right = buildBalancedTree(arr, mid + 1, end);
    return node;
  }

  function parseInput(str) {
    return [...new Set(str.split(",").map((s) => +s.trim()).filter((n) => !isNaN(n)))].sort((a, b) => a - b);
  }

  function generateRandomNodes() {
    const size = Math.floor(Math.random() * 7) + 3;
    const arr = new Set();
    while (arr.size < size) arr.add(Math.floor(Math.random() * 50));
    return [...arr].sort((a, b) => a - b);
  }

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function drawLine(ctx, x1, y1, x2, y2) {
    ctx.strokeStyle = "#00796b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function drawNode(ctx, x, y, val, highlight = false) {
    ctx.fillStyle = highlight ? "#26a69a" : "#004d40";
    ctx.strokeStyle = "#00796b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.font = "bold 18px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(val, x, y);
  }

  function calculateNodePositions(node, depth = 0) {
    if (!node) return;
    calculateNodePositions(node.left, depth + 1);
    const x = currentX * (nodeRadius * 4) + nodeRadius * 3;
    const y = depth * verticalSpacing + nodeRadius * 3;
    nodePositions.current.set(node, { x, y });
    currentX++;
    calculateNodePositions(node.right, depth + 1);
  }

  async function animateDraw(node) {
    if (!node) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    await animateDraw(node.left);
    const pos = nodePositions.current.get(node);
    if (node.left) drawLine(ctx, pos.x, pos.y, nodePositions.current.get(node.left).x, nodePositions.current.get(node.left).y);
    if (node.right) drawLine(ctx, pos.x, pos.y, nodePositions.current.get(node.right).x, nodePositions.current.get(node.right).y);
    drawNode(ctx, pos.x, pos.y, node.val, true);
    await delay(500);
    drawNode(ctx, pos.x, pos.y, node.val);
    await animateDraw(node.right);
  }

  function drawTree(node) {
    clearCanvas();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    nodePositions.current.clear();
    currentX = 0;
    calculateNodePositions(node);
    (function drawAll(n) {
      if (!n) return;
      const pos = nodePositions.current.get(n);
      if (n.left) drawLine(ctx, pos.x, pos.y, nodePositions.current.get(n.left).x, nodePositions.current.get(n.left).y);
      if (n.right) drawLine(ctx, pos.x, pos.y, nodePositions.current.get(n.right).x, nodePositions.current.get(n.right).y);
      drawNode(ctx, pos.x, pos.y, n.val);
      drawAll(n.left);
      drawAll(n.right);
    })(node);
  }

  function buildTable(node) {
    const rows = [];
    const queue = [node];
    while (queue.length) {
      const n = queue.shift();
      rows.push({
        val: n.val,
        left: n.left ? n.left.val : "-",
        right: n.right ? n.right.val : "-",
      });
      if (n.left) queue.push(n.left);
      if (n.right) queue.push(n.right);
    }
    setNodeTable(rows);
  }

  async function buildAndAnimateTree(arr) {
    setOverlay(true);
    const treeRoot = buildBalancedTree(arr);
    setRoot(treeRoot);
    clearCanvas();
    nodePositions.current.clear();
    currentX = 0;
    calculateNodePositions(treeRoot);
    await animateDraw(treeRoot);
    buildTable(treeRoot);
    setComplexity("Time: O(n) | Space: O(n)");
    setOverlay(false);
  }

  return (
    <div className="visualizer">
      <div className="balanceTreeHeader">Balanced Binary Tree Visualizer</div>
      <main>
        <div className="questionArea">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setBuildDisabled(parseInput(e.target.value).length === 0);
            }}
            placeholder="Enter tree nodes (comma separated)"
          />
          <button onClick={() => {
            const rand = generateRandomNodes();
            setInput(rand.join(", "));
            setBuildDisabled(false);
          }}>Random</button>
          <button
            onClick={async () => {
              const arr = parseInput(input);
              if (arr.length === 0) return alert("Please enter valid numbers.");
              await buildAndAnimateTree(arr);
            }}
            disabled={buildDisabled}
          >Build Tree</button>
          <button onClick={() => {
            clearCanvas();
            setNodeTable([]);
            setComplexity("");
            setInput("");
            setRoot(null);
            setBuildDisabled(true);
          }}>Reset</button>
        </div>

        <div className="canvasContainer" ref={containerRef}>
          <canvas ref={canvasRef} width={canvasWidth} height={600}></canvas>
          {overlay && <div className="loadingOverlay">Building Tree...</div>}
        </div>

        {nodeTable.length > 0 && (
          <table>
            <thead>
              <tr><th>Node</th><th>Left Child</th><th>Right Child</th></tr>
            </thead>
            <tbody>
              {nodeTable.map((row, index) => (
                <tr key={index}>
                  <td>{row.val}</td>
                  <td>{row.left}</td>
                  <td>{row.right}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {complexity && <div className="complexity">{complexity}</div>}
      </main>
    </div>
  );
}

export default BalancedBinaryTreeVisualizer;