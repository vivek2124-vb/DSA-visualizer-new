import React, { useState, useEffect, useCallback } from 'react';
import './LongestCommonSubsequence.css';

const LongestCommonSubsequence = () => {
  const [string1, setString1] = useState('AGGTAB');
  const [string2, setString2] = useState('GXTXAYB');
  const [dpTable, setDpTable] = useState([]);
  const [lcsString, setLcsString] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500); // ms
  const [message, setMessage] = useState('Enter two strings and press Start.');
  const [algorithmSteps, setAlgorithmSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightedCells, setHighlightedCells] = useState(new Set());
  const [backtrackPath, setBacktrackPath] = useState(new Set());
  const [finalLcsChars, setFinalLcsChars] = useState(new Set());
  const [arrowTable, setArrowTable] = useState([]);

  // Function to generate the DP table and animation steps
  const generateLcs = useCallback(() => {
    const m = string1.length;
    const n = string2.length;
    const steps = [];
    const table = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
    const arrows = Array(m + 1).fill(null).map(() => Array(n + 1).fill(null)); // For backtracking arrows/guidance

    steps.push({
      type: 'message',
      text: 'Initializing DP Table...',
      table: JSON.parse(JSON.stringify(table)), // Deep copy
      highlight: new Set(),
      path: new Set(),
      lcs: '',
    });

    // 1. Fill DP Table
    steps.push({ type: 'message', text: 'Filling DP Table...', table: JSON.parse(JSON.stringify(table)), highlight: new Set(), path: new Set(), lcs: '' });
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const h = new Set([`${i}-${j}`]); // Highlight current cell
        if (string1[i - 1] === string2[j - 1]) {
          table[i][j] = table[i - 1][j - 1] + 1;
          arrows[i][j] = 'diag'; // Diagonal arrow
          h.add(`${i-1}-${j-1}`);
          steps.push({
            type: 'fill',
            text: `Comparing ${string1[i - 1]} and ${string2[j - 1]}. Match! Moving diagonally. DP[${i}][${j}] = ${table[i][j]}`,
            table: JSON.parse(JSON.stringify(table)),
            highlight: h,
            path: new Set(),
            lcs: '',
          });
        } else {
          h.add(`${i-1}-${j}`);
          h.add(`${i}-${j-1}`);
          if (table[i - 1][j] >= table[i][j - 1]) {
            table[i][j] = table[i - 1][j];
            arrows[i][j] = 'up'; // Up arrow
            steps.push({
              type: 'fill',
              text: `Comparing ${string1[i - 1]} and ${string2[j - 1]}. Mismatch. Moving up. DP[${i}][${j}] = ${table[i][j]}`,
              table: JSON.parse(JSON.stringify(table)),
              highlight: h,
              path: new Set(),
              lcs: '',
            });
          } else {
            table[i][j] = table[i][j - 1];
            arrows[i][j] = 'left'; // Left arrow
            steps.push({
              type: 'fill',
              text: `Comparing ${string1[i - 1]} and ${string2[j - 1]}. Mismatch. Moving left. DP[${i}][${j}] = ${table[i][j]}`,
              table: JSON.parse(JSON.stringify(table)),
              highlight: h,
              path: new Set(),
              lcs: '',
            });
          }
        }
      }
    }
    steps.push({ type: 'message', text: 'DP Table Filled. Starting Backtracking...', table: JSON.parse(JSON.stringify(table)), highlight: new Set(), path: new Set(), lcs: '' });

    // 2. Backtrack to find LCS
    let lcs = '';
    let i = m;
    let j = n;
    const path = new Set();
    const lcsChars = new Set();

    while (i > 0 && j > 0) {
        path.add(`${i}-${j}`);
      if (arrows[i][j] === 'diag') {
        lcs = string1[i - 1] + lcs;
        lcsChars.add(`${i}-${j}`); // Mark cells contributing to LCS
        steps.push({
          type: 'backtrack',
          text: `Found '${string1[i - 1]}' in LCS. Moving diagonally up-left.`,
          table: JSON.parse(JSON.stringify(table)),
          highlight: new Set([`${i}-${j}`]),
          path: new Set(path),
          lcs: lcs,
          lcsChars: new Set(lcsChars)
        });
        i--;
        j--;
      } else if (arrows[i][j] === 'up') {
        steps.push({
          type: 'backtrack',
          text: 'Moving up.',
          table: JSON.parse(JSON.stringify(table)),
          highlight: new Set([`${i}-${j}`]),
          path: new Set(path),
          lcs: lcs,
          lcsChars: new Set(lcsChars)
        });
        i--;
      } else {
         steps.push({
          type: 'backtrack',
          text: 'Moving left.',
          table: JSON.parse(JSON.stringify(table)),
          highlight: new Set([`${i}-${j}`]),
          path: new Set(path),
          lcs: lcs,
           lcsChars: new Set(lcsChars)
        });
        j--;
      }
    }
     path.add(`${i}-${j}`); // Add the final 0,0 or boundary cell
     steps.push({
          type: 'done',
          text: `Backtracking complete. LCS found: ${lcs}`,
          table: JSON.parse(JSON.stringify(table)),
          highlight: new Set(),
          path: new Set(path),
          lcs: lcs,
          lcsChars: new Set(lcsChars)
        });

    setAlgorithmSteps(steps);
    setDpTable(steps[0].table); // Set initial table
    setArrowTable(arrows);
    setMessage('Press Play to start the visualization.');
  }, [string1, string2]);

  // Handle animation playback
  useEffect(() => {
    if (isPlaying && currentStepIndex < algorithmSteps.length) {
      const timer = setTimeout(() => {
        const step = algorithmSteps[currentStepIndex];
        setDpTable(step.table);
        setMessage(step.text);
        setHighlightedCells(step.highlight);
        setBacktrackPath(step.path);
        setLcsString(step.lcs);
        if (step.lcsChars) setFinalLcsChars(step.lcsChars);
        setCurrentStepIndex(currentStepIndex + 1);
      }, animationSpeed);

      return () => clearTimeout(timer);
    } else if (isPlaying && currentStepIndex >= algorithmSteps.length) {
      setIsPlaying(false); // Stop when done
    }
  }, [isPlaying, currentStepIndex, algorithmSteps, animationSpeed]);

  const handleStart = () => {
     if (string1.length === 0 || string2.length === 0) {
        setMessage("Please enter both strings.");
        return;
    }
    handleReset(); // Reset before starting a new run
    generateLcs();
    // Use a slight delay to ensure state updates before playing
    setTimeout(() => {
        setIsPlaying(true);
        setCurrentStepIndex(0);
    }, 100);
  };

  const handlePlayPause = () => {
    if(algorithmSteps.length === 0) {
        handleStart();
    } else {
        setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setAlgorithmSteps([]);
    setDpTable([]);
    setLcsString('');
    setHighlightedCells(new Set());
    setBacktrackPath(new Set());
    setFinalLcsChars(new Set());
    setArrowTable([]);
    setMessage('Enter two strings and press Start.');
  };

  const handleSpeedChange = (e) => {
    setAnimationSpeed(2100 - parseInt(e.target.value));
  };


  return (
    <div className="lcs-visualizer">
      <h1>Longest Common Subsequence (LCS)</h1>
      <div className="controls-inputs">
        <div className="inputs">
          <label>String 1:</label>
          <input
            type="text"
            value={string1}
            onChange={(e) => setString1(e.target.value.toUpperCase())} // Example: force uppercase
            disabled={isPlaying}
          />
          <label>String 2:</label>
          <input
            type="text"
            value={string2}
            onChange={(e) => setString2(e.target.value.toUpperCase())}
            disabled={isPlaying}
          />
        </div>
        <div className="controls">
          <button onClick={handleStart} disabled={isPlaying || (algorithmSteps.length > 0 && currentStepIndex > 0)}>
            Start
          </button>
           <button onClick={handlePlayPause} disabled={algorithmSteps.length === 0}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button onClick={handleReset}>Reset</button>
           <div className="control-group">
                <label htmlFor="speed">Speed:</label>
                <input
                  type="range"
                  id="speed"
                  min="100"
                  max="2000"
                  step="100"
                  value={2100 - animationSpeed}
                  onChange={handleSpeedChange}
                />
            </div>
        </div>
      </div>

      <div className="message-area">{message}</div>

      <div className="lcs-output">
          <h3>Resulting LCS: <span className="lcs-result">{lcsString}</span></h3>
      </div>


      <div className="dp-table-container">
        {dpTable.length > 0 && (
          <table className="dp-table">
            <thead>
              <tr>
                <th></th>
                <th>Ø</th>
                {[...string2].map((char, index) => (
                  <th key={index}>{char}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dpTable.map((row, i) => (
                <tr key={i}>
                  <th>{i === 0 ? 'Ø' : string1[i - 1]}</th>
                  {row.map((cellValue, j) => {
                    const cellId = `${i}-${j}`;
                    let className = 'dp-cell';
                    if (highlightedCells.has(cellId)) className += ' highlight';
                    if (backtrackPath.has(cellId)) className += ' path';
                    if (finalLcsChars.has(cellId)) className += ' lcs-char';

                    // <-- NEW: Add arrow class -->
                    const arrowDir = arrowTable[i]?.[j];
                    if (arrowDir && i > 0 && j > 0) { // Only show arrows inside the main grid
                        className += ` ${arrowDir}`;
                    }

                    return (
                      <td key={j} className={className}>
                        {cellValue}
                        {/* Optional: Add arrows based on 'arrows' table if needed */}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LongestCommonSubsequence;