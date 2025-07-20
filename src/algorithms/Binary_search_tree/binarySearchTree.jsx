import React, { useState, useEffect, useRef } from 'react';
import './binarySearchTree.css';

const NODE_RADIUS = 18;
const LEVEL_HEIGHT = 90;

class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.x = 0;
    this.y = 0;
  }
}

class BST {
  constructor() {
    this.root = null;
    this.insertionOrder = [];
  }

  insert(value) {
    if (this.contains(value)) return null;
    const newNode = new Node(value);
    if (!this.root) {
      this.root = newNode;
      this.insertionOrder.push(value);
      return newNode;
    }
    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          this.insertionOrder.push(value);
          return newNode;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          this.insertionOrder.push(value);
          return newNode;
        }
        current = current.right;
      }
    }
  }

  contains(value) {
    let current = this.root;
    while (current) {
      if (value === current.value) return true;
      current = value < current.value ? current.left : current.right;
    }
    return false;
  }
}

function binarySearchTree() {
  const canvasRef = useRef(null);

  const [bst, setBST] = useState(new BST());
  const [inputValues, setInputValues] = useState('');
  const [insertionNodes, setInsertionNodes] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    function handleResize() {
      const canvas = canvasRef.current;
      canvas.width = canvas.clientWidth;
      canvas.height = 600;
      redrawTree();
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [bst]);

  function calculateNodePositions(root, width, xStart = 0, xEnd = width, level = 1) {
    if (!root) return;
    root.x = (xStart + xEnd) / 2;
    root.y = level * LEVEL_HEIGHT;
    calculateNodePositions(root.left, width, xStart, root.x, level + 1);
    calculateNodePositions(root.right, width, root.x, xEnd, level + 1);
  }

  function clearCanvas(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function drawLine(ctx, x1, y1, x2, y2) {
    ctx.strokeStyle = '#388e3c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function drawNode(ctx, node) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--node-color').trim() || '#43a047';
    ctx.strokeStyle = '#1b5e20';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--node-text').trim() || '#fff';
    ctx.font = 'bold 16px Verdana';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.value, node.x, node.y);
  }

  function drawTree(root) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    clearCanvas(ctx, canvas);

    function drawEdges(node) {
      if (!node) return;
      if (node.left) {
        drawLine(ctx, node.x, node.y + NODE_RADIUS, node.left.x, node.left.y - NODE_RADIUS);
        drawEdges(node.left);
      }
      if (node.right) {
        drawLine(ctx, node.x, node.y + NODE_RADIUS, node.right.x, node.right.y - NODE_RADIUS);
        drawEdges(node.right);
      }
    }

    function drawNodes(node) {
      if (!node) return;
      drawNode(ctx, node);
      drawNodes(node.left);
      drawNodes(node.right);
    }

    drawEdges(root);
    drawNodes(root);
  }

  function redrawTree() {
    if (!bst.root) return;
    const canvas = canvasRef.current;
    calculateNodePositions(bst.root, canvas.width);
    drawTree(bst.root);
  }

  async function animateInsertion(values) {
    const newBST = new BST();
    setInsertionNodes([]);
    setBST(newBST);
    clearCanvas(canvasRef.current.getContext('2d'), canvasRef.current);

    for (let i = 0; i < values.length; i++) {
      const inserted = newBST.insert(values[i]);
      if (!inserted) continue;
      calculateNodePositions(newBST.root, canvasRef.current.width);
      drawTree(newBST.root);
      setInsertionNodes([...newBST.insertionOrder]);
      setBST(newBST);
      await new Promise((res) => setTimeout(res, 800));
    }
  }

  async function animateSingleInsertion(value) {
    if (bst.contains(value)) {
      alert(`Value ${value} already exists in BST!`);
      return;
    }
    const newBST = bst;
    const inserted = newBST.insert(value);
    if (!inserted) return;
    calculateNodePositions(newBST.root, canvasRef.current.width);
    drawTree(newBST.root);
    setInsertionNodes([...newBST.insertionOrder]);
    setBST(newBST);
  }

  function parseInput(input) {
    if (!input.trim()) return [];
    return input
      .split(',')
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));
  }

  function generateRandomValues() {
    let length = Math.floor(Math.random() * 5) + 5;
    let values = new Set();
    while (values.size < length) {
      values.add(Math.floor(Math.random() * 90) + 10);
    }
    return Array.from(values);
  }

  async function searchAndHighlight(value) {
    let current = bst.root;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    async function highlightStep(node, color) {
      drawTree(bst.root);
      ctx.save();
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS + 5, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
      await new Promise(res => setTimeout(res, 800));
    }

    while (current) {
      await highlightStep(current, '#ffeb3b'); // Yellow for visited
      if (value === current.value) {
        await highlightStep(current, '#4caf50'); // Green if found
        return;
      }
      current = value < current.value ? current.left : current.right;
    }

    alert(`Value ${value} not found in BST.`);
    drawTree(bst.root);
  }

  const handleBuildClick = () => {
    const values = parseInput(inputValues);
    if (values.length === 0) {
      alert('Please enter valid numbers separated by commas.');
      return;
    }
    animateInsertion(values);
  };

  const handleRandomClick = () => {
    const values = generateRandomValues();
    setInputValues(values.join(', '));
    animateInsertion(values);
  };

  const handleResetClick = () => {
    setInputValues('');
    setSearchValue('');
    setInsertionNodes([]);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setBST(new BST());
  };

  const handleCanvasClick = () => {
    const userValue = prompt('Enter a value to insert into the BST:');
    if (userValue === null) return;
    const val = parseInt(userValue.trim());
    if (isNaN(val)) {
      alert('Please enter a valid number!');
      return;
    }
    animateSingleInsertion(val);
  };

  const handleSearchClick = () => {
    const val = parseInt(searchValue.trim());
    if (isNaN(val)) {
      alert('Please enter a valid number to search.');
      return;
    }
    searchAndHighlight(val);
  };

  useEffect(() => {
    redrawTree();
  }, [bst]);

  return (
    <>
      <div className='binarySearchTreeHeader'>Binary Search Tree (BST) Visualizer</div>

      <main>
        <div className="input-area">
          <label htmlFor="input-values">Enter numbers (comma separated):</label>
          <input
            type="text"
            id="input-values"
            placeholder="e.g. 50, 30, 70, 20, 40, 60, 80"
            value={inputValues}
            onChange={(e) => setInputValues(e.target.value)}
          />
          <button onClick={handleBuildClick}>Build BST</button>
          <button onClick={handleRandomClick}>Random Question</button>
          <button onClick={handleResetClick}>Reset</button>
        </div>

        <div className="canvas-area">
          <canvas
            id="bstCanvas"
            ref={canvasRef}
            aria-label="Binary Search Tree Visualization Canvas"
            role="img"
            tabIndex={0}
            onClick={handleCanvasClick}
          ></canvas>
        </div>

        <div className="search-area">
          <label htmlFor="search-value">Search for a value:</label>
          <input
            id="search-value"
            type="number"
            placeholder="Enter value"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button onClick={handleSearchClick}>Search</button>
        </div>

        <div className="output-area">
          <h3>Insertion Order</h3>
          <div>{insertionNodes.length === 0 ? 'No nodes inserted yet.' : insertionNodes.join(', ')}</div>
        </div>

        <div className="complexity-area">
          <h3>Complexity</h3>
          <p>Insertion/Search Average: O(log n)</p>
          <p>Worst Case: O(n)</p>
        </div>
      </main>
    </>
  );
}

export default binarySearchTree;
