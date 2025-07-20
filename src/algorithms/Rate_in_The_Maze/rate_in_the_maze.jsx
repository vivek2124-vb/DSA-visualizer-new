import React, { useState, useEffect, useCallback } from 'react';
import './RateInMaze.css';

// Optional: For smooth animations
// import { motion } from 'framer-motion';

// --- Constants ---
const CELL_TYPE = {
    EMPTY: 0,
    WALL: 1,
    RAT: 2,
    CHEESE: 3, // Or destination
    PATH: 4,
    VISITED: 5, // For visualizing visited cells during search
};

const DIRECTION_SYMBOLS = {
    UP: 'U',
    DOWN: 'D',
    LEFT: 'L',
    RIGHT: 'R',
};

// (dx, dy, directionSymbol)
const MOVES = [
    [-1, 0, DIRECTION_SYMBOLS.UP], // Up
    [1, 0, DIRECTION_SYMBOLS.DOWN], // Down
    [0, -1, DIRECTION_SYMBOLS.LEFT], // Left
    [0, 1, DIRECTION_SYMBOLS.RIGHT], // Right
];


// --- Helper Functions ---
const createInitialMaze = (rows, cols) => {
    return Array(rows)
        .fill(null)
        .map(() => Array(cols).fill(CELL_TYPE.EMPTY));
};

