import React, { useState, useEffect, useCallback } from 'react';
import './StrassenMatrixMultiplication.css';

// --- Constants for Cell States/Styling ---
const STYLE_TYPE = {
    DEFAULT: 'default',
    MATRIX_A: 'matrix-a-bg', // Base background for Matrix A
    MATRIX_B: 'matrix-b-bg', // Base background for Matrix B
    RESULT_C: 'result-c-bg', // Base background for Matrix C
    SUB_A_HIGHLIGHT: 'sub-a-highlight',
    SUB_B_HIGHLIGHT: 'sub-b-highlight',
    SUB_C_HIGHLIGHT: 'sub-c-highlight',
    OPERAND_HIGHLIGHT: 'operand-highlight',
    PRODUCT_TERM_HIGHLIGHT: 'product-term-highlight', // For P1-P7 in scratchpad
    INTERMEDIATE_HIGHLIGHT: 'intermediate-highlight', // For S1-S10 in scratchpad
    FINAL_CELL_HIGHLIGHT: 'final-cell-highlight', // For result cells in C
};


// --- Helper Functions ---
const createMatrix = (size) => {
    if (size <= 0) return []; // Handle invalid size
    return Array(size).fill(null).map(() => Array(size).fill(0));
};

const generateRandomMatrix = (size) => {
    const matrix = createMatrix(size);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            matrix[i][j] = Math.floor(Math.random() * 10);
        }
    }
    return matrix;
};

const getSubmatrixCells = (startRow, startCol, subSize) => {
    const cells = [];
    for (let i = 0; i < subSize; i++) {
        for (let j = 0; j < subSize; j++) {
            cells.push([startRow + i, startCol + j]);
        }
    }
    return cells;
};

const partitionMatrix = (matrix, size) => {
    if (size < 2) return [matrix, null, null, null]; // Cannot partition if less than 2x2
    const n = size / 2;
    const m11 = createMatrix(n), m12 = createMatrix(n), m21 = createMatrix(n), m22 = createMatrix(n);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            m11[i][j] = matrix[i][j];
            m12[i][j] = matrix[i][j + n];
            m21[i][j] = matrix[i + n][j];
            m22[i][j] = matrix[i + n][j + n];
        }
    }
    return [m11, m12, m21, m22];
};

const addMatrices = (A, B, size) => {
    if (!A || !B || A.length !== size || B.length !== size) return createMatrix(size); // Basic safety
    const C = createMatrix(size);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            C[i][j] = (A[i]?.[j] || 0) + (B[i]?.[j] || 0);
        }
    }
    return C;
};

const subtractMatrices = (A, B, size) => {
    if (!A || !B || A.length !== size || B.length !== size) return createMatrix(size);
    const C = createMatrix(size);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            C[i][j] = (A[i]?.[j] || 0) - (B[i]?.[j] || 0);
        }
    }
    return C;
};

const combineSubMatrices = (c11, c12, c21, c22, size) => {
    if (size < 2) return c11; // If original size was 1x1, c11 is the result
    const C = createMatrix(size);
    const n = size / 2;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            C[i][j] = c11[i]?.[j] || 0;
            C[i][j + n] = c12[i]?.[j] || 0;
            C[i + n][j] = c21[i]?.[j] || 0;
            C[i + n][j + n] = c22[i]?.[j] || 0;
        }
    }
    return C;
};

const standardMatrixMultiply = (A, B, size) => {
    if (size === 0) return [];
    if (!A || !B || A.length === 0 || B.length === 0) return createMatrix(size);
    const C = createMatrix(size);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            for (let k = 0; k < size; k++) {
                C[i][j] += (A[i]?.[k] || 0) * (B[k]?.[j] || 0);
            }
        }
    }
    return C;
};


