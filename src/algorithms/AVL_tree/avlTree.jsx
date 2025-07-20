import React, { useRef, useState } from 'react';
import './avlTree.css';

class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

function getHeight(node) {
  return node ? node.height : 0;
}

function getBalance(node) {
  return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

function rotateRight(y) {
  const x = y.left;
  const T2 = x.right;

  x.right = y;
  y.left = T2;

  y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
  x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;

  return x;
}

function rotateLeft(x) {
  const y = x.right;
  const T2 = y.left;

  y.left = x;
  x.right = T2;

  x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
  y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;

  return y;
}

function insert(node, key) {
  if (!node) return new Node(key);

  if (key < node.value) node.left = insert(node.left, key);
  else if (key > node.value) node.right = insert(node.right, key);
  else return node;

  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
  const balance = getBalance(node);

  if (balance > 1 && key < node.left.value) return rotateRight(node);
  if (balance < -1 && key > node.right.value) return rotateLeft(node);
  if (balance > 1 && key > node.left.value) {
    node.left = rotateLeft(node.left);
    return rotateRight(node);
  }
  if (balance < -1 && key < node.right.value) {
    node.right = rotateRight(node.right);
    return rotateLeft(node);
  }

  return node;
}

const avlTree = () => {
  const canvasRef = useRef(null);
  const [question, setQuestion] = useState('');
  const [tableData, setTableData] = useState([]);

  function generateRandomQuestion() {
    const sequence = Array.from({ length: 7 }, () => Math.floor(Math.random() * 90) + 10);
    setQuestion(`Insert the following sequence into an AVL Tree: ${sequence.join(', ')}`);
    drawAVLTree(sequence);
  }

  function drawAVLTree(values) {
    let root = null;
    const canvas = canvasRef.current;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let i = 0;
    function stepInsert() {
      if (i >= values.length) return;
      root = insert(root, values[i]);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawNode(ctx, root, canvas.width / 2, 40, canvas.width / 4);
      updateTable(root);
      i++;
      setTimeout(stepInsert, 1000);
    }
    stepInsert();
  }

  function drawNode(ctx, node, x, y, offset) {
    if (!node) return;

    ctx.beginPath();
    ctx.arc(x, y, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#2e7d32';
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.value, x, y);

    if (node.left) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - offset, y + 60);
      ctx.stroke();
      drawNode(ctx, node.left, x - offset, y + 60, offset / 2);
    }
    if (node.right) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + offset, y + 60);
      ctx.stroke();
      drawNode(ctx, node.right, x + offset, y + 60, offset / 2);
    }
  }

  function updateTable(root) {
    const rows = [];
    function traverse(node) {
      if (!node) return;
      traverse(node.left);
      rows.push({
        value: node.value,
        balance: getBalance(node),
        left: node.left ? node.left.value : '-',
        right: node.right ? node.right.value : '-',
      });
      traverse(node.right);
    }
    traverse(root);
    setTableData(rows);
  }

  return (
    <div className="avl-container">
      <div className="avl-header">
        <h1>AVL Tree Visualizer</h1>
      </div>
      <div className="section">
        <h2>1. Generate Random Insertion Sequence</h2>
        <button className="btn" onClick={generateRandomQuestion}>Generate Question</button>
        <p>{question}</p>
      </div>
      <div className="section">
        <h2>2. AVL Tree Animation</h2>
        <canvas id="treeCanvas" ref={canvasRef}></canvas>
      </div>
      <div className="section">
        <h2>3. AVL Tree Table Output</h2>
        <table>
          <thead>
            <tr>
              <th>Node</th>
              <th>Balance Factor</th>
              <th>Left</th>
              <th>Right</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                <td>{row.value}</td>
                <td>{row.balance}</td>
                <td>{row.left}</td>
                <td>{row.right}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="section">
        <h2>4. Time and Space Complexity</h2>
        <p><strong>Time Complexity:</strong> O(log n) for insert, delete, and search</p>
        <p><strong>Space Complexity:</strong> O(n)</p>
      </div>
    </div>
  );
}


export default avlTree;