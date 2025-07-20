import React, { useRef, useState } from "react";
import "./huffmanCoding.css";

const huffmanCoding = () => {
  const canvasRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [codeTable, setCodeTable] = useState([]);

  const parseInput = (text) => {
    const entries = text.trim().split(/\s+/);
    return entries.map((e) => {
      const [char, freq] = e.split(":");
      return { char, freq: parseInt(freq) };
    });
  };

  const buildHuffmanTree = (freqArr) => {
    const pq = freqArr.map((obj) => ({ ...obj, left: null, right: null }));
    pq.sort((a, b) => a.freq - b.freq);

    while (pq.length > 1) {
      const left = pq.shift();
      const right = pq.shift();
      pq.push({ char: null, freq: left.freq + right.freq, left, right });
      pq.sort((a, b) => a.freq - b.freq);
    }
    return pq[0];
  };

  const generateCodes = (node, code = "", codes = []) => {
    if (!node.left && !node.right) {
      codes.push({ char: node.char, freq: node.freq, code, size: code.length });
      return codes;
    }
    if (node.left) generateCodes(node.left, code + "0", codes);
    if (node.right) generateCodes(node.right, code + "1", codes);
    return codes;
  };

  const drawTree = (node, x = 400, y = 30, spacing = 120) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const recurse = (n, x, y, offset) => {
      if (!n) return;

      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = "lightgreen";
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "black";
      ctx.font = "14px Arial";
      ctx.fillText(
        n.char !== null ? `${n.char}:${n.freq}` : n.freq,
        x - 15,
        y + 5
      );

      if (n.left) {
        ctx.beginPath();
        ctx.moveTo(x, y + 20);
        ctx.lineTo(x - offset, y + spacing);
        ctx.stroke();
        recurse(n.left, x - offset, y + spacing, offset / 2);
      }
      if (n.right) {
        ctx.beginPath();
        ctx.moveTo(x, y + 20);
        ctx.lineTo(x + offset, y + spacing);
        ctx.stroke();
        recurse(n.right, x + offset, y + spacing, offset / 2);
      }
    };

    recurse(node, x, y, spacing);
  };

  const startHuffman = () => {
    if (!inputText.trim()) {
      alert("Please enter input data.");
      return;
    }
    const freqArr = parseInput(inputText);
    const tree = buildHuffmanTree(freqArr);
    const codes = generateCodes(tree);
    setCodeTable(codes);
    drawTree(tree);
  };

  const generateRandomProblem = () => {
    const sample = "a:5 b:9 c:12 d:13 e:16 f:45";
    setInputText(sample);
  };

  return (
    <div id="container">
      <h1>Huffman Coding Visualizer</h1>
      <textarea
        placeholder="Enter your string or characters with frequency..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <div>
        <button onClick={startHuffman}>Start Huffman Coding</button>
        <button onClick={generateRandomProblem}>Random Problem</button>
      </div>
      <canvas id="outputCanvas" ref={canvasRef} width={800} height={400} />
      <table>
        <thead>
          <tr>
            <th>Character</th>
            <th>Frequency</th>
            <th>Code</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          {codeTable.map(({ char, freq, code, size }) => (
            <tr key={char}>
              <td>{char}</td>
              <td>{freq}</td>
              <td>{code}</td>
              <td>{size}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div id="complexity">Time Complexity: O(n log n)</div>
    </div>
  );
}


export default huffmanCoding;