const StrassenMatrixMultiplication = () => {
    const [matrixSize, setMatrixSize] = useState(2);
    const [matrixA, setMatrixA] = useState(() => generateRandomMatrix(2));
    const [matrixB, setMatrixB] = useState(() => generateRandomMatrix(2));
    const [matrixC, setMatrixC] = useState(() => createMatrix(2));

    const [pTermsDisplay, setPTermsDisplay] = useState(Array(7).fill(null));
    const [cSubMatricesDisplay, setCSubMatricesDisplay] = useState({ c11: null, c12: null, c21: null, c22: null });
    const [intermediateMatricesDisplay, setIntermediateMatricesDisplay] = useState({});
    
    const [currentHighlights, setCurrentHighlights] = useState({}); // { matrixA: {"0,0": STYLE_TYPE.OPERAND_HIGHLIGHT}, S1_display: {"all": STYLE_TYPE.INTERMEDIATE_HIGHLIGHT} }
    const [stepDescription, setStepDescription] = useState("Initialize matrices or generate random.");

    const [visualizationSteps, setVisualizationSteps] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(700);
    const [visualizationMode, setVisualizationMode] = useState('simple');

    const getNextPowerOfTwo = (n) => {
        if (n <= 0) return 1; // Smallest valid matrix size
        if ((n & (n - 1)) === 0) return n;
        let power = 1;
        while (power < n) power *= 2;
        return power;
    };
    
    const handleSizeChange = (e) => {
        if (isAnimating) return;
        let newSize = parseInt(e.target.value);
        if (isNaN(newSize)) newSize = matrixSize; // keep current if invalid input
        if (newSize < 1) newSize = 1;
        
        let adjustedSize = getNextPowerOfTwo(newSize);
        if (adjustedSize > 16) adjustedSize = 16; 
        
        setMatrixSize(adjustedSize);
        // useEffect will handle resetting matrices
    };

    const resetDisplayMatrices = (size) => {
        setMatrixA(generateRandomMatrix(size));
        setMatrixB(generateRandomMatrix(size));
        setMatrixC(createMatrix(size));

        const subSize = size >= 2 ? size / 2 : 0;
        if (subSize > 0) {
            setPTermsDisplay(Array(7).fill(null).map(() => createMatrix(subSize)));
            setCSubMatricesDisplay({
                c11: createMatrix(subSize), c12: createMatrix(subSize),
                c21: createMatrix(subSize), c22: createMatrix(subSize)
            });
            setIntermediateMatricesDisplay(Array(10).fill(null).reduce((acc, _, i) => {
                acc[`S${i + 1}`] = createMatrix(subSize);
                return acc;
            }, {}));
        } else { // For 1x1 matrix, these are not really applicable in scratchpad
            setPTermsDisplay(Array(7).fill(null));
            setCSubMatricesDisplay({ c11: null, c12: null, c21: null, c22: null });
            setIntermediateMatricesDisplay({});
        }
        setCurrentHighlights({});
        setVisualizationSteps([]);
        setCurrentStepIndex(-1);
        setStepDescription("Matrices reset. Adjust size or generate random values.");
    };
    
    useEffect(() => {
        resetDisplayMatrices(matrixSize);
    }, [matrixSize]); // React to changes in matrixSize

    const addHighlight = (targetMatrixId, cells, style) => {
        const cellHighlights = {};
        if (cells === "all") {
            cellHighlights.allCellsStyle = style;
        } else {
            cells.forEach(([r, c]) => {
                cellHighlights[`${r},${c}`] = style;
            });
        }
        return { [targetMatrixId]: cellHighlights };
    };

    const generateStrassenStepsRecursive = async (matA, matB, currentN, recursionDepth = 0, baseMatrixIdA = 'matrixA', baseMatrixIdB = 'matrixB') => {
        let steps = [];
        const addStep = (description, highlights = {}, updatedMatrices = {}) => {
            steps.push({ description, highlights, ...updatedMatrices, recursionDepth });
        };

        if (currentN <= 1) {
            const c = createMatrix(currentN);
            if (currentN === 1) c[0][0] = (matA[0]?.[0] || 0) * (matB[0]?.[0] || 0);
            
            let baseHighlights = {};
            if (currentN === 1) {
                 baseHighlights = {
                    ...addHighlight(baseMatrixIdA, [[0,0]], STYLE_TYPE.OPERAND_HIGHLIGHT),
                    ...addHighlight(baseMatrixIdB, [[0,0]], STYLE_TYPE.OPERAND_HIGHLIGHT),
                 };
            }
            addStep(`Base Case (${currentN}x${currentN}): Result = ${c[0]?.[0] || 0}`, baseHighlights, { resultMatrix: c });
            return { result: c, steps };
        }

        const nBy2 = currentN / 2;
        const [a11, a12, a21, a22] = partitionMatrix(matA, currentN);
        const [b11, b12, b21, b22] = partitionMatrix(matB, currentN);

        let partHighlights = {
            ...addHighlight(baseMatrixIdA, getSubmatrixCells(0, 0, nBy2), STYLE_TYPE.SUB_A_HIGHLIGHT), // A11
            ...addHighlight(baseMatrixIdA, getSubmatrixCells(0, nBy2, nBy2), STYLE_TYPE.SUB_A_HIGHLIGHT), // A12
            ...addHighlight(baseMatrixIdA, getSubmatrixCells(nBy2, 0, nBy2), STYLE_TYPE.SUB_A_HIGHLIGHT), // A21
            ...addHighlight(baseMatrixIdA, getSubmatrixCells(nBy2, nBy2, nBy2), STYLE_TYPE.SUB_A_HIGHLIGHT), // A22
            ...addHighlight(baseMatrixIdB, getSubmatrixCells(0, 0, nBy2), STYLE_TYPE.SUB_B_HIGHLIGHT), // B11
             // ... and so on for B submatrices
        };
        addStep(`Partitioned A & B (Depth ${recursionDepth})`, partHighlights, { 
            A11_display: a11, A12_display: a12, A21_display: a21, A22_display: a22,
            B11_display: b11, B12_display: b12, B21_display: b21, B22_display: b22,
        });
        
        // S Terms
        const s1  = subtractMatrices(a12, a22, nBy2); addStep("S1 = A12 - A22", {...addHighlight('A12_display', "all", STYLE_TYPE.OPERAND_HIGHLIGHT), ...addHighlight('A22_display', "all", STYLE_TYPE.OPERAND_HIGHLIGHT)}, { S1_display: s1 });
        const s2  = addMatrices(a11, a22, nBy2);    addStep("S2 = A11 + A22", {...addHighlight('A11_display', "all", STYLE_TYPE.OPERAND_HIGHLIGHT), ...addHighlight('A22_display', "all", STYLE_TYPE.OPERAND_HIGHLIGHT)}, { S2_display: s2 });
        const s3  = addMatrices(a21, a22, nBy2);    addStep("S3 = A21 + A22", {}, { S3_display: s3 });
        const s4  = subtractMatrices(a21, a11, nBy2); addStep("S4 = A21 - A11", {}, { S4_display: s4 });
        const s5  = addMatrices(a11, a12, nBy2);    addStep("S5 = A11 + A12", {}, { S5_display: s5 });
        const s6  = subtractMatrices(b12, b22, nBy2); addStep("S6 = B12 - B22", {}, { S6_display: s6 }); // Original: b21-b22 or b12-b22? Standard is b12-b22 for P3.
        const s7  = addMatrices(b11, b22, nBy2);    addStep("S7 = B11 + B22", {}, { S7_display: s7 });
        const s8  = addMatrices(b12, b22, nBy2);    addStep("S8 = B12 + B22", {}, { S8_display: s8 });
        const s9  = subtractMatrices(b11, b21, nBy2); addStep("S9 = B11 - B21", {}, { S9_display: s9 });
        const s10 = addMatrices(b11, b12, nBy2);   addStep("S10 = B11 + B12", {}, { S10_display: s10 });

        let p = Array(7);
        let subStepsRec;

        const pTermOps = [
            {name: "P1", m1: s2, m2: s7, m1_id: 'S2_display', m2_id: 'S7_display'},
            {name: "P2", m1: s3, m2: b11, m1_id: 'S3_display', m2_id: 'B11_display'},
            {name: "P3", m1: a11, m2: s6, m1_id: 'A11_display', m2_id: 'S6_display'}, // s6=b12-b22
            {name: "P4", m1: a22, m2: s9, m1_id: 'A22_display', m2_id: 'S9_display'}, // s9=b11-b21
            {name: "P5", m1: s5, m2: b22, m1_id: 'S5_display', m2_id: 'B22_display'},
            {name: "P6", m1: s4, m2: s8, m1_id: 'S4_display', m2_id: 'S8_display'}, // s4=a21-a11, s8=b12+b22
            {name: "P7", m1: s1, m2: s10, m1_id: 'S1_display', m2_id: 'S10_display'} // s1=a12-a22, s10=b11+b12
        ];
        
        for(let i=0; i<7; i++) {
            const op = pTermOps[i];
            addStep(`Calculating ${op.name}`, {...addHighlight(op.m1_id, "all", STYLE_TYPE.OPERAND_HIGHLIGHT), ...addHighlight(op.m2_id, "all", STYLE_TYPE.OPERAND_HIGHLIGHT)});
            if (visualizationMode === 'deep' && nBy2 > 1) { // Recursive call
                ({ result: p[i], steps: subStepsRec } = await generateStrassenStepsRecursive(op.m1, op.m2, nBy2, recursionDepth + 1, op.m1_id, op.m2_id));
                steps = steps.concat(subStepsRec.map(s => ({ ...s, parentTerm: op.name })));
            } else { // Simple mode or base case for P-term
                p[i] = standardMatrixMultiply(op.m1, op.m2, nBy2);
            }
            addStep(`${op.name} calculated`, {...addHighlight(`${op.name}_display`, "all", STYLE_TYPE.PRODUCT_TERM_HIGHLIGHT)}, { [`${op.name}_display`]: p[i] });
        }
        addStep("All P terms calculated.", {});

        // C sub-matrices
        const c11 = addMatrices(subtractMatrices(addMatrices(p[0], p[3], nBy2), p[4], nBy2), p[6], nBy2); addStep("C11 = P1+P4-P5+P7", {...addHighlight('C11_display',"all",STYLE_TYPE.SUB_C_HIGHLIGHT)}, {C11_display: c11});
        const c12 = addMatrices(p[2], p[4], nBy2); addStep("C12 = P3+P5", {...addHighlight('C12_display',"all",STYLE_TYPE.SUB_C_HIGHLIGHT)}, {C12_display: c12});
        const c21 = addMatrices(p[1], p[3], nBy2); addStep("C21 = P2+P4", {...addHighlight('C21_display',"all",STYLE_TYPE.SUB_C_HIGHLIGHT)}, {C21_display: c21});
        const c22 = addMatrices(subtractMatrices(addMatrices(p[0], p[2], nBy2), p[1], nBy2), p[5], nBy2); addStep("C22 = P1+P3-P2+P6", {...addHighlight('C22_display',"all",STYLE_TYPE.SUB_C_HIGHLIGHT)}, {C22_display: c22});
        
        addStep("C sub-matrices calculated.", {});

        const finalC = combineSubMatrices(c11, c12, c21, c22, currentN);
        let finalCHighlights = {};
        for(let r=0; r<currentN; r++) for(let c=0; c<currentN; c++) finalCHighlights[`${r},${c}`] = STYLE_TYPE.FINAL_CELL_HIGHLIGHT;
        addStep("Final Result C combined.", { matrixC: finalCHighlights }, { finalCResult: finalC });
        
        return { result: finalC, steps };
    };

    const executeStep = (stepIndex) => {
        if (stepIndex < 0 || stepIndex >= visualizationSteps.length) {
            setIsAnimating(false);
            setStepDescription(visualizationSteps.length > 0 ? "Visualization complete." : "No steps generated.");
            return;
        }
        const step = visualizationSteps[stepIndex];
        setStepDescription(`${step.recursionDepth > 0 ? `(Depth ${step.recursionDepth}${step.parentTerm ? `, ${step.parentTerm}`:''}) ` : ''}${step.description}`);
        setCurrentHighlights(step.highlights || {});

        const matrixUpdates = { ...step };
        delete matrixUpdates.description;
        delete matrixUpdates.highlights;
        delete matrixUpdates.recursionDepth;
        delete matrixUpdates.parentTerm;
        
        for (const key in matrixUpdates) {
            if (key.endsWith('_display')) { // For scratchpad items
                const displayKey = key.substring(0, key.length - '_display'.length);
                if (displayKey.startsWith('S')) {
                    setIntermediateMatricesDisplay(prev => ({...prev, [displayKey]: matrixUpdates[key]}));
                } else if (displayKey.startsWith('P')) {
                    setPTermsDisplay(prev => {
                        const newPTerms = [...prev];
                        const pIndex = parseInt(displayKey.substring(1)) - 1;
                        if (pIndex >= 0 && pIndex < 7) newPTerms[pIndex] = matrixUpdates[key];
                        return newPTerms;
                    });
                } else if (displayKey.startsWith('C') && displayKey.length === 3) { // C11, C12 etc.
                     setCSubMatricesDisplay(prev => ({...prev, [displayKey.toLowerCase()]: matrixUpdates[key]}));
                } else if (displayKey.startsWith('A') && displayKey.length === 3) { // A11 etc.
                     setIntermediateMatricesDisplay(prev => ({...prev, [displayKey]: matrixUpdates[key]}));
                } else if (displayKey.startsWith('B') && displayKey.length === 3) { // B11 etc.
                     setIntermediateMatricesDisplay(prev => ({...prev, [displayKey]: matrixUpdates[key]}));
                }

            } else if (key === 'finalCResult') {
                setMatrixC(matrixUpdates[key]);
            } else if (key === 'resultMatrix' && step.recursionDepth > 0 && visualizationMode === 'deep') {
                // If deep mode, this result is for a P-term. Update that P-term in display.
                // This logic needs to be robust if parentTerm is P1, P2 etc.
                if(step.parentTerm) {
                    const pIndex = parseInt(step.parentTerm.substring(1)) - 1;
                    if (pIndex >= 0 && pIndex < 7) {
                        setPTermsDisplay(prev => {
                            const newPTerms = [...prev];
                            newPTerms[pIndex] = matrixUpdates[key];
                            return newPTerms;
                        });
                    }
                }
            }
        }
        setCurrentStepIndex(stepIndex);
    };

    const handleStart = async (mode) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setVisualizationMode(mode);
        setCurrentStepIndex(-1);
        setCurrentHighlights({});
        setStepDescription(`Generating steps for Strassen (${mode} mode)...`);
        // Reset scratchpad for new run, but keep A & B
        const subSize = matrixSize >= 2 ? matrixSize / 2 : 0;
         if (subSize > 0) {
            setPTermsDisplay(Array(7).fill(null).map(() => createMatrix(subSize)));
            setCSubMatricesDisplay({
                c11: createMatrix(subSize), c12: createMatrix(subSize),
                c21: createMatrix(subSize), c22: createMatrix(subSize)
            });
            setIntermediateMatricesDisplay(Array(10).fill(null).reduce((acc, _, i) => {
                acc[`S${i + 1}`] = createMatrix(subSize); return acc;
            }, {}));
        } else {
            setPTermsDisplay(Array(7).fill(null));
            setCSubMatricesDisplay({ c11: null, c12: null, c21: null, c22: null });
            setIntermediateMatricesDisplay({});
        }
        setMatrixC(createMatrix(matrixSize)); // Clear previous result C

        // Ensure matrixA and matrixB are padded if not power of 2 (already handled by adjustedSize for now)
        const { steps } = await generateStrassenStepsRecursive(matrixA, matrixB, matrixSize, 0, 'matrixA', 'matrixB');
        setVisualizationSteps(steps);
        
        if (steps.length > 0) {
            setStepDescription("Starting visualization...");
            executeStep(0); // Start with the first step
        } else {
            setIsAnimating(false);
            setStepDescription("No steps to visualize (e.g., for 0x0 matrix).");
        }
    };

    const handleNextStep = () => {
        if (currentStepIndex < visualizationSteps.length - 1) {
            executeStep(currentStepIndex + 1);
        } else if (visualizationSteps.length > 0) {
            setStepDescription("Visualization complete. No more steps.");
            setIsAnimating(false);
        }
    };
    
    useEffect(() => { // Auto-play effect
        let timer;
        if (isAnimating && currentStepIndex !== -1 && currentStepIndex < visualizationSteps.length - 1 && visualizationMode !== 'manual-next') {
            timer = setTimeout(() => {
                handleNextStep();
            }, animationSpeed);
        } else if (currentStepIndex === visualizationSteps.length -1 && visualizationSteps.length > 0){
             setIsAnimating(false);
        }
        return () => clearTimeout(timer);
    }, [currentStepIndex, isAnimating, animationSpeed, visualizationSteps]); // Removed handleNextStep from deps


    const MatrixDisplay = ({ matrix, title, matrixId, highlightData, baseStyle = STYLE_TYPE.DEFAULT }) => {
        if (!matrix || matrix.length === 0 || (matrix.length > 0 && !matrix[0])) {
            return (<div className="matrix-container"><p className="matrix-title">{title}: N/A</p></div>);
        }
        const n = matrix.length;
        const getCellFinalStyle = (r, c) => {
            let styleClass = baseStyle; // Default background based on matrix type
            if (highlightData && highlightData[matrixId]) {
                const specificHighlight = highlightData[matrixId][`${r},${c}`];
                if (specificHighlight) {
                    styleClass = specificHighlight; // Override with specific cell highlight
                } else if (highlightData[matrixId].allCellsStyle) {
                    styleClass = highlightData[matrixId].allCellsStyle; // Fallback to allCellsStyle for this matrix
                }
            }
            return styleClass;
        };

        return (
            <div className={`matrix-container ${baseStyle}-container`}>
                <p className="matrix-title">{title} ({n}x{n})</p>
                <div className="matrix-grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(25px, auto))` }}>
                    {matrix.map((row, rIndex) =>
                        row.map((cell, cIndex) => (
                            <div key={`${matrixId}-${rIndex}-${cIndex}`} 
                                 className={`matrix-cell ${getCellFinalStyle(rIndex, cIndex)}`}>
                                {cell}
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="strassen-container">
            <h1>Strassen Matrix Multiplication</h1>
            <div className="controls-area">
                <div>
                    <label>Matrix Size (N): </label>
                    <input type="number" value={matrixSize} onChange={handleSizeChange} min="1" max="16" disabled={isAnimating} />
                    <span>(Adjusted to {matrixSize}, power of 2)</span>
                    <button onClick={() => resetDisplayMatrices(matrixSize)} disabled={isAnimating}>Generate Random Matrices</button>
                </div>
                <div>
                    <label>Speed: </label>
                    <input type="range" min="100" max="2000" step="50" value={animationSpeed} onChange={(e) => setAnimationSpeed(parseInt(e.target.value))} disabled={isAnimating}/>
                    <span>{animationSpeed}ms</span>
                </div>
                <div>
                    <button onClick={() => handleStart('simple')} disabled={isAnimating}>Run (Simple Recursion)</button>
                    <button onClick={() => handleStart('deep')} disabled={isAnimating}>Run (Deep Recursion - Conceptual)</button>
                    <button onClick={handleNextStep} disabled={isAnimating || currentStepIndex < 0 || currentStepIndex >= visualizationSteps.length -1 }>Next Step</button>
                    <button onClick={() => {setIsAnimating(false); resetDisplayMatrices(matrixSize);}} >Reset All</button>
                </div>
            </div>

            <div className="step-description-area">
                <p>Current Step ({currentStepIndex + 1} / {visualizationSteps.length}): {stepDescription}</p>
            </div>

            <div className="main-matrices-area">
                <MatrixDisplay matrix={matrixA} title="Matrix A" matrixId="matrixA" highlightData={currentHighlights} baseStyle={STYLE_TYPE.MATRIX_A}/>
                <MatrixDisplay matrix={matrixB} title="Matrix B" matrixId="matrixB" highlightData={currentHighlights} baseStyle={STYLE_TYPE.MATRIX_B}/>
                <MatrixDisplay matrix={matrixC} title="Result C" matrixId="matrixC" highlightData={currentHighlights} baseStyle={STYLE_TYPE.RESULT_C}/>
            </div>

            <div className="scratchpad-area">
                <h2>Scratchpad / Intermediate Steps</h2>
                <div className="intermediate-section">
                    <h3>S Terms (Intermediate Sums/Differences)</h3>
                    <div className="intermediate-grid">
                        {Object.entries(intermediateMatricesDisplay).filter(([key]) => key.startsWith("S")).map(([key, mat]) => 
                            <MatrixDisplay key={key} matrix={mat} title={key} matrixId={`${key}_display`} highlightData={currentHighlights} baseStyle={STYLE_TYPE.INTERMEDIATE_HIGHLIGHT}/>
                        )}
                        {/* Display Aij/Bij when they are being formed for S terms or P terms */}
                        {intermediateMatricesDisplay.A11_display && <MatrixDisplay matrix={intermediateMatricesDisplay.A11_display} title="A11" matrixId="A11_display" highlightData={currentHighlights} baseStyle={STYLE_TYPE.SUB_A_HIGHLIGHT}/>}
                        {intermediateMatricesDisplay.A12_display && <MatrixDisplay matrix={intermediateMatricesDisplay.A12_display} title="A12" matrixId="A12_display" highlightData={currentHighlights} baseStyle={STYLE_TYPE.SUB_A_HIGHLIGHT}/>}
                        {intermediateMatricesDisplay.A21_display && <MatrixDisplay matrix={intermediateMatricesDisplay.A21_display} title="A21" matrixId="A21_display" highlightData={currentHighlights} baseStyle={STYLE_TYPE.SUB_A_HIGHLIGHT}/>}
                        {intermediateMatricesDisplay.A22_display && <MatrixDisplay matrix={intermediateMatricesDisplay.A22_display} title="A22" matrixId="A22_display" highlightData={currentHighlights} baseStyle={STYLE_TYPE.SUB_A_HIGHLIGHT}/>}
                        {/* ... B submatrices similarly ... */}
                    </div>
                </div>
                 <div className="intermediate-section">
                    <h3>P Terms (Products)</h3>
                    <div className="intermediate-grid p-terms-grid">
                        {pTermsDisplay.map((mat, i) => 
                            <MatrixDisplay key={`P${i+1}`} matrix={mat} title={`P${i+1}`} matrixId={`P${i+1}_display`} highlightData={currentHighlights} baseStyle={STYLE_TYPE.PRODUCT_TERM_HIGHLIGHT}/>
                        )}
                    </div>
                </div>
                 <div className="intermediate-section">
                    <h3>C Sub-matrices</h3>
                    <div className="intermediate-grid c-sub-grid">
                        {Object.entries(cSubMatricesDisplay).map(([key, mat]) =>
                             <MatrixDisplay key={key} matrix={mat} title={key.toUpperCase()} matrixId={`${key.toUpperCase()}_display`} highlightData={currentHighlights} baseStyle={STYLE_TYPE.SUB_C_HIGHLIGHT}/>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StrassenMatrixMultiplication;