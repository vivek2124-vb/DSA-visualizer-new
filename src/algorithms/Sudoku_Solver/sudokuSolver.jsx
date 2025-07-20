
import React, { useState, useEffect, useCallback } from 'react';
import './SudokuSolver.css';

const GRID_SIZE = 9;
const EMPTY_CELL = 0;

// --- Helper Functions ---
const createEmptyGrid = () => {
    return Array(GRID_SIZE)
        .fill(null)
        .map(() => Array(GRID_SIZE).fill(EMPTY_CELL));
};

const copyGrid = (grid) => {
    return grid.map(row => [...row]);
};

// Check if a number can be placed in a cell
const isSafe = (grid, row, col, num) => {
    // Check row
    for (let x = 0; x < GRID_SIZE; x++) {
        if (grid[row][x] === num) {
            return false;
        }
    }
    // Check column
    for (let x = 0; x < GRID_SIZE; x++) {
        if (grid[x][col] === num) {
            return false;
        }
    }
    // Check 3x3 subgrid
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[i + startRow][j + startCol] === num) {
                return false;
            }
        }
    }
    return true;
};

const findEmptyCell = (grid) => {
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === EMPTY_CELL) {
                return [r, c];
            }
        }
    }
    return null; // All cells are filled
};


const SudokuSolver = () => {
    const [initialGrid, setInitialGrid] = useState(createEmptyGrid());
    const [grid, setGrid] = useState(createEmptyGrid());
    const [visualGridInfo, setVisualGridInfo] = useState( // For visual cues
        createEmptyGrid().map(row => row.map(() => ({ status: 'empty', number: 0 })))
    );
    const [selectedCell, setSelectedCell] = useState(null); // {row, col} for input
    const [isSolving, setIsSolving] = useState(false);
    const [algorithmSpeed, setAlgorithmSpeed] = useState(200);
    const [message, setMessage] = useState('');
    const [isCustomInputMode, setIsCustomInputMode] = useState(false);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('DFS'); // DFS or BFS

    // Reset grid to initial state or empty
    const handleResetGrid = useCallback((clearAll = false) => {
        if (isSolving) return;
        const newGrid = clearAll ? createEmptyGrid() : copyGrid(initialGrid);
        setGrid(newGrid);
        setVisualGridInfo(
            newGrid.map(row =>
                row.map(cellValue => ({
                    status: cellValue !== EMPTY_CELL ? 'prefilled' : 'empty',
                    number: cellValue,
                }))
            )
        );
        setMessage('');
        setSelectedCell(null);
    }, [initialGrid, isSolving]);

    // Effect to initialize grid
    useEffect(() => {
        handleResetGrid();
    }, [handleResetGrid]);


    const handleClearSolution = useCallback(() => {
        if (isSolving) return;
        setGrid(copyGrid(initialGrid));
         setVisualGridInfo(
            initialGrid.map(row =>
                row.map(cellValue => ({
                    status: cellValue !== EMPTY_CELL ? 'prefilled' : 'empty',
                    number: cellValue,
                }))
            )
        );
        setMessage('');
    }, [initialGrid, isSolving]);


    const handleToggleCustomInputMode = () => {
        if (isSolving) return;
        setIsCustomInputMode(prev => {
            if (!prev) { // Entering custom input mode
                setInitialGrid(copyGrid(grid)); // Save current grid as initial
                setMessage('Custom input enabled. Click a cell and type a number (1-9). 0 to clear.');
            } else { // Exiting custom input mode
                setMessage('');
            }
            return !prev;
        });
        setSelectedCell(null);
    };

    const handleCellClick = (row, col) => {
        if (isSolving) return;
        if (isCustomInputMode) {
            setSelectedCell({ row, col });
        }
    };

    const handleInputChange = (event) => {
        if (!isCustomInputMode || !selectedCell || isSolving) return;

        const { row, col } = selectedCell;
        let value = parseInt(event.target.value);

        if (isNaN(value) || value < 0 || value > 9) {
            value = EMPTY_CELL; // Or keep previous valid value
        }

        const newGrid = copyGrid(grid);
        const newInitialGrid = copyGrid(initialGrid); // Also update initial grid for custom input

        if (value === EMPTY_CELL || isSafe(newGrid, row, col, value) || newGrid[row][col] === value) {
            newGrid[row][col] = value;
            newInitialGrid[row][col] = value; // User inputs become part of the "puzzle"
             setMessage('');
        } else {
            setMessage(`Cannot place ${value} at [${row}, ${col}]. Conflict!`);
            // Optionally revert or highlight conflict
            // For simplicity, we'll allow it but it won't solve if invalid
            newGrid[row][col] = value; // Still place it, solver will fail
            newInitialGrid[row][col] = value;
        }

        setGrid(newGrid);
        setInitialGrid(newInitialGrid); // Important for reset to work with custom puzzle

        setVisualGridInfo(prevVisual => {
            const newVisual = prevVisual.map(r => r.map(c => ({ ...c })));
            newVisual[row][col] = {
                status: value !== EMPTY_CELL ? 'prefilled' : 'empty',
                number: value,
            };
            return newVisual;
        });
    };

    // --- Visualization Update Function ---
    const updateVisualCell = async (row, col, status, number = null, delay = algorithmSpeed) => {
        setVisualGridInfo(prev => {
            const newVisual = prev.map(r => r.map(c => ({ ...c })));
            newVisual[row][col].status = status;
            if (number !== null) newVisual[row][col].number = number;
            return newVisual;
        });
        if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
    };


    // --- DFS (Backtracking) Solver ---
    const solveDFS = async () => {
        const tempGrid = copyGrid(grid);

        async function backtrack(currentGrid) {
            const emptyCell = findEmptyCell(currentGrid);
            if (!emptyCell) {
                return true; // Solved
            }
            const [row, col] = emptyCell;

            await updateVisualCell(row, col, 'current-dfs', currentGrid[row][col], algorithmSpeed / 2);

            for (let num = 1; num <= 9; num++) {
                if (isSafe(currentGrid, row, col, num)) {
                    currentGrid[row][col] = num;
                    await updateVisualCell(row, col, 'trying-dfs', num);

                    if (await backtrack(currentGrid)) {
                        await updateVisualCell(row, col, 'solved', num, 0); // Mark as part of final solution
                        return true;
                    }

                    // Backtrack
                    currentGrid[row][col] = EMPTY_CELL;
                    await updateVisualCell(row, col, 'backtracking-dfs', EMPTY_CELL);
                }
            }
            await updateVisualCell(row, col, 'empty', EMPTY_CELL, algorithmSpeed / 3); // Reset if no num worked
            return false; // No solution from this path
        }

        const solved = await backtrack(tempGrid);
        if (solved) {
            setGrid(tempGrid); // Update main grid with solution
             // Final pass to mark all solved cells correctly
            setVisualGridInfo(tempGrid.map((rowArr, r) => rowArr.map((val, c) => ({
                status: initialGrid[r][c] !== EMPTY_CELL ? 'prefilled' : (val !== EMPTY_CELL ? 'solved' : 'empty'),
                number: val
            }))));
            setMessage('Sudoku Solved with DFS!');
        } else {
            setMessage('No solution found with DFS.');
            handleClearSolution(); // Reset to initial if no solution
        }
        return solved;
    };

    // --- BFS Solver ---
    const solveBFS = async () => {
        const queue = [];
        const initialBoardState = {
            board: copyGrid(grid),
            // path: [] // Optional: to store steps if needed for complex visualization
        };
        queue.push(initialBoardState);

        const visitedStates = new Set(); // To avoid cycles and redundant work, store stringified boards

        while (queue.length > 0) {
            const { board: currentBoard } = queue.shift();
            const boardString = currentBoard.map(row => row.join('')).join('-');

            if (visitedStates.has(boardString)) {
                continue;
            }
            visitedStates.add(boardString);

            // Visualize current board state being processed
            setGrid(currentBoard); // Show this board
            setVisualGridInfo(
                currentBoard.map((rowArr, r) =>
                    rowArr.map((val, c) => ({
                        status: initialGrid[r][c] !== EMPTY_CELL && initialGrid[r][c] === val ? 'prefilled' :
                                val !== EMPTY_CELL ? 'current-bfs-fill' : 'empty',
                        number: val,
                    }))
                )
            );
            await new Promise(resolve => setTimeout(resolve, algorithmSpeed));


            const emptyCell = findEmptyCell(currentBoard);
            if (!emptyCell) { // If no empty cell, it means it's a solution
                setGrid(currentBoard); // Already set
                setVisualGridInfo(currentBoard.map((rowArr, r) => rowArr.map((val, c) => ({
                    status: initialGrid[r][c] !== EMPTY_CELL ? 'prefilled' : 'solved',
                    number: val
                }))));
                setMessage('Sudoku Solved with BFS!');
                return true;
            }

            const [row, col] = emptyCell;
            await updateVisualCell(row, col, 'current-bfs-scan', currentBoard[row][col], algorithmSpeed / 2);


            for (let num = 1; num <= 9; num++) {
                await updateVisualCell(row, col, 'trying-bfs', num, algorithmSpeed / 2);
                if (isSafe(currentBoard, row, col, num)) {
                    const newBoard = copyGrid(currentBoard);
                    newBoard[row][col] = num;
                    // No immediate visual update for enqueuing, current board is the focus
                    queue.push({ board: newBoard });
                }
            }
            // After trying all numbers for this cell, reset its visual for next iteration
            await updateVisualCell(row, col,
                currentBoard[row][col] !== EMPTY_CELL ? 'current-bfs-fill' : 'empty',
                currentBoard[row][col],
                algorithmSpeed /3);
        }

        setMessage('No solution found with BFS or queue limit reached.');
        handleClearSolution();
        return false;
    };


    const handleSolve = async () => {
        if (isSolving) return;
        setIsSolving(true);
        setMessage(`Solving with ${selectedAlgorithm}...`);
        await handleClearSolution(); // Clear previous attempts, keep initial puzzle
         // Brief delay to allow UI to update after clearing
        await new Promise(resolve => setTimeout(resolve, 100));

        setGrid(copyGrid(initialGrid)); // Ensure solver starts from the initial puzzle
        setVisualGridInfo( // Reset visual grid based on initialGrid
            initialGrid.map((rowArr, r) =>
                rowArr.map((val, c) => ({
                    status: val !== EMPTY_CELL ? 'prefilled' : 'empty',
                    number: val,
                }))
            )
        );
        await new Promise(resolve => setTimeout(resolve, 50)); // Give visual grid time to update


        let success = false;
        if (selectedAlgorithm === 'DFS') {
            success = await solveDFS();
        } else if (selectedAlgorithm === 'BFS') {
            success = await solveBFS();
        }

        setIsSolving(false);
        if (!success && !message.includes("Solved")) { // If no success and not already messaged
             setMessage(prev => prev || `No solution found with ${selectedAlgorithm}.`);
        }
        setSelectedCell(null); // Deselect cell after solving attempt
    };


    const samplePuzzle1 = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ];

    const handleLoadSample = () => {
        if (isSolving) return;
        setInitialGrid(copyGrid(samplePuzzle1));
        setGrid(copyGrid(samplePuzzle1));
        setVisualGridInfo(
            samplePuzzle1.map(row =>
                row.map(cellValue => ({
                    status: cellValue !== EMPTY_CELL ? 'prefilled' : 'empty',
                    number: cellValue,
                }))
            )
        );
        setMessage('Sample puzzle loaded.');
        setIsCustomInputMode(false);
    };


    // --- Render Functions ---
    const renderCell = (cellInfo, r, c) => {
        let className = 'sudoku-cell';
        const { status, number } = cellInfo;

        if (r === 2 || r === 5) className += ' thick-border-bottom';
        if (c === 2 || c === 5) className += ' thick-border-right';

        className += ` cell-status-${status}`;

        if (selectedCell && selectedCell.row === r && selectedCell.col === c && isCustomInputMode) {
            className += ' selected-for-input';
        }


        return (
            <div
                key={`${r}-${c}`}
                className={className}
                onClick={() => handleCellClick(r, c)}
            >
                { (isCustomInputMode && selectedCell && selectedCell.row ===r && selectedCell.col ===c) ?
                    <input
                        type="number"
                        min="0" max="9"
                        value={grid[r][c] === EMPTY_CELL ? '' : grid[r][c]}
                        onChange={handleInputChange}
                        disabled={isSolving || initialGrid[r][c] !== EMPTY_CELL && !isCustomInputMode} // Disable prefilled if not in custom mode
                        className="cell-input"
                        autoFocus
                    />
                    :
                    (number !== EMPTY_CELL ? number : '')
                }
            </div>
        );
    };

    return (
        <>
            <h1>Sudoku Solver Visualization</h1>
            <div className="sudoku-solver-container">
                <div className="sudoku-grid-area">
                    {message && <p className={`message message-${selectedAlgorithm.toLowerCase()}`}>{message}</p>}
                    <div className="sudoku-grid">
                        {visualGridInfo.map((rowArr, rIndex) =>
                            rowArr.map((cellInfo, cIndex) => renderCell(cellInfo, rIndex, cIndex))
                        )}
                    </div>
                </div>

                <div className="sudoku-controls">
                    <div>
                        <label>Algorithm: </label>
                        <select value={selectedAlgorithm} onChange={(e) => setSelectedAlgorithm(e.target.value)} disabled={isSolving}>
                            <option value="DFS">Backtracking (DFS)</option>
                            <option value="BFS">Breadth-First Search (BFS)</option>
                        </select>
                    </div>
                    <div>
                        <label>Speed (ms): </label>
                        <input
                            type="range" min="10" max="1000" step="10"
                            value={algorithmSpeed}
                            onChange={(e) => setAlgorithmSpeed(parseInt(e.target.value))}
                            disabled={isSolving}
                        />
                        <span>{algorithmSpeed}ms</span>
                    </div>

                    <button onClick={handleSolve} disabled={isSolving}>
                        Run {selectedAlgorithm}
                    </button>
                     <button onClick={handleLoadSample} disabled={isSolving}>Load Sample Puzzle</button>
                    <button onClick={handleToggleCustomInputMode} disabled={isSolving} className={isCustomInputMode ? 'active' : ''}>
                        {isCustomInputMode ? 'Done Custom Input' : 'Enter Custom Puzzle'}
                    </button>
                    <button onClick={() => handleResetGrid(true)} disabled={isSolving}>Reset to Empty Grid</button>
                    <button onClick={() => handleResetGrid(false)} disabled={isSolving}>Reset to Current Puzzle</button>
                    <button onClick={handleClearSolution} disabled={isSolving}>Clear Solution</button>
                </div>
            </div>
        </>
    );
};

export default SudokuSolver;