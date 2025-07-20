import React, { useState, useEffect, useCallback } from 'react';
import './NQueenProblem.css'; // We'll create this CSS file next

// --- Constants ---
const SQUARE_STATE = {
    EMPTY: 0,
    QUEEN: 1,
    ATTACKED: 2, // For visualizing attacked squares during solving (optional)
    CANDIDATE: 3, // For visualizing where the algorithm is trying to place a queen
};

// --- Helper Functions ---
const createInitialBoard = (size) => {
    return Array(size)
        .fill(null)
        .map(() => Array(size).fill(SQUARE_STATE.EMPTY));
};

// --- NQueenProblem Component ---
const NQueenProblem = () => {
    // --- State Variables ---
    const [boardSize, setBoardSize] = useState(4); // Default N=4
    const [board, setBoard] = useState(() => createInitialBoard(boardSize));
    const [solutions, setSolutions] = useState([]);
    const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0);
    const [isSolving, setIsSolving] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(200); // ms
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('DFS');
    const [message, setMessage] = useState('');

    // --- Effects ---
    // Regenerate board when size changes
    useEffect(() => {
        handleResetBoard(false); // Reset with new dimensions, don't clear solutions yet
    }, [boardSize]);

    // Function to update board for visualization
    const visualizeStep = async (newBoardState, tempQueenPos = null) => {
        const displayBoard = newBoardState.map(row => [...row]);
        if (tempQueenPos) {
            if (displayBoard[tempQueenPos.row] && displayBoard[tempQueenPos.row][tempQueenPos.col] !== undefined) {
                 // Mark the square where algorithm is trying to place a queen
                if(displayBoard[tempQueenPos.row][tempQueenPos.col] === SQUARE_STATE.EMPTY) {
                    displayBoard[tempQueenPos.row][tempQueenPos.col] = SQUARE_STATE.CANDIDATE;
                }
            }
        }
        setBoard(displayBoard);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
    };

    // --- N-Queen Logic Helper: Check if a queen can be placed ---
    const isSafe = (currentBoard, row, col, N) => {
        // Check this row on left side
        for (let i = 0; i < col; i++) {
            if (currentBoard[row][i] === SQUARE_STATE.QUEEN) return false;
        }
        // Check upper diagonal on left side
        for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
            if (currentBoard[i][j] === SQUARE_STATE.QUEEN) return false;
        }
        // Check lower diagonal on left side
        for (let i = row, j = col; i < N && j >= 0; i++, j--) {
            if (currentBoard[i][j] === SQUARE_STATE.QUEEN) return false;
        }
        return true;
    };


    // --- DFS Algorithm Logic ---
    const solveNQueensDFS = async () => {
        const currentSolutions = [];
        const tempBoard = createInitialBoard(boardSize);

        async function solveDFSUtil(currentBoard, col) {
            if (col >= boardSize) {
                // All queens are placed successfully
                currentSolutions.push(currentBoard.map(r => [...r])); // Store a copy
                // Briefly show this solution on the main board
                setBoard(currentBoard.map(r => [...r]));
                await new Promise(resolve => setTimeout(resolve, animationSpeed * 2));
                return true; // Return true to find all solutions, or false to stop after first
            }

            let foundSolutionInBranch = false;
            for (let i = 0; i < boardSize; i++) { // Try all rows in the current column
                await visualizeStep(currentBoard.map(r => [...r]), {row: i, col: col}); // Show candidate position

                if (isSafe(currentBoard, i, col, boardSize)) {
                    currentBoard[i][col] = SQUARE_STATE.QUEEN;
                    await visualizeStep(currentBoard.map(r => [...r]));


                    if (await solveDFSUtil(currentBoard, col + 1)) {
                        foundSolutionInBranch = true;
                        // To find all solutions, don't stop here, backtrack to find more
                    }

                    // Backtrack
                    currentBoard[i][col] = SQUARE_STATE.EMPTY;
                    if(foundSolutionInBranch && col < boardSize -1){ // if a solution was found down this path, keep the board state for a bit before backtracking this step
                        // No need to do anything special, previous visualization holds
                    }
                    await visualizeStep(currentBoard.map(r => [...r]), {row:i, col:col}); // Show removal
                    await visualizeStep(currentBoard.map(r => [...r])); // Show empty after removal

                } else {
                     // Show current board state (candidate failed)
                    const failedBoard = currentBoard.map(r => [...r]);
                    if(failedBoard[i][col] === SQUARE_STATE.CANDIDATE) failedBoard[i][col] = SQUARE_STATE.EMPTY; // Clear candidate mark
                    // You could add a temporary "ATTACKED" state here for visualization if desired
                    await visualizeStep(failedBoard);
                }
            }
            return foundSolutionInBranch; // Whether any solution was found from this column placement onwards
        }

        await solveDFSUtil(tempBoard, 0);
        setSolutions(currentSolutions);
        if (currentSolutions.length > 0) {
            setBoard(currentSolutions[0]); // Show first solution
            setCurrentSolutionIndex(0);
            setMessage(`${currentSolutions.length} solution(s) found with DFS.`);
        } else {
            setMessage('No solution found with DFS.');
            setBoard(createInitialBoard(boardSize)); // Reset to empty if no solution
        }
    };

    // --- BFS Algorithm Logic ---
    // BFS state: { boardConfig: 2D array, col: current column to place queen }
    const solveNQueensBFS = async () => {
        const queue = [];
        const currentSolutions = [];
        const initialBoard = createInitialBoard(boardSize);
        queue.push({ boardConfig: initialBoard, col: 0 });

        let iterations = 0; // Safety break for very large N or complex BFS
        const MAX_ITERATIONS = 50000; // Adjust as needed

        while (queue.length > 0 && iterations < MAX_ITERATIONS) {
            iterations++;
            const { boardConfig, col } = queue.shift();

            // Visualize current board being processed
            await visualizeStep(boardConfig.map(r => [...r]));

            if (col === boardSize) { // A solution is found
                currentSolutions.push(boardConfig.map(r => [...r]));
                // Optional: Briefly hold on this solution view
                await new Promise(resolve => setTimeout(resolve, animationSpeed));
                continue; // Continue to find all solutions
            }

            // Try placing a queen in each row of the current column ('col')
            for (let row = 0; row < boardSize; row++) {
                await visualizeStep(boardConfig.map(r => [...r]), {row: row, col: col}); // Show candidate

                if (isSafe(boardConfig, row, col, boardSize)) {
                    const newBoardConfig = boardConfig.map(r => [...r]);
                    newBoardConfig[row][col] = SQUARE_STATE.QUEEN;

                    // Visualize placement for BFS expansion
                    await visualizeStep(newBoardConfig.map(r => [...r]));

                    // If not the last column, enqueue the new state
                    if (col < boardSize ) {
                         queue.push({ boardConfig: newBoardConfig, col: col + 1 });
                    }
                } else {
                    // Show current board state (candidate failed)
                    const failedBoard = boardConfig.map(r => [...r]);
                     if(failedBoard[row][col] === SQUARE_STATE.CANDIDATE) failedBoard[row][col] = SQUARE_STATE.EMPTY;
                    await visualizeStep(failedBoard);
                }
            }
        }
         if (iterations >= MAX_ITERATIONS) {
            setMessage(`BFS stopped after ${MAX_ITERATIONS} iterations. Too complex or large N.`);
        }

        setSolutions(currentSolutions);
        if (currentSolutions.length > 0) {
            setBoard(currentSolutions[0]);
            setCurrentSolutionIndex(0);
            setMessage(`${currentSolutions.length} solution(s) found with BFS.`);
        } else {
            if(iterations < MAX_ITERATIONS) setMessage('No solution found with BFS.');
            setBoard(createInitialBoard(boardSize));
        }
    };

    // --- Main Solve Function ---
    const handleSolve = async () => {
        if (isSolving) return;
        setIsSolving(true);
        setMessage(`Solving with ${selectedAlgorithm}...`);
        setSolutions([]);
        setCurrentSolutionIndex(0);
        // Clear board for visualization start, but keep queens from previous solution if any
        const startingBoard = createInitialBoard(boardSize);
        setBoard(startingBoard);
        await new Promise(resolve => setTimeout(resolve, 50)); // Allow UI to update

        if (selectedAlgorithm === 'DFS') {
            await solveNQueensDFS();
        } else if (selectedAlgorithm === 'BFS') {
            await solveNQueensBFS();
        }
        setIsSolving(false);
    };

    // --- Control Handlers ---
    const handleResetBoard = (clearStoredSolutions = true) => {
        if (isSolving) return;
        setBoard(createInitialBoard(boardSize));
        if (clearStoredSolutions) {
            setSolutions([]);
            setCurrentSolutionIndex(0);
            setMessage('Board Reset.');
        } else {
            // if solutions exist, show the first one or an empty board if no solutions
             if (solutions.length > 0 && !clearStoredSolutions) {
                setBoard(solutions[currentSolutionIndex]);
             } else {
                 setBoard(createInitialBoard(boardSize));
             }
        }
    };

    const handleNextSolution = () => {
        if (solutions.length > 0) {
            const newIndex = (currentSolutionIndex + 1) % solutions.length;
            setCurrentSolutionIndex(newIndex);
            setBoard(solutions[newIndex]);
            setMessage(`Displaying solution ${newIndex + 1} of ${solutions.length}.`);
        }
    };

    const handlePreviousSolution = () => {
        if (solutions.length > 0) {
            const newIndex = (currentSolutionIndex - 1 + solutions.length) % solutions.length;
            setCurrentSolutionIndex(newIndex);
            setBoard(solutions[newIndex]);
            setMessage(`Displaying solution ${newIndex + 1} of ${solutions.length}.`);
        }
    };


    // --- Render Functions ---
    const renderCell = (cellState, row, col) => {
        let className = 'cell';
        let content = '';
        const isLightSquare = (row + col) % 2 === 0;
        className += isLightSquare ? ' light' : ' dark';

        switch (cellState) {
            case SQUARE_STATE.EMPTY:
                // className += ' empty'; // Already handled by light/dark
                break;
            case SQUARE_STATE.QUEEN:
                className += ' queen';
                content = 'Q';
                break;
            case SQUARE_STATE.ATTACKED: // Example, if you implement attack visualization
                className += ' attacked';
                break;
            case SQUARE_STATE.CANDIDATE:
                className += ' candidate';
                content = '·'; // Indicate trying
                break;
            default:
                break;
        }

        return (
            <div
                key={`${row}-${col}`}
                className={className}
                style={{
                    width: `calc(min(60vh / ${boardSize}, 60vw / ${boardSize}, 50px))`, // Responsive cell size
                    height: `calc(min(60vh / ${boardSize}, 60vw / ${boardSize}, 50px))`,
                }}
            >
                {content}
            </div>
        );
    };

    return (
        <>
            <h1>N-Queen Problem Visualization</h1>
            <div className="nqueen-container"> {/* Adapted from .rat-in-maze-container */}
                <div>
                    {message && <p className="message">{message}</p>}
                    <div
                        className="chessboard-grid" // Adapted from .maze-grid
                        style={{
                            gridTemplateColumns: `repeat(${boardSize}, auto)`,
                            // Width/height of grid set by cell sizes
                        }}
                    >
                        {board.map((rowArr, rIndex) =>
                            rowArr.map((cell, cIndex) => renderCell(cell, rIndex, cIndex))
                        )}
                    </div>
                </div>

                <div className="controls">
                    <div>
                        <label>Board Size (N): </label>
                        <input
                            type="number"
                            value={boardSize}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setBoardSize(Math.max(1, Math.min(12, val))); // Min 1, Max typically 8-12 for viz
                            }}
                            min="1" max="12" disabled={isSolving}
                        />
                    </div>
                    <div>
                        <label>Animation Speed (ms): </label>
                        <input
                            type="range" min="10" max="1000" step="10"
                            value={animationSpeed}
                            onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                            disabled={isSolving}
                        />
                        <span>{animationSpeed}ms</span>
                    </div>
                    <div>
                        <label>Algorithm: </label>
                        <select value={selectedAlgorithm} onChange={(e) => setSelectedAlgorithm(e.target.value)} disabled={isSolving}>
                            <option value="DFS">Depth-First Search (Backtracking)</option>
                            <option value="BFS">Breadth-First Search</option>
                        </select>
                    </div>
                    <button onClick={handleSolve} disabled={isSolving || boardSize < 1}>
                        Solve with {selectedAlgorithm}
                    </button>
                    <button onClick={() => handleResetBoard(true)} disabled={isSolving}>Reset Board & Solutions</button>
                     {solutions.length > 1 && (
                        <>
                            <button onClick={handlePreviousSolution} disabled={isSolving}>Previous Solution</button>
                            <button onClick={handleNextSolution} disabled={isSolving}>Next Solution</button>
                            <span>({currentSolutionIndex + 1}/{solutions.length})</span>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default NQueenProblem;