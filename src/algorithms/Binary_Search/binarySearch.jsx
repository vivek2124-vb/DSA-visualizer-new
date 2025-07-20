// BinarySearch.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import './BinarySearch.css'; // Ensure this CSS file exists and is correctly styled

const PSEUDO_CODE = [
    { id: 0, line: "function binarySearch(sortedArray, target):" },
    { id: 1, line: "  low = 0" },
    { id: 2, line: "  high = sortedArray.length - 1" },
    { id: 3, line: "  while low <= high:" },
    { id: 4, line: "    mid = floor((low + high) / 2)" },
    { id: 5, line: "    currentElement = sortedArray[mid]" },
    { id: 6, line: "    if currentElement == target:" },
    { id: 7, line: "      return mid  // Element found" },
    { id: 8, line: "    else if currentElement < target:" },
    { id: 9, line: "      low = mid + 1 // Search in right half" },
    { id: 10, line: "    else:" },
    { id: 11, line: "      high = mid - 1 // Search in left half" },
    { id: 12, line: "  // End while loop" },
    { id: 13, line: "  return -1 // Element not found" },
];

const BinarySearch = () => {
    const [arrayConfig, setArrayConfig] = useState({ size: 10, min: 1, max: 100 });
    const [arrayData, setArrayData] = useState([]);
    const [userInputArray, setUserInputArray] = useState('');
    const [targetElement, setTargetElement] = useState(null);
    const [userInputTarget, setUserInputTarget] = useState('');
    const [isCustomArrayMode, setIsCustomArrayMode] = useState(false);

    const [midIndex, setMidIndex] = useState(-1); // Represents the 'current' pointer
    const [lowPointer, setLowPointer] = useState(-1);
    const [highPointer, setHighPointer] = useState(-1);
    const [foundIndex, setFoundIndex] = useState(-1);
    const [visitedIndices, setVisitedIndices] = useState(new Set());
    const [animationSpeed, setAnimationSpeed] = useState(500);
    const [isSearching, setIsSearching] = useState(false);
    const [message, setMessage] = useState('');
    const [stepsTaken, setStepsTaken] = useState(0);

    const [currentCodeLine, setCurrentCodeLine] = useState(null);
    const [isStepMode, setIsStepMode] = useState(false);
    const [isAwaitingNextStep, setIsAwaitingNextStep] = useState(false);

    const algorithmGeneratorRef = useRef(null);
    const isSearchingRef = useRef(isSearching);

    useEffect(() => {
        isSearchingRef.current = isSearching;
    }, [isSearching]);

    const handleResetSearchVisuals = useCallback((resetCodeLine = true) => {
        setMidIndex(-1);
        setLowPointer(-1);
        setHighPointer(-1);
        setFoundIndex(-1);
        setVisitedIndices(new Set());
        setStepsTaken(0);
        if (resetCodeLine) setCurrentCodeLine(null);
    }, []);

    const sortArrayAndSet = useCallback((arr, sourceMessagePrefix = "") => {
        const sortedArr = [...arr].sort((a, b) => a - b);
        setArrayData(sortedArr);
        setUserInputArray(sortedArr.join(', '));
        handleResetSearchVisuals();
        setMessage(`${sourceMessagePrefix} Array has been sorted for Binary Search.`);
        setIsAwaitingNextStep(false);
        algorithmGeneratorRef.current = null;
        return sortedArr;
    }, [handleResetSearchVisuals]);

    const generateRandomArray = useCallback(() => {
        const newArray = [];
        for (let i = 0; i < arrayConfig.size; i++) {
            newArray.push(Math.floor(Math.random() * (arrayConfig.max - arrayConfig.min + 1)) + arrayConfig.min);
        }
        sortArrayAndSet(newArray, "New random array generated.");
        setIsCustomArrayMode(false);
    }, [arrayConfig, sortArrayAndSet]);

    useEffect(() => {
        generateRandomArray();
    }, [generateRandomArray]);


    const handleUserArrayInputChange = (event) => {
        setUserInputArray(event.target.value);
    };

    const handleSetCustomArray = () => {
        const trimmedInput = userInputArray.trim();
        if (trimmedInput === "") {
            setArrayData([]);
            handleResetSearchVisuals();
            setMessage('Custom array cleared. It will be sorted if populated.');
            setIsCustomArrayMode(true);
            return;
        }
        const rawValues = trimmedInput.split(',').map(val => val.trim());
        const validSegments = rawValues.filter(segment => segment !== "");
        const numbers = validSegments.map(Number).filter(val => !isNaN(val));

        if (numbers.length > 0 && numbers.length === validSegments.length) {
            // Check if already sorted
            let isSorted = true;
            for (let i = 0; i < numbers.length - 1; i++) {
                if (numbers[i] > numbers[i+1]) {
                    isSorted = false;
                    break;
                }
            }
            const prefix = isSorted ? "Custom array set." : "Custom array was unsorted.";
            sortArrayAndSet(numbers, prefix);
            setIsCustomArrayMode(true);
        } else {
            setMessage('Invalid array input. Please use comma-separated numbers.');
        }
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
            setTargetElement(num);
            handleResetSearchVisuals(); // Reset visuals but keep array
            setMessage(`Target set to ${num}.`);
        } else {
            setTargetElement(null);
            setMessage('Invalid target value.');
        }
        setIsAwaitingNextStep(false);
        algorithmGeneratorRef.current = null;
    };

    function* binarySearchGenerator() {
        setCurrentCodeLine(0); // function binarySearch...
        yield { codeLine: 0 };

        let low = 0;
        let high = arrayData.length - 1;
        let currentStep = 0;
        const visited = new Set();

        setLowPointer(low);
        setCurrentCodeLine(1); // low = 0
        yield { low, codeLine: 1 };

        setHighPointer(high);
        setCurrentCodeLine(2); // high = array.length - 1
        yield { high, codeLine: 2 };

        while (low <= high) {
            if (!isSearchingRef.current && !isStepMode) {
                return { interrupted: true, finalMessage: "Search interrupted (auto)." };
            }
            
            setCurrentCodeLine(3); // while low <= high
            yield {low, high, codeLine: 3};


            currentStep++;
            setStepsTaken(currentStep);

            let mid = Math.floor((low + high) / 2);
            setMidIndex(mid);
            setLowPointer(low); // Keep updating low/high for visuals
            setHighPointer(high);
            
            setCurrentCodeLine(4); // mid = floor...
            yield { mid, low, high, codeLine: 4, step: currentStep };
            
            visited.add(mid);
            setVisitedIndices(new Set(visited));
            
            setCurrentCodeLine(5); // currentElement = sortedArray[mid]
            yield { mid, low, high, codeLine: 5, step: currentStep };


            setCurrentCodeLine(6); // if currentElement == target
            yield { mid, low, high, codeLine: 6, step: currentStep };

            if (arrayData[mid] === targetElement) {
                setFoundIndex(mid);
                setCurrentCodeLine(7); // return mid
                yield { foundIndex: mid, mid, low, high, codeLine: 7, step: currentStep };
                return { found: true, index: mid, steps: currentStep, finalMessage: `Element ${targetElement} found at index ${mid} in ${currentStep} step(s).` };
            }
            
            setCurrentCodeLine(8); // else if currentElement < target
            yield { mid, low, high, codeLine: 8, step: currentStep };

            if (arrayData[mid] < targetElement) {
                low = mid + 1;
                setLowPointer(low);
                setCurrentCodeLine(9); // low = mid + 1
                yield { mid, low, high, codeLine: 9, step: currentStep };
            } else {
                setCurrentCodeLine(10); // else
                yield { mid, low, high, codeLine: 10, step: currentStep };
                high = mid - 1;
                setHighPointer(high);
                setCurrentCodeLine(11); // high = mid - 1
                yield { mid, low, high, codeLine: 11, step: currentStep };
            }
             // Before next iteration of while, highlight the while condition
            if (low <= high) { // If loop continues
                setCurrentCodeLine(3); // while low <= high
                yield {low, high, codeLine: 3, step: currentStep};
            }
        }
        
        setCurrentCodeLine(12); // // End while loop
        yield { codeLine: 12, step: currentStep };

        setCurrentCodeLine(13); // return -1
        yield { codeLine: 13, step: currentStep };
        return { found: false, steps: currentStep, finalMessage: `Element ${targetElement} not found after ${currentStep} step(s). Array searched: [${arrayData.slice(0, Math.min(arrayData.length, 10)).join(', ')}${arrayData.length > 10 ? '...' : ''}]` };
    }


    const runAutomaticSearch = async () => {
        if (targetElement === null || arrayData.length === 0) {
            setMessage(targetElement === null ? 'Set target first.' : 'Array is empty. Generate or input an array.');
            return;
        }

        setIsSearching(true);
        isSearchingRef.current = true;
        setIsStepMode(false);
        algorithmGeneratorRef.current = null; // Clear any previous generator
        handleResetSearchVisuals(false);
        setMessage(`Searching for ${targetElement} automatically...`);

        const generator = binarySearchGenerator();
        let result = { done: false, value: {} };

        while (!result.done) {
            result = generator.next();
            const yieldedValue = result.value || {};

            if (yieldedValue.codeLine !== undefined) setCurrentCodeLine(yieldedValue.codeLine);
            if (yieldedValue.mid !== undefined) setMidIndex(yieldedValue.mid);
            if (yieldedValue.low !== undefined) setLowPointer(yieldedValue.low);
            if (yieldedValue.high !== undefined) setHighPointer(yieldedValue.high);
            if (yieldedValue.foundIndex !== undefined) setFoundIndex(yieldedValue.foundIndex);

            if (result.done) {
                setMessage(yieldedValue.finalMessage || "Search complete.");
                break;
            }
            
            if (!isSearchingRef.current) {
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
            setIsSearching(true);
            setIsStepMode(true);
            isSearchingRef.current = true;
            handleResetSearchVisuals(false);
            algorithmGeneratorRef.current = binarySearchGenerator();
            setMessage('Step mode started. Click "Next Step".');
            setIsAwaitingNextStep(true);
            
            const firstStep = algorithmGeneratorRef.current.next(); // Initial step (e.g., highlight line 0)
            if (firstStep.value && firstStep.value.codeLine !== undefined) {
                setCurrentCodeLine(firstStep.value.codeLine);
            }
            if (firstStep.value && firstStep.value.low !== undefined) setLowPointer(firstStep.value.low);
            if (firstStep.value && firstStep.value.high !== undefined) setHighPointer(firstStep.value.high);


            if (firstStep.done) {
                setMessage(firstStep.value.finalMessage || "Search ended unexpectedly on first step.");
                setIsSearching(false); setIsStepMode(false); setIsAwaitingNextStep(false);
            }
        } else if (action === 'next' && algorithmGeneratorRef.current) {
            if (!isAwaitingNextStep) return;

            const result = algorithmGeneratorRef.current.next();
            const yieldedValue = result.value || {};

            if (yieldedValue.codeLine !== undefined) setCurrentCodeLine(yieldedValue.codeLine);
            if (yieldedValue.mid !== undefined) setMidIndex(yieldedValue.mid);
            if (yieldedValue.low !== undefined) setLowPointer(yieldedValue.low);
            if (yieldedValue.high !== undefined) setHighPointer(yieldedValue.high);
            if (yieldedValue.foundIndex !== undefined) setFoundIndex(yieldedValue.foundIndex);
            
            if (result.done) {
                setMessage(yieldedValue.finalMessage || "Search complete.");
                setIsSearching(false); setIsStepMode(false); setIsAwaitingNextStep(false);
                algorithmGeneratorRef.current = null;
            } else {
                setIsAwaitingNextStep(true);
            }
        }
    };
    
    const toggleStepMode = () => {
        if (isSearching && !isStepMode) return;

        if (isStepMode) {
            setIsStepMode(false); setIsAwaitingNextStep(false); setIsSearching(false);
            algorithmGeneratorRef.current = null;
            handleResetSearchVisuals();
            setMessage("Step mode disabled.");
        } else {
            handleStepExecution('start');
        }
    };
    
    const handleStartSearch = () => {
        if (isSearching) return;
        setIsStepMode(false); setIsAwaitingNextStep(false);
        algorithmGeneratorRef.current = null;
        runAutomaticSearch();
    };

    const handleFullReset = () => {
        setIsSearching(false); 
        isSearchingRef.current = false;
        setIsStepMode(false);
        setIsAwaitingNextStep(false);
        algorithmGeneratorRef.current = null;
        setTimeout(() => {
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
            handleResetSearchVisuals(true); 
            setMessage('Highlights cleared. Array and target remain.');
        }, 50);
    };

    const getCellClass = (value, index) => {
        let className = 'array-cell';
        if (index === foundIndex) {
            className += ' found';
        } else if (index === midIndex) {
            className += ' current'; // Mid pointer
        } else if (visitedIndices.has(index)) {
            className += ' visited';
        }
        
        // Dim cells outside the current low-high search range
        if (isSearching || isStepMode) { // Only apply inactive styling during search
             if (index < lowPointer || index > highPointer) {
                 className += ' inactive-range';
             }
        }
        return className;
    };

    return (
        <>
            <h1>Binary Search Visualization</h1>
            <div className="search-visualizer-container">
                <div className="main-content-area">
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
                        <h3>Binary Search Algorithm</h3>
                        {PSEUDO_CODE.map(line => (
                            <span key={line.id} className={`code-line ${currentCodeLine === line.id ? 'highlighted' : ''}`}>
                                {line.line}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="sidebar-area">
                    <div className="controls">
                        <div>
                            <label>Array Size (for random): </label>
                             <div className='flex_row'>
                                <input type="number" value={arrayConfig.size} onChange={(e) => !isCustomArrayMode && setArrayConfig(prev => ({ ...prev, size: Math.max(1, parseInt(e.target.value)) }))} min="1" max="30" disabled={isSearching || isCustomArrayMode}/>
                                <button onClick={handleGenerateRandomArrayClick} disabled={isSearching || (isStepMode && isAwaitingNextStep)}>Generate & Sort Array</button>
                            </div>
                        </div>
                        <hr/>
                        <div>
                            <label>Custom Array (comma-separated):</label>
                             <div className='flex_row'>
                                <input type="text" value={userInputArray} onChange={handleUserArrayInputChange} placeholder="e.g., 1,2,3" disabled={isSearching || (isStepMode && isAwaitingNextStep)} className="custom-array-input"/>
                                <button onClick={handleSetCustomArray} disabled={isSearching || (isStepMode && isAwaitingNextStep)}>Set & Sort Custom Array</button>
                            </div>
                        </div>
                        <hr />
                        <div>
                            <label>Target Element: </label>
                            <div className='flex_row'>
                                <input type="text" value={userInputTarget} onChange={handleTargetInputChange} placeholder="e.g., 42" disabled={isSearching || (isStepMode && isAwaitingNextStep)}/>
                                <button onClick={handleSetTarget} disabled={isSearching || (isStepMode && isAwaitingNextStep)}>Set Target</button>
                            </div>
                        </div>
                         <div>
                            <label>Animation Speed (Auto Mode ms): </label>
                            <div className='flex_row'>
                                <input type="range" min="50" max="2000" step="50" value={animationSpeed} onChange={(e) => setAnimationSpeed(parseInt(e.target.value))} disabled={isSearching || (isStepMode && isAwaitingNextStep)}/>
                                <span>{animationSpeed}ms</span>
                            </div>
                        </div>
                        <hr/>
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

export default BinarySearch;