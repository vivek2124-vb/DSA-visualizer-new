import React, { useState, useEffect, useCallback, useRef } from 'react';
import './LinearSearch.css';

const PSEUDO_CODE = [
    { id: 0, line: "function linearSearch(array, target):" },
    { id: 1, line: "  for i from 0 to array.length - 1:" },
    { id: 2, line: "    currentElement = array[i]" },
    { id: 3, line: "    if currentElement == target:" },
    { id: 4, line: "      return i  // Element found" },
    { id: 5, line: "  // End for loop" },
    { id: 6, line: "  return -1 // Element not found" },
];

const LinearSearch = () => {
    const [arrayConfig, setArrayConfig] = useState({ size: 10, min: 1, max: 100 }); // Reduced default size for better viewing
    const [arrayData, setArrayData] = useState([]);
    const [userInputArray, setUserInputArray] = useState('');
    const [targetElement, setTargetElement] = useState(null);
    const [userInputTarget, setUserInputTarget] = useState('');
    const [isCustomArrayMode, setIsCustomArrayMode] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(-1);
    const [foundIndex, setFoundIndex] = useState(-1);
    const [visitedIndices, setVisitedIndices] = useState(new Set());
    const [animationSpeed, setAnimationSpeed] = useState(400); // Slightly slower for better observation
    const [isSearching, setIsSearching] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('DFS'); // Remains for consistency, though only one algo shown
    const [stepsTaken, setStepsTaken] = useState(0);

    const [currentCodeLine, setCurrentCodeLine] = useState(null);
    const [isStepMode, setIsStepMode] = useState(false);
    const [isAwaitingNextStep, setIsAwaitingNextStep] = useState(false);
    
    const algorithmGeneratorRef = useRef(null);
    const isSearchingRef = useRef(isSearching); // For async operations to check current search status

    useEffect(() => {
        isSearchingRef.current = isSearching;
    }, [isSearching]);

    const handleResetSearchVisuals = useCallback((resetCodeLine = true) => {
        setCurrentIndex(-1);
        setFoundIndex(-1);
        setVisitedIndices(new Set());
        setStepsTaken(0);
        if (resetCodeLine) setCurrentCodeLine(null);
    }, []);

    const generateRandomArray = useCallback(() => {
        const newArray = [];
        for (let i = 0; i < arrayConfig.size; i++) {
            newArray.push(Math.floor(Math.random() * (arrayConfig.max - arrayConfig.min + 1)) + arrayConfig.min);
        }
        setArrayData(newArray);
        setUserInputArray(newArray.join(', '));
        handleResetSearchVisuals();
        setMessage('New random array generated.');
        setIsCustomArrayMode(false);
        setIsAwaitingNextStep(false);
        algorithmGeneratorRef.current = null;
    }, [arrayConfig, handleResetSearchVisuals]);

    useEffect(() => {
        generateRandomArray();
    }, [generateRandomArray]);


    const handleUserArrayInputChange = (event) => {
        setUserInputArray(event.target.value);
    };

    const handleSetCustomArray = () => {
        // (Implementation from previous version - assumed correct)
        const trimmedInput = userInputArray.trim();
        if (trimmedInput === "") {
            setArrayData([]); handleResetSearchVisuals(); setMessage('Custom array cleared.'); setIsCustomArrayMode(true); return;
        }
        const rawValues = trimmedInput.split(',').map(val => val.trim());
        const validSegments = rawValues.filter(segment => segment !== "");
        const numbers = validSegments.map(Number).filter(val => !isNaN(val));
        if (numbers.length > 0 && numbers.length === validSegments.length) {
            setArrayData(numbers); handleResetSearchVisuals(); setMessage(`Custom array set.`); setIsCustomArrayMode(true);
        } else {
            setMessage('Invalid array input.');
        }
        setIsAwaitingNextStep(false); algorithmGeneratorRef.current = null;
    };
    
    const handleGenerateRandomArrayClick = () => {
        generateRandomArray();
    };

    const handleTargetInputChange = (event) => {
        setUserInputTarget(event.target.value);
    };

    const handleSetTarget = () => {
        const num = parseInt(userInputTarget, 10);
        if (!isNaN(num)) {
            setTargetElement(num); handleResetSearchVisuals(); setMessage(`Target set to ${num}.`);
        } else {
            setTargetElement(null); setMessage('Invalid target.');
        }
        setIsAwaitingNextStep(false); algorithmGeneratorRef.current = null;
    };

    // Generator for step-by-step execution
    function* linearSearchGenerator() {
        setCurrentCodeLine(0); // function linearSearch(...)
        yield { codeLine: 0 };

        let currentStep = 0;
        let itemFoundAtIndex = -1;
        const visited = new Set();
        
        setCurrentCodeLine(1); // for i from 0 ...
        yield { codeLine: 1, step: currentStep };

        for (let i = 0; i < arrayData.length; i++) {
            if (!isSearchingRef.current && !isStepMode) { // Allow interruption for auto mode
                return { interrupted: true, finalMessage: "Search interrupted (auto)." };
            }

            currentStep++;
            setStepsTaken(currentStep);
            setCurrentIndex(i);
            
            setCurrentCodeLine(2); // currentElement = array[i]
            yield { currentIndex: i, codeLine: 2, step: currentStep };
            
            visited.add(i);
            setVisitedIndices(new Set(visited)); // Update visited for UI
            
            setCurrentCodeLine(3); // if currentElement == target
            yield { currentIndex: i, codeLine: 3, step: currentStep };

            if (arrayData[i] === targetElement) {
                itemFoundAtIndex = i;
                setFoundIndex(i);
                setCurrentCodeLine(4); // return i (found)
                yield { foundIndex: i, codeLine: 4, step: currentStep };
                return { found: true, index: i, steps: currentStep, finalMessage: `Element ${targetElement} found at index ${i} in ${currentStep} step(s).` };
            }
            // If not found in this iteration, loop continues or ends.
            // Before next iteration or end of loop, highlight the for loop line again
            if (i < arrayData.length -1) { // If there's a next iteration
                 setCurrentCodeLine(1); // for i from 0 ...
                 yield {codeLine: 1, step: currentStep};
            }
        }
        
        setCurrentCodeLine(5); // // End for loop
        yield { codeLine: 5, step: currentStep };

        setCurrentCodeLine(6); // return -1 (not found)
        yield { codeLine: 6, step: currentStep };
        return { found: false, steps: currentStep, finalMessage: `Element ${targetElement} not found after ${currentStep} step(s).` };
    }

    const runAutomaticSearch = async () => {
        if (targetElement === null || arrayData.length === 0) {
            setMessage(targetElement === null ? 'Set target first.' : 'Array is empty.');
            return;
        }
        
        setIsSearching(true);
        isSearchingRef.current = true;
        setIsStepMode(false);
        algorithmGeneratorRef.current = null;
        handleResetSearchVisuals(false); // Keep codeline if it was just set by step mode init
        setMessage(`Searching for ${targetElement} automatically...`);

        const generator = linearSearchGenerator();
        let result = { done: false, value: {} };

        while (!result.done) {
            result = generator.next();
            const yieldedValue = result.value || {};

            if (yieldedValue.codeLine !== undefined) setCurrentCodeLine(yieldedValue.codeLine);
            if (yieldedValue.currentIndex !== undefined) setCurrentIndex(yieldedValue.currentIndex);
            if (yieldedValue.foundIndex !== undefined) setFoundIndex(yieldedValue.foundIndex);
            // visitedIndices and stepsTaken are updated directly by the generator via setStates

            if (result.done) {
                setMessage(yieldedValue.finalMessage || "Search complete.");
                break;
            }
            
            if (!isSearchingRef.current) { // Check for interruption (e.g. Reset button)
                setMessage("Search interrupted by user.");
                handleResetSearchVisuals();
                break;
            }
            await new Promise(resolve => setTimeout(resolve, animationSpeed));
        }
        
        setIsSearching(false);
        isSearchingRef.current = false;
    };

    const handleStepExecution = (action) => {
        if (targetElement === null || arrayData.length === 0) {
             setMessage(targetElement === null ? 'Set target first.' : 'Array is empty.');
            return;
        }

        if (action === 'start') {
            setIsSearching(true); // Overall search process is active
            setIsStepMode(true);
            isSearchingRef.current = true; // For generator logic
            handleResetSearchVisuals(false); // Don't reset code line immediately
            algorithmGeneratorRef.current = linearSearchGenerator();
            setMessage('Step mode started. Click "Next Step".');
            setIsAwaitingNextStep(true); // Ready for the first step
            // Execute the first step to initialize (e.g., highlight line 0)
            const firstStep = algorithmGeneratorRef.current.next();
            if (firstStep.value && firstStep.value.codeLine !== undefined) {
                setCurrentCodeLine(firstStep.value.codeLine);
            }
             if (firstStep.done) { // Should not happen on first step for this algo
                setMessage(firstStep.value.finalMessage || "Search ended unexpectedly.");
                setIsSearching(false);
                setIsStepMode(false);
                setIsAwaitingNextStep(false);
            }
        } else if (action === 'next' && algorithmGeneratorRef.current) {
            if (!isAwaitingNextStep) return; // Avoid multiple rapid clicks

            const result = algorithmGeneratorRef.current.next();
            const yieldedValue = result.value || {};

            if (yieldedValue.codeLine !== undefined) setCurrentCodeLine(yieldedValue.codeLine);
            if (yieldedValue.currentIndex !== undefined) setCurrentIndex(yieldedValue.currentIndex);
            if (yieldedValue.foundIndex !== undefined) setFoundIndex(yieldedValue.foundIndex);
            // visitedIndices and stepsTaken updated by generator via setStates

            if (result.done) {
                setMessage(yieldedValue.finalMessage || "Search complete.");
                setIsSearching(false);
                setIsStepMode(false);
                setIsAwaitingNextStep(false);
                algorithmGeneratorRef.current = null; // Clear the generator
            } else {
                setIsAwaitingNextStep(true); // Ready for another step
            }
        }
    };

    const toggleStepMode = () => {
        if (isSearching && !isStepMode) return; // Don't toggle if auto search is running

        if (isStepMode) { // Switching from Step to Auto (or just disabling step mode)
            setIsStepMode(false);
            setIsAwaitingNextStep(false);
            setIsSearching(false); // Reset general search status
            algorithmGeneratorRef.current = null;
            handleResetSearchVisuals(); // Full reset of visuals
            setMessage("Step mode disabled. Run automatically or start step mode again.");
        } else { // Enabling step mode
            handleStepExecution('start');
        }
    };
    
    const handleStartSearch = () => { // This button will now primarily trigger auto search
        if (isSearching) return;
        setIsStepMode(false); // Ensure step mode is off
        setIsAwaitingNextStep(false);
        algorithmGeneratorRef.current = null;
        runAutomaticSearch();
    };

    const handleFullReset = () => {
        setIsSearching(false); 
        isSearchingRef.current = false; // Critical for stopping ongoing generator/loops
        setIsStepMode(false);
        setIsAwaitingNextStep(false);
        algorithmGeneratorRef.current = null;
        setTimeout(() => { // Allow state to propagate
            generateRandomArray(); 
            setUserInputTarget('');
            setTargetElement(null);
            // generateRandomArray sets its own message.
        }, 50); 
    };

    const handleClearHighlights = () => {
        setIsSearching(false); 
        isSearchingRef.current = false;
        setIsStepMode(false);
        setIsAwaitingNextStep(false);
        algorithmGeneratorRef.current = null;
         setTimeout(() => {
            handleResetSearchVisuals(true); // Reset codeline too 
            setMessage('Highlights cleared. Array and target remain.');
        }, 50);
    };


    const getCellClass = (value, index) => {
        let className = 'array-cell';
        if (index === foundIndex) {
            className += ' found';
        } else if (index === currentIndex) {
            className += ' current';
        } else if (visitedIndices.has(index)) {
            className += ' visited';
        }
        return className;
    };

    return (
        <>
            <h1>1D Array Search Visualization</h1>
            <div className="search-visualizer-container">
                <div className="main-content-area"> {/* Was array-display-area */}
                    {message && <p className="message">{message}</p>}
                    <div className="array-display">
                        {arrayData.map((value, index) => (
                            <div key={index} className={getCellClass(value, index)}>
                                <span className="array-value">{value}</span>
                                <span className="array-index">{index}</span>
                            </div>
                        ))}
                        {arrayData.length === 0 && <p>Array is empty. Generate or input an array.</p>}
                    </div>
                    <div className="code-visualization-box">
                        <h3>Linear Search Algorithm</h3>
                        {PSEUDO_CODE.map(line => (
                            <span key={line.id} className={`code-line ${currentCodeLine === line.id ? 'highlighted' : ''}`}>
                                {line.line}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="sidebar-area"> {/* New wrapper for controls and code box */}
                    <div className="controls">
                        {/* ... (All previous controls: Array Size, Custom Array, Target, Algorithm (though less relevant now), Speed) ... */}
                        <div>
                            <label>Array Size (for random): </label>
                            <div className='flex_row'>
                                <input type="number" value={arrayConfig.size} onChange={(e) => !isCustomArrayMode && setArrayConfig(prev => ({ ...prev, size: Math.max(1, parseInt(e.target.value)) }))} min="1" max="30" disabled={isSearching || isCustomArrayMode}/>
                                <button onClick={handleGenerateRandomArrayClick} disabled={isSearching || isStepMode && isAwaitingNextStep}>Generate Random Array</button>
                            </div>
                        </div>
                        <hr/>
                        <div>
                            <label>Custom Array (comma-separated):</label>
                            <div className='flex_row'>
                                <input type="text" value={userInputArray} onChange={handleUserArrayInputChange} placeholder="e.g., 1,2,3" disabled={isSearching || isStepMode && isAwaitingNextStep} className="custom-array-input"/>
                                <button onClick={handleSetCustomArray} disabled={isSearching || isStepMode && isAwaitingNextStep}>Set Custom Array</button>
                            </div>
                        </div>
                        <hr />
                        <div>
                            <label>Target Element: </label>
                            <div className='flex_row'>
                                <input type="text" value={userInputTarget} onChange={handleTargetInputChange} placeholder="e.g., 42" disabled={isSearching || isStepMode && isAwaitingNextStep}/>
                                <button onClick={handleSetTarget} disabled={isSearching || isStepMode && isAwaitingNextStep}>Set Target</button>
                            </div>
                        </div>
                         <div>
                            <label>Animation Speed (Auto Mode ms): </label>
                            <div className='flex_row'>
                                <input type="range" min="50" max="2000" step="50" value={animationSpeed} onChange={(e) => setAnimationSpeed(parseInt(e.target.value))} disabled={isSearching || isStepMode && isAwaitingNextStep}/>
                                <span>{animationSpeed}ms</span>
                            </div>
                        </div>
                        <hr/>
                        {/* Main Action Buttons */}
                        <button onClick={handleStartSearch} disabled={isSearching || (isStepMode && isAwaitingNextStep) || targetElement === null || arrayData.length === 0}>
                            Run Automatically
                        </button>
                        <button onClick={toggleStepMode} className="secondary" disabled={isSearching && !isStepMode}>
                            {isStepMode ? 'Disable Step Mode' : 'Enable Step Mode'}
                        </button>
                        {isStepMode && (
                            <button onClick={() => handleStepExecution('next')} disabled={!isAwaitingNextStep || (isSearching && !isStepMode)}>
                                Next Step
                            </button>
                        )}
                        <hr/>
                        <button onClick={handleClearHighlights} disabled={isSearching && !isStepMode}>Clear Highlights</button>
                        <button onClick={handleFullReset} disabled={isSearching && !isStepMode}>Reset All & New Array</button>
                        
                        {stepsTaken > 0 && <p className="steps-message">Steps: {stepsTaken}</p>}
                    </div>

                </div>
                    
            </div>
        </>
    );
};

export default LinearSearch;