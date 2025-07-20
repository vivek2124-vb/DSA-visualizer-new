// SubsetSumVisualizer.jsx (Further Revised)
import React, { useState, useEffect, useCallback } from 'react';
import './SubsetSumVisualizer.css'; // Assuming this CSS is the same

const SubsetSumVisualizer = () => {
    // ... (all your existing state variables: numberSetInput, targetSumInput, numberSet, targetSum, etc.)
    const [numberSetInput, setNumberSetInput] = useState('5, 10, 12, 13, 15, 18');
    const [targetSumInput, setTargetSumInput] = useState('30');
    const [numberSet, setNumberSet] = useState([]);
    const [targetSum, setTargetSum] = useState(0);
    const [elementsVisualState, setElementsVisualState] = useState([]);
    const [currentDfsPath, setCurrentDfsPath] = useState([]);
    const [currentDfsSum, setCurrentDfsSum] = useState(0);
    const [foundSubsets, setFoundSubsets] = useState([]);
    const [isSolving, setIsSolving] = useState(false);
    const [algorithmSpeed, setAlgorithmSpeed] = useState(300);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('DFS');
    const [message, setMessage] = useState('');

    // Flag to ensure useEffect runs the solver only once per trigger
    const [solveTrigger, setSolveTrigger] = useState(0);


    const processInputChanges = useCallback(() => {
        // ... (same as your last working version of processInputChanges)
        const parsedSet = numberSetInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
        const parsedSumVal = parseInt(targetSumInput.trim());
        const isValidSum = !isNaN(parsedSumVal) && parsedSumVal > 0;
        setNumberSet(parsedSet);
        setTargetSum(isValidSum ? parsedSumVal : 0);
        setElementsVisualState(parsedSet.map(val => ({ value: val, status: 'idle' })));
        if (numberSetInput.trim() !== "" && parsedSet.length === 0) {
            setMessage('Invalid number set. Please use comma-separated positive integers.');
        } else if (targetSumInput.trim() !== "" && !isValidSum) {
            setMessage('Invalid target sum. Please use a positive integer.');
        } else if (message.startsWith("Invalid")) {
             setMessage('');
        }
        return parsedSet.length > 0 && isValidSum;
    }, [numberSetInput, targetSumInput, message]);

    useEffect(() => {
        processInputChanges();
    }, [numberSetInput, targetSumInput, processInputChanges]);

    const updateElementState = async (index, status) => {
        // ... (same as your last working version of updateElementState)
        setElementsVisualState(prevStates => {
            const newStates = [...prevStates];
            if (newStates[index]) {
                if (newStates[index].status === 'foundInSubset' && status === 'considering') {
                    newStates[index].status = status;
                } else if (newStates[index].status !== 'foundInSubset' || status === 'foundInSubset' || status === 'idle') {
                    newStates[index].status = status;
                }
            }
            return newStates;
        });
        if (algorithmSpeed > 0) await new Promise(res => setTimeout(res, algorithmSpeed));
    };

    // --- Solver Functions (Make sure they are defined or imported correctly) ---
    // solveDFS and solveBFS should be defined here, as in your previous working version.
    // For brevity, I'll assume they are the same as the last "Revised" one.
    // IMPORTANT: Make sure these functions now correctly use `isSolving` from the component's state.
    // As they are defined within the component, they will close over the `isSolving` state.

    const solveDFS = useCallback(async (currentSetForSolve, targetSumForSolve) => {
        const solutionsAccumulator = [];
        async function findSubsetsRecursive(index, sum, path) {
            // *** Add a console.log here to be absolutely sure ***
            // console.log("DFS Entry: isSolving=", isSolving, "index=", index, "sum=", sum, "path=", path.join(','));

            if (!isSolving) { // This check is against the component's `isSolving` state
                // console.log("DFS: Bailing out, isSolving is false.");
                return;
            }
            setCurrentDfsPath([...path]);
            setCurrentDfsSum(sum);
            if (sum > targetSumForSolve) return;
            if (sum === targetSumForSolve) {
                solutionsAccumulator.push([...path]);
                setFoundSubsets(prev => [...prev, [...path]]);
                path.forEach(numInPath => {
                    const elIndex = currentSetForSolve.findIndex(el => el === numInPath);
                    if(elIndex !== -1) updateElementState(elIndex, 'foundInSubset');
                });
                setMessage(`DFS Found: {${path.join(', ')}}. Searching...`);
                await new Promise(res => setTimeout(res, Math.max(100, algorithmSpeed * 1.5)));
                return;
            }
            if (index >= currentSetForSolve.length) return;
            await updateElementState(index, 'considering');
            path.push(currentSetForSolve[index]);
            await findSubsetsRecursive(index + 1, sum + currentSetForSolve[index], path);
            path.pop();
            if (!isSolving) return;
            if (elementsVisualState[index]?.status !== 'foundInSubset') {
               await updateElementState(index, 'idle');
            }
            if (!isSolving) return;
            await findSubsetsRecursive(index + 1, sum, path);
        }
        await findSubsetsRecursive(0, 0, []);
        return solutionsAccumulator;
    }, [isSolving, algorithmSpeed, elementsVisualState, setCurrentDfsPath, setCurrentDfsSum, setFoundSubsets, setMessage, updateElementState]); // Added dependencies for useCallback

    const solveBFS = useCallback(async (currentSetForSolve, targetSumForSolve) => {
        // ... (Your BFS logic, ensure it also checks `isSolving` and has dependencies for useCallback)
        // For brevity, assuming it's similar to previous. Remember to add dependencies if using useCallback.
        const solutionsAccumulator = [];
        const queue = [{ currentSubset: [], currentSum: 0, currentIndex: 0 }];
        let head = 0;
        while(head < queue.length) {
            if (!isSolving) return solutionsAccumulator;
            const { currentSubset, currentSum, currentIndex } = queue[head++];
            //setMessage(`BFS: Checking subset {${currentSubset.join(', ')}} (Sum: ${currentSum}), Next Idx: ${currentIndex}`);
            if (currentSum === targetSumForSolve) {
                solutionsAccumulator.push([...currentSubset]);
                setFoundSubsets(prev => [...prev, [...currentSubset]]);
                currentSubset.forEach(num => {
                     const elIndex = currentSetForSolve.findIndex(n => n === num);
                     if (elIndex !== -1) updateElementState(elIndex, 'foundInSubset');
                 });
                setMessage(`BFS Found: {${currentSubset.join(', ')}}. Sum: ${currentSum}. Searching...`);
                if (algorithmSpeed > 0) await new Promise(res => setTimeout(res, Math.max(100, algorithmSpeed * 1.5)));
            }
            if (currentIndex >= currentSetForSolve.length || currentSum >= targetSumForSolve && currentSum !== targetSumForSolve) {
                continue;
            }
            if (currentIndex < currentSetForSolve.length) {
                await updateElementState(currentIndex, 'considering');
            }
            const elementToInclude = currentSetForSolve[currentIndex];
            if (currentSum + elementToInclude <= targetSumForSolve) {
                queue.push({ currentSubset: [...currentSubset, elementToInclude], currentSum: currentSum + elementToInclude, currentIndex: currentIndex + 1 });
            }
            queue.push({ currentSubset: [...currentSubset], currentSum: currentSum, currentIndex: currentIndex + 1 });
            if (currentIndex < currentSetForSolve.length && elementsVisualState[currentIndex]?.status !== 'foundInSubset') {
                 await updateElementState(currentIndex, 'idle');
            }
            if (algorithmSpeed > 0) await new Promise(res => setTimeout(res, algorithmSpeed / 2));
        }
        return solutionsAccumulator;
    }, [isSolving, algorithmSpeed, elementsVisualState, setFoundSubsets, setMessage, updateElementState]);


    // This useEffect will run the solver when isSolving becomes true AND solveTrigger changes.
    useEffect(() => {
        if (isSolving && solveTrigger > 0) { // Check solveTrigger to ensure it runs once per click
            const runSolver = async () => {
                setMessage(`Solving with ${selectedAlgorithm}... (Set: {${numberSet.join(', ')}}, Target: ${targetSum})`);
                // Small delay for the message to appear
                await new Promise(resolve => setTimeout(resolve, 50));

                const currentSetForSolve = [...numberSet]; // Capture current values
                const targetSumForSolve = targetSum;
                // solutionsFoundThisRun variable is not strictly needed if foundSubsets is updated directly
                // let solutionsFoundThisRun = [];

                if (selectedAlgorithm === 'DFS') {
                    await solveDFS(currentSetForSolve, targetSumForSolve);
                } else if (selectedAlgorithm === 'BFS') {
                    await solveBFS(currentSetForSolve, targetSumForSolve);
                }

                // After solver finishes or is stopped (isSolving might be false if stopped by user)
                // Access the component's current isSolving state again to decide final message.
                // This is still tricky. A ref is better for accessing latest state inside async effect.
                // For now, we'll assume handleStop sets its own message.
                // The foundSubsets state should be up-to-date from the solvers.

                if (isSolving) { // Check if it wasn't stopped by handleStop
                    if (foundSubsets.length > 0) {
                        setMessage(`Found ${foundSubsets.length} subset(s) summing to ${targetSumForSolve}.`);
                    } else {
                        setMessage(`No subsets found summing to ${targetSumForSolve}.`);
                    }
                    setIsSolving(false); // Solving finished normally
                }
                // If handleStop was called, isSolving is already false and message is set.
            };

            runSolver();
        }
        // No cleanup needed for solveTrigger itself, but if isSolving becomes false (e.g. by handleStop)
        // while runSolver is active, runSolver's internal checks for !isSolving should handle it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSolving, solveTrigger]); // Key dependencies

    const handleSolve = () => { // Not async anymore
        if (numberSet.length === 0) {
            setMessage('Set is empty or invalid. Please enter numbers.');
            return;
        }
        if (targetSum <= 0) {
            setMessage('Target sum must be a positive integer.');
            return;
        }

        // Reset states for the new solve operation
        setFoundSubsets([]);
        setCurrentDfsPath([]);
        setCurrentDfsSum(0);
        setElementsVisualState(numberSet.map(val => ({ value: val, status: 'idle' })));
        setMessage('Preparing to solve...'); // Initial prep message

        // Trigger the useEffect to start solving
        setIsSolving(true);
        setSolveTrigger(prev => prev + 1); // Increment to ensure effect runs
    };

    const handleStop = () => {
        setIsSolving(false); // This will be seen by the useEffect and internal solver checks
        setMessage("Solver stopped by user.");
        setCurrentDfsPath([]);
        setCurrentDfsSum(0);
        setElementsVisualState(prevStates => prevStates.map(s =>
            s.status === 'considering' ? { ...s, status: 'idle' } : s
        ));
    };

    const handleReset = useCallback(() => { // Added useCallback
        setIsSolving(false);
        const defaultNumberSetInput = '5, 10, 12, 13, 15, 18';
        const defaultTargetSumInput = '30';
        setNumberSetInput(defaultNumberSetInput);
        setTargetSumInput(defaultTargetSumInput);

        const parsedSet = defaultNumberSetInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
        const parsedSum = parseInt(defaultTargetSumInput.trim());

        setNumberSet(parsedSet);
        setTargetSum(parsedSum > 0 ? parsedSum : 0);
        setElementsVisualState(parsedSet.map(val => ({ value: val, status: 'idle' })));
        setFoundSubsets([]);
        setMessage('');
        setCurrentDfsPath([]);
        setCurrentDfsSum(0);
        setSolveTrigger(0); // Reset trigger
    }, []); // Empty dependency array for useCallback, as it uses constants or setters only

    useEffect(() => {
        handleReset();
    }, [handleReset]); // Now depends on memoized handleReset


    return (
        // ... Your JSX structure remains the same ...
        // Ensure button `onClick={handleSolve}` is correct
        // and other parts of JSX are as in the previous "Revised" version.
        <>
            <h1>Subset Sum Visualizer</h1>
            {/* ... (rest of your JSX from the previous working structure) ... */}
            <div className="subset-sum-container">
                <div className="subset-sum-viz-area">
                    <div className="input-set-display">
                        <h3>Input Set: (Target: {targetSum > 0 ? targetSum : 'N/A'})</h3>
                        <div className="elements-container">
                            {elementsVisualState.map((el, index) => (
                                <div key={index} className={`element-box element-status-${el.status}`}>
                                    {el.value}
                                </div>
                            ))}
                            {numberSet.length === 0 && <p className="empty-set-info">Enter numbers below.</p>}
                        </div>
                    </div>

                    {selectedAlgorithm === 'DFS' && isSolving && (
                        <div className="dfs-info">
                            <p>DFS Path: {`{${currentDfsPath.join(', ')}}`}</p>
                            <p>DFS Sum: {currentDfsSum}</p>
                        </div>
                    )}

                    <div className="found-subsets-display">
                        <h3>Found Subsets:</h3>
                        { (!isSolving && foundSubsets.length === 0 && message && !message.toLowerCase().includes("invalid") && !message.toLowerCase().includes("empty") && !message.toLowerCase().includes("preparing")) &&
                            <p className="no-results-info">No subsets found, or calculation not run for current inputs.</p>
                        }
                        {isSolving && foundSubsets.length === 0 && message.toLowerCase().includes("solving") && <p className="no-results-info">Searching...</p>}
                        <ul>
                            {foundSubsets.map((subset, index) => (
                                <li key={index}>{`{${subset.join(', ')}}`}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="subset-sum-controls">
                    <div>
                        <label htmlFor="numberSet">Number Set (comma-separated positive integers):</label>
                        <input type="text" id="numberSet" value={numberSetInput} onChange={(e) => setNumberSetInput(e.target.value)} disabled={isSolving} />
                    </div>
                    <div>
                        <label htmlFor="targetSum">Target Sum (positive integer):</label>
                        <input type="number" id="targetSum" value={targetSumInput} onChange={(e) => setTargetSumInput(e.target.value)} min="1" disabled={isSolving} />
                    </div>
                    <div>
                        <label>Algorithm: </label>
                        <select value={selectedAlgorithm} onChange={(e) => setSelectedAlgorithm(e.target.value)} disabled={isSolving}>
                            <option value="DFS">Backtracking (DFS)</option>
                            <option value="BFS">Breadth-First Search (BFS)</option>
                        </select>
                    </div>
                    <div>
                        <label>Speed (ms delay): </label>
                        <input type="range" min="0" max="1000" step="50" value={algorithmSpeed} onChange={(e) => setAlgorithmSpeed(parseInt(e.target.value))} disabled={isSolving} />
                        <span>{algorithmSpeed}ms</span>
                    </div>

                    {!isSolving ? (
                        <button onClick={handleSolve} disabled={numberSet.length === 0 || targetSum <= 0 || message.toLowerCase().includes("invalid")}>
                            Run {selectedAlgorithm}
                        </button>
                    ) : (
                        <button onClick={handleStop}>Stop Solver</button>
                    )}
                    <button onClick={handleReset}>Reset</button> {/* Removed disabled={isSolving} to allow reset to stop */}
                    {message && <p className="message subset-message">{message}</p>}
                </div>
            </div>
        </>
    );
};

export default SubsetSumVisualizer;