// --- RatInMaze Component ---
const RatInMaze = () => { // Renamed component to follow React conventions (PascalCase)
    // --- State Variables ---
    const [mazeConfig, setMazeConfig] = useState({ rows: 10, cols: 10 });
    const [maze, setMaze] = useState(() => createInitialMaze(mazeConfig.rows, mazeConfig.cols));
    const [ratStartPos, setRatStartPos] = useState({ row: 0, col: 0 }); // Initial logical Rat Position
    const [cheesePosition, setCheesePosition] = useState({ row: mazeConfig.rows - 1, col: mazeConfig.cols - 1 });
    const [animatedRatPosition, setAnimatedRatPosition] = useState({ row: 0, col: 0 }); // For animation during solve
    const [algorithmSpeed, setAlgorithmSpeed] = useState(200); // ms (made it a bit faster default)
    const [isSolving, setIsSolving] = useState(false);
    const [foundPath, setFoundPath] = useState([]); // Array of {row, col, directionSymbol}
    const [message, setMessage] = useState('');
    const [isCustomWallMode, setIsCustomWallMode] = useState(false);
    const [pathString, setPathString] = useState('');
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('DFS'); // New state for algorithm selection

    // --- Effects ---
    // Regenerate maze when size changes
    useEffect(() => {
        handleResetMaze(false); // Reset with new dimensions
    }, [mazeConfig.rows, mazeConfig.cols]); // Removed useCallback dependency warning

    // Initialize start and end points on the new maze
    useEffect(() => {
        const newStartRow = 0;
        const newStartCol = 0;
        const newEndRow = Math.max(0, mazeConfig.rows - 1);
        const newEndCol = Math.max(0, mazeConfig.cols - 1);

        setRatStartPos({ row: newStartRow, col: newStartCol });
        setAnimatedRatPosition({ row: newStartRow, col: newStartCol });
        setCheesePosition({ row: newEndRow, col: newEndCol });

        setMaze(prevMaze => {
            const newMaze = createInitialMaze(mazeConfig.rows, mazeConfig.cols); // Start fresh
            if (newMaze[newStartRow] && newMaze[newStartRow][newStartCol] !== undefined) {
                newMaze[newStartRow][newStartCol] = CELL_TYPE.RAT;
            }
            if (newMaze[newEndRow] && newMaze[newEndRow][newEndCol] !== undefined) {
                newMaze[newEndRow][newEndCol] = CELL_TYPE.CHEESE;
            }
            return newMaze;
        });
    }, [mazeConfig]);


    // --- Maze Manipulation Functions ---
    const handleGenerateWalls = useCallback(() => {
        if (isSolving) return;
        const newMaze = createInitialMaze(mazeConfig.rows, mazeConfig.cols);
        for (let r = 0; r < mazeConfig.rows; r++) {
            for (let c = 0; c < mazeConfig.cols; c++) {
                if (Math.random() < 0.25) {
                    newMaze[r][c] = CELL_TYPE.WALL;
                }
            }
        }
        newMaze[ratStartPos.row][ratStartPos.col] = CELL_TYPE.RAT;
        newMaze[cheesePosition.row][cheesePosition.col] = CELL_TYPE.CHEESE;
        setMaze(newMaze);
        setFoundPath([]);
        setPathString('');
        setMessage('');
        setAnimatedRatPosition({ ...ratStartPos });
    }, [mazeConfig, ratStartPos, cheesePosition, isSolving]);

    const handleToggleCustomWallMode = () => {
        setIsCustomWallMode(prev => !prev);
        setMessage(isCustomWallMode ? '' : 'Click on cells to toggle walls. Click again to disable.');
    };

    const handleCellClick = (row, col) => {
        if (isSolving) return;

        if (isCustomWallMode) {
            if ((row === ratStartPos.row && col === ratStartPos.col) ||
                (row === cheesePosition.row && col === cheesePosition.col)) {
                setMessage('Cannot place a wall on start or end point.');
                return;
            }
            const newMaze = maze.map(r => [...r]);
            newMaze[row][col] = newMaze[row][col] === CELL_TYPE.WALL ? CELL_TYPE.EMPTY : CELL_TYPE.WALL;
            setMaze(newMaze);
        }
    };

    const handleResetMaze = useCallback((generateNewWalls = true) => {
        if (isSolving) return;
        const newMaze = createInitialMaze(mazeConfig.rows, mazeConfig.cols);

        // Ensure ratStartPos and cheesePosition are within new bounds
        const currentRatStart = {
            row: Math.min(ratStartPos.row, mazeConfig.rows - 1),
            col: Math.min(ratStartPos.col, mazeConfig.cols -1)
        };
         const currentCheesePos = {
            row: Math.min(cheesePosition.row, mazeConfig.rows -1),
            col: Math.min(cheesePosition.col, mazeConfig.cols -1)
        };
        // If they were outside, update them (though useEffect on mazeConfig should handle this too)
        if(ratStartPos.row >= mazeConfig.rows || ratStartPos.col >= mazeConfig.cols) setRatStartPos(currentRatStart);
        if(cheesePosition.row >= mazeConfig.rows || cheesePosition.col >= mazeConfig.cols) setCheesePosition(currentCheesePos);


        newMaze[currentRatStart.row][currentRatStart.col] = CELL_TYPE.RAT;
        newMaze[currentCheesePos.row][currentCheesePos.col] = CELL_TYPE.CHEESE;

        setMaze(newMaze);
        setFoundPath([]);
        setPathString('');
        setMessage('');
        setIsSolving(false);
        setAnimatedRatPosition({ ...currentRatStart });

        if (generateNewWalls) {
            // Call a modified version that uses the current (potentially adjusted) start/end
             const tempMaze = createInitialMaze(mazeConfig.rows, mazeConfig.cols);
            for (let r = 0; r < mazeConfig.rows; r++) {
                for (let c = 0; c < mazeConfig.cols; c++) {
                    if (Math.random() < 0.25) {
                        tempMaze[r][c] = CELL_TYPE.WALL;
                    }
                }
            }
            tempMaze[currentRatStart.row][currentRatStart.col] = CELL_TYPE.RAT;
            tempMaze[currentCheesePos.row][currentCheesePos.col] = CELL_TYPE.CHEESE;
            setMaze(tempMaze);
        }
    }, [isSolving, mazeConfig, ratStartPos, cheesePosition]); // Added dependencies


    const handleClearPath = useCallback(() => { // Made it useCallback
        if (isSolving) return;
        const newMaze = maze.map(row =>
            row.map(cell => (cell === CELL_TYPE.PATH || cell === CELL_TYPE.VISITED ? CELL_TYPE.EMPTY : cell))
        );
        newMaze[ratStartPos.row][ratStartPos.col] = CELL_TYPE.RAT;
        newMaze[cheesePosition.row][cheesePosition.col] = CELL_TYPE.CHEESE;
        setMaze(newMaze);
        setFoundPath([]);
        setPathString('');
        setMessage('');
        setAnimatedRatPosition({ ...ratStartPos });
    }, [isSolving, maze, ratStartPos, cheesePosition]); // Added dependencies

    // --- Algorithm Helper: Mark final path on maze ---
    const highlightFinalPath = (finalPathPoints) => {
        setMaze(prevMaze => {
            const finalMaze = prevMaze.map(mRow => [...mRow]);
            finalPathPoints.forEach(p => {
                if (!(p.row === ratStartPos.row && p.col === ratStartPos.col) &&
                    !(p.row === cheesePosition.row && p.col === cheesePosition.col)) {
                    finalMaze[p.row][p.col] = CELL_TYPE.PATH;
                }
            });
            // Ensure rat and cheese are visible
            finalMaze[ratStartPos.row][ratStartPos.col] = CELL_TYPE.RAT;
            finalMaze[cheesePosition.row][cheesePosition.col] = CELL_TYPE.CHEESE;
            return finalMaze;
        });
    };

    // --- DFS Algorithm Logic ---
    const solveDFS = async () => {
        const path = [];
        const visited = Array(mazeConfig.rows)
            .fill(null)
            .map(() => Array(mazeConfig.cols).fill(false));
        let currentPathStringArray = [];

        async function dfsRecursive(r, c) {
            if (
                r < 0 || r >= mazeConfig.rows ||
                c < 0 || c >= mazeConfig.cols ||
                maze[r][c] === CELL_TYPE.WALL || // Check against the main maze state for walls
                visited[r][c]
            ) {
                return false;
            }

            visited[r][c] = true;
            path.push({ row: r, col: c });
            setAnimatedRatPosition({ row: r, col: c }); // Animate rat moving here

            setMaze(prevMaze => {
                const newMaze = prevMaze.map(row => [...row]);
                if (newMaze[r][c] === CELL_TYPE.EMPTY) {
                    newMaze[r][c] = CELL_TYPE.VISITED;
                }
                return newMaze;
            });
            await new Promise(resolve => setTimeout(resolve, algorithmSpeed / 2));

            if (r === cheesePosition.row && c === cheesePosition.col) {
                setFoundPath([...path]);
                setPathString(currentPathStringArray.join(' -> '));
                highlightFinalPath(path);
                setMessage('Path Found with DFS!');
                return true;
            }

            for (const [dr, dc, symbol] of MOVES) {
                const nr = r + dr;
                const nc = c + dc;

                currentPathStringArray.push(symbol);
                // Tentative move animation for DFS is handled by the recursive call's setAnimatedRatPosition

                if (await dfsRecursive(nr, nc)) {
                    return true;
                }
                currentPathStringArray.pop(); // Backtrack: remove direction
            }

            path.pop(); // Backtrack
            // Optional: Animate backtracking by un-visiting
            setMaze(prevMaze => {
                const newMaze = prevMaze.map(row => [...row]);
                if (newMaze[r][c] === CELL_TYPE.VISITED) { // Only un-color if it was a visited empty cell
                     // Check if it's not the start or end to avoid briefly clearing them if path is short
                    if (!((r === ratStartPos.row && c === ratStartPos.col) || (r === cheesePosition.row && c === cheesePosition.col))) {
                         newMaze[r][c] = CELL_TYPE.EMPTY;
                    }
                }
                return newMaze;
            });
             // Animate rat moving back during backtrack
            if (path.length > 0) { // Move back to previous cell in path
                const prevCell = path[path.length -1];
                setAnimatedRatPosition({row: prevCell.row, col: prevCell.col});
            }
            await new Promise(resolve => setTimeout(resolve, algorithmSpeed / 3));
            return false;
        }

        return await dfsRecursive(ratStartPos.row, ratStartPos.col);
    };

    // --- BFS Algorithm Logic ---
    const solveBFS = async () => {
        const queue = [];
        const visited = Array(mazeConfig.rows)
            .fill(null)
            .map(() => Array(mazeConfig.cols).fill(false));
        const parentMap = new Map(); // To reconstruct path: key = "r-c", value = {r, c, symbol} of parent

        const startNode = { row: ratStartPos.row, col: ratStartPos.col, pathSymbols: [] };
        queue.push(startNode);
        visited[startNode.row][startNode.col] = true;
        setAnimatedRatPosition({ row: startNode.row, col: startNode.col }); // Rat starts at its position

        // Mark start as visited (visual only, if not rat/cheese)
        setMaze(prevMaze => {
            const newMaze = prevMaze.map(row => [...row]);
            if (newMaze[startNode.row][startNode.col] === CELL_TYPE.EMPTY) {
                 newMaze[startNode.row][startNode.col] = CELL_TYPE.VISITED;
            }
            return newMaze;
        });
        await new Promise(resolve => setTimeout(resolve, algorithmSpeed / 2));


        while (queue.length > 0) {
            const current = queue.shift();
            const { row: r, col: c, pathSymbols } = current;

            setAnimatedRatPosition({ row: r, col: c }); // Animate rat moving to current processing cell

            if (r === cheesePosition.row && c === cheesePosition.col) {
                // Path Found! Reconstruct it.
                const path = [];
                let tempR = r, tempC = c;
                while (tempR !== ratStartPos.row || tempC !== ratStartPos.col) {
                    path.unshift({ row: tempR, col: tempC });
                    const parentInfo = parentMap.get(`${tempR}-${tempC}`);
                    if (!parentInfo) break; // Should not happen if logic is correct
                    tempR = parentInfo.r;
                    tempC = parentInfo.c;
                }
                path.unshift({ row: ratStartPos.row, col: ratStartPos.col }); // Add start node

                setFoundPath(path);
                setPathString(pathSymbols.join(' -> '));
                highlightFinalPath(path);
                setMessage('Path Found with BFS!');
                return true;
            }

            for (const [dr, dc, symbol] of MOVES) {
                const nr = r + dr;
                const nc = c + dc;

                if (
                    nr >= 0 && nr < mazeConfig.rows &&
                    nc >= 0 && nc < mazeConfig.cols &&
                    maze[nr][nc] !== CELL_TYPE.WALL && // Check against main maze state
                    !visited[nr][nc]
                ) {
                    visited[nr][nc] = true;
                    parentMap.set(`${nr}-${nc}`, { r, c, symbol }); // Parent is current (r,c)
                    const newPathSymbols = [...pathSymbols, symbol];
                    queue.push({ row: nr, col: nc, pathSymbols: newPathSymbols });

                    // Animate cell being added to queue/visited
                    setMaze(prevMaze => {
                        const newMaze = prevMaze.map(row => [...row]);
                        if (newMaze[nr][nc] === CELL_TYPE.EMPTY) {
                            newMaze[nr][nc] = CELL_TYPE.VISITED;
                        }
                        return newMaze;
                    });
                    await new Promise(resolve => setTimeout(resolve, algorithmSpeed / 2));
                }
            }
        }
        return false; // No path found
    };


    // --- Main Solve Function ---
    const handleSolveMaze = async () => {
        if (isSolving) return;
        setIsSolving(true);
        setMessage(`Solving with ${selectedAlgorithm}...`);
        setFoundPath([]);
        setPathString('');
        await handleClearPath(); // Clear previous path visuals and await its completion

        // Brief delay to allow UI to update after clearing path
        await new Promise(resolve => setTimeout(resolve, 50));


        // Ensure rat is at the start position visually for the algorithm start
        setAnimatedRatPosition({ ...ratStartPos });
        setMaze(prevMaze => {
            const newMaze = prevMaze.map(row => [...row]);
            // Ensure rat and cheese are present
            newMaze[ratStartPos.row][ratStartPos.col] = CELL_TYPE.RAT;
            newMaze[cheesePosition.row][cheesePosition.col] = CELL_TYPE.CHEESE;
            return newMaze;
        });

        let success = false;
        if (selectedAlgorithm === 'DFS') {
            success = await solveDFS();
        } else if (selectedAlgorithm === 'BFS') {
            success = await solveBFS();
        }

        if (!success) {
            setMessage(`No Path Found with ${selectedAlgorithm}!`);
        }
        setIsSolving(false);
        setAnimatedRatPosition({ ...ratStartPos }); // Reset animated rat to start if no path or after path
    };


    // --- Render Functions ---
    const renderCell = (cellType, row, col) => {
        let className = 'cell';
        let content = '';

        // Determine base cell type for styling
        switch (cellType) {
            case CELL_TYPE.EMPTY: className += ' empty'; break;
            case CELL_TYPE.WALL: className += ' wall'; break;
            case CELL_TYPE.RAT: className += ' rat-start'; content = 'S'; break; // Mark start
            case CELL_TYPE.CHEESE: className += ' cheese'; content = 'C'; break;
            case CELL_TYPE.PATH: className += ' path'; break;
            case CELL_TYPE.VISITED: className += ' visited'; break;
            default: break;
        }

        // Superimpose animated rat if it's solving and at this cell
        // And it's not the designated CHEESE cell (cheese always shows 'C')
        if (isSolving && row === animatedRatPosition.row && col === animatedRatPosition.col && cellType !== CELL_TYPE.CHEESE) {
            className += ' rat-current'; // Could be 'rat empty rat-current' or 'rat visited rat-current' etc.
            content = 'R';
        } else if (!isSolving && row === ratStartPos.row && col === ratStartPos.col) {
            // When not solving, ensure the start position shows the rat icon
             className = 'cell rat-start'; // Override other classes like empty for the start
             content = 'S'; // Or 'R' if you prefer for static start
        }


        return (
            <div
                key={`${row}-${col}`}
                className={className}
                onClick={() => handleCellClick(row, col)}
            >
                {content}
            </div>
        );
    };

    return (
        <>
            <h1>Rat in a Maze Visualization</h1>
            <div className="rat-in-maze-container">
                <div>
                    {message && <p className="message">{message}</p>}
                    <div
                        className="maze-grid"
                        style={{
                            gridTemplateColumns: `repeat(${mazeConfig.cols}, 30px)`,
                            gridTemplateRows: `repeat(${mazeConfig.rows}, 30px)`,
                        }}
                    >
                        {maze.map((rowArr, rIndex) =>
                            rowArr.map((cell, cIndex) => renderCell(cell, rIndex, cIndex))
                        )}
                    </div>
                </div>

                <div className="controls">
                    <div>
                        <label>Maze Size (Rows x Cols): </label>
                        <input
                            type="number"
                            value={mazeConfig.rows}
                            onChange={(e) => setMazeConfig(prev => ({ ...prev, rows: Math.max(3, parseInt(e.target.value)) }))}
                            min="3" max="30" disabled={isSolving}
                        />
                        x
                        <input
                            type="number"
                            value={mazeConfig.cols}
                            onChange={(e) => setMazeConfig(prev => ({ ...prev, cols: Math.max(3, parseInt(e.target.value)) }))}
                            min="3" max="30" disabled={isSolving}
                        />
                    </div>
                    <div>
                        <label>Algorithm Speed (ms): </label>
                        <input
                            type="range" min="10" max="1000" step="10"
                            value={algorithmSpeed}
                            onChange={(e) => setAlgorithmSpeed(parseInt(e.target.value))}
                            disabled={isSolving}
                        />
                        <span>{algorithmSpeed}ms</span>
                    </div>
                    <div>
                        <label>Algorithm: </label>
                        <select value={selectedAlgorithm} onChange={(e) => setSelectedAlgorithm(e.target.value)} disabled={isSolving}>
                            <option value="DFS">Depth-First Search (DFS)</option>
                            <option value="BFS">Breadth-First Search (BFS)</option>
                        </select>
                    </div>
                    <button onClick={handleGenerateWalls} disabled={isSolving}>Generate Random Walls</button>
                    <button onClick={handleToggleCustomWallMode} disabled={isSolving} className={isCustomWallMode ? 'active' : ''}>
                        {isCustomWallMode ? 'Disable Custom Walls' : 'Enable Custom Walls'}
                    </button>
                    <button onClick={handleSolveMaze} disabled={isSolving || !maze.length}>
                        Run {selectedAlgorithm}
                    </button>
                    <button onClick={() => handleResetMaze(true)} disabled={isSolving}>Reset Maze & Walls</button>
                    <button onClick={() => handleResetMaze(false)} disabled={isSolving}>Reset Maze (Keep Walls)</button>
                    <button onClick={handleClearPath} disabled={isSolving}>Clear Path & Visited</button>
                </div>
            </div>
            {pathString && (
                <div className="path-display">
                    <h3>Found Path ({selectedAlgorithm}):</h3>
                    <p>{pathString}</p>
                </div>
            )}
        </>
    );
};

export default RatInMaze;