// SortingVisualizer.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import './SortingVisualizer.css';

// Constants for bar states/colors (to be themed)
const BAR_COLORS = {
    DEFAULT: '#87CEEB', // Sky blue (example from RateInMaze path)
    COMPARING: '#FFC107', // Yellow (example from RateInMaze cheese)
    SWAPPING: '#F48FB1', // Pinkish (example from RateInMaze visited)
    PIVOT: '#FF7043', // Orangey
    SORTED: '#66BB6A', // Green
    CUSTOM_INPUT_BG: '#E8DA5F', // From original main.js for initial bars
};

const ALGORITHM_DETAILS = {
    BubbleSort: { name: "Bubble Sort", complexities: { best: "Ω(N)", average: "Θ(N^2)", worst: "O(N^2)", space: "O(1)" } },
    SelectionSort: { name: "Selection Sort", complexities: { best: "Ω(N^2)", average: "Θ(N^2)", worst: "O(N^2)", space: "O(1)" } },
    InsertionSort: { name: "Insertion Sort", complexities: { best: "Ω(N)", average: "Θ(N^2)", worst: "O(N^2)", space: "O(1)" } },
    MergeSort: { name: "Merge Sort", complexities: { best: "Ω(N log N)", average: "Θ(N log N)", worst: "O(N log N)", space: "O(N)" } },
    QuickSort: { name: "Quick Sort", complexities: { best: "Ω(N log N)", average: "Θ(N log N)", worst: "O(N^2)", space: "O(log N)" } },
    HeapSort: { name: "Heap Sort", complexities: { best: "Ω(N log N)", average: "Θ(N log N)", worst: "O(N log N)", space: "O(1)" } },
    CountingSort: { name: "Counting Sort", complexities: { best: "Ω(N+K)", average: "Θ(N+K)", worst: "O(N+K)", space: "O(N+K)" } },
    RadixSort: { name: "Radix Sort", complexities: { best: "Ω(NK)", average: "Θ(NK)", worst: "O(NK)", space: "O(N+K)" } },
    BucketSort: { name: "Bucket Sort", complexities: { best: "Ω(N+K)", average: "Θ(N+K)", worst: "O(N^2)", space: "O(N+K)" } },
};


const QuickSort = () => {
    const [array, setArray] = useState([]);
    const [initialArrayState, setInitialArrayState] = useState([]); // For the "Refresh" button
    const [arraySize, setArraySize] = useState(80);
    const [animationSpeedValue, setAnimationSpeedValue] = useState(3); // 0-5 range from slider
    const [delayTime, setDelayTime] = useState(100); // Calculated delay in ms
    const [customArrayInput, setCustomArrayInput] = useState("");
    const [isSorting, setIsSorting] = useState(false);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState("BubbleSort");
    const [complexities, setComplexities] = useState(ALGORITHM_DETAILS.BubbleSort.complexities);
    const [message, setMessage] = useState("");

    // States for visualization
    const [comparingIndices, setComparingIndices] = useState([]);
    const [swappingIndices, setSwappingIndices] = useState([]);
    const [sortedIndices, setSortedIndices] = useState([]);
    const [pivotIndex, setPivotIndex] = useState(-1);
    const [specialIndices, setSpecialIndices] = useState({}); // For algorithms like Counting/Radix/Bucket temporary arrays

    const arrayContainerRef = useRef(null); // To get width for bar calculation if needed

    const generateRandomArray = useCallback(() => {
        if (isSorting) return;
        const newArray = [];
        const minVal = 10;
        // Max value should be such that heights are reasonable.
        // Original used: Math.floor(Math.random() * 0.5 * (inp_as.max - inp_as.min)) + 10;
        // inp_as.max was 200, inp_as.min was 10. So, 0.5 * 190 = 95. Max value around 105.
        const maxVal = 100;
        for (let i = 0; i < arraySize; i++) {
            newArray.push(Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);
        }
        setArray([...newArray]);
        setInitialArrayState([...newArray]);
        resetVisualState();
        setMessage("New random array generated.");
    }, [arraySize, isSorting]);

    const generateCustomArray = () => {
        if (isSorting) return;
        const values = customArrayInput.split(",").map(s => s.trim()).filter(s => s !== "").map(Number);
        if (values.some(isNaN) || values.some(v => v <= 0)) {
            setMessage("Error: Please enter positive numbers separated by commas.");
            return;
        }
        if (values.length === 0) {
            setMessage("Error: Custom input is empty.");
            return;
        }
        setArraySize(values.length); // Update slider if possible, or just use this size
        setArray([...values]);
        setInitialArrayState([...values]);
        resetVisualState();
        setMessage("Array generated from custom input.");
    };

    const resetVisualState = () => {
        setComparingIndices([]);
        setSwappingIndices([]);
        setSortedIndices([]);
        setPivotIndex(-1);
        setSpecialIndices({});
    };

    useEffect(() => {
        generateRandomArray();
    }, []); // Generate an initial array on mount

    useEffect(() => { // Regenerate if size changes via slider
        generateRandomArray();
    }, [arraySize]);


    useEffect(() => {
        // Map slider value (0-5) to delay time
        // Original: case 0: speed=1; case 1: speed=10; case 2: speed=100; case 3: speed=1000; case 4: speed=10000;
        // delay_time=10000/(Math.floor(array_size/10)*speed);
        // Simpler mapping:
        const speeds = [2000, 1000, 500, 200, 50, 10]; // ms delay, index 0 is slowest
        setDelayTime(speeds[animationSpeedValue] || 200);
    }, [animationSpeedValue]);


    const handleAlgorithmChange = (algoKey) => {
        if (isSorting) return;
        setSelectedAlgorithm(algoKey);
        setComplexities(ALGORITHM_DETAILS[algoKey].complexities);
        setMessage(`${ALGORITHM_DETAILS[algoKey].name} selected.`);
    };

    const handleRefresh = () => {
        if (isSorting) return;
        setArray([...initialArrayState]);
        resetVisualState();
        setMessage("Array reset to its initial unsorted state.");
    };

    // Visualization helper
    const visualizeStep = async (
        newArray = null,
        { comp = [], swap = [], pivot = -1, sorted = [], special = {} } = {}
    ) => {
        if (newArray) setArray([...newArray]);
        setComparingIndices([...comp]);
        setSwappingIndices([...swap]);
        setPivotIndex(pivot);
        setSortedIndices(prev => [...new Set([...prev, ...sorted])]); // Append to sorted
        setSpecialIndices(prev => ({...prev, ...special}));

        await new Promise(resolve => setTimeout(resolve, delayTime));
    };
    
    const markAllSorted = async (currentArray) => {
        const allIndices = currentArray.map((_, i) => i);
        for (let i = 0; i < allIndices.length; i+=5) { // Color in chunks for large arrays
            const chunk = allIndices.slice(i, i + 5);
            setSortedIndices(prev => [...new Set([...prev, ...chunk])]);
            await new Promise(resolve => setTimeout(resolve, delayTime > 50 ? 50 : delayTime/2 ));
        }
        setComparingIndices([]);
        setSwappingIndices([]);
        setPivotIndex(-1);
         await new Promise(resolve => setTimeout(resolve, delayTime * 2));
    }


    // --- Sorting Algorithms ---
    // Each algorithm needs to be an async function
    // and use visualizeStep for any state change + delay

    const bubbleSort = async () => {
        let arr = [...array];
        let n = arr.length;
        let newSortedIndices = [];
        for (let i = 0; i < n - 1; i++) {
            let swappedInPass = false;
            for (let j = 0; j < n - i - 1; j++) {
                await visualizeStep(arr, { comp: [j, j + 1] });
                if (arr[j] > arr[j + 1]) {
                    await visualizeStep(arr, { comp: [j, j+1], swap: [j, j + 1] });
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    await visualizeStep(arr, { comp: [j, j+1], swap: [j, j + 1] });
                    swappedInPass = true;
                }
                await visualizeStep(arr, { comp: [] }); // Clear comparison
            }
            newSortedIndices.push(n - 1 - i);
            await visualizeStep(arr, { sorted: [n - 1 - i], comp:[] });
            if (!swappedInPass && i < n - 2) { // Optimization: if no swaps in a pass, array is sorted
                 const remainingUnsorted = arr.map((_,idx)=>idx).filter(idx => !newSortedIndices.includes(idx));
                 newSortedIndices.push(...remainingUnsorted);
                 break;
            }
        }
        newSortedIndices.push(0); // First element is also sorted
        await visualizeStep(arr, { sorted: newSortedIndices });
        return arr;
    };

    const selectionSort = async () => {
        let arr = [...array];
        let n = arr.length;
        let currentSorted = [];
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            await visualizeStep(arr, { pivot: i, sorted: [...currentSorted] }); // i is current boundary / potential min
            for (let j = i + 1; j < n; j++) {
                await visualizeStep(arr, { comp: [minIdx, j], pivot: i, sorted: [...currentSorted] });
                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                    await visualizeStep(arr, { comp: [], pivot: i, special: {[minIdx]: 'MIN_FOUND'}, sorted: [...currentSorted] });
                }
                 await visualizeStep(arr, { comp: [], pivot: i, special: {[minIdx]: 'MIN_FOUND'}, sorted: [...currentSorted] }); // clear comp
            }
            if (minIdx !== i) {
                await visualizeStep(arr, { swap: [i, minIdx], pivot: i, special: {}, sorted: [...currentSorted] });
                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
                await visualizeStep(arr, { swap: [i, minIdx], sorted: [...currentSorted] });
            }
            currentSorted.push(i);
            await visualizeStep(arr, { sorted: [...currentSorted], special: {} });
        }
        currentSorted.push(n - 1);
        await visualizeStep(arr, { sorted: [...currentSorted] });
        return arr;
    };

    const insertionSort = async () => {
        let arr = [...array];
        let n = arr.length;
        let currentSorted = [0];
        await visualizeStep(arr, { sorted: [0] });

        for (let i = 1; i < n; i++) {
            let key = arr[i];
            let j = i - 1;
            await visualizeStep(arr, { pivot: i, comp: [j, i], sorted: [...currentSorted] }); // key is at arr[i]

            while (j >= 0 && arr[j] > key) {
                await visualizeStep(arr, { comp: [j, j+1], swap: [j, j + 1], pivot: i, sorted: [...currentSorted.filter(idx => idx < i)] });
                arr[j + 1] = arr[j];
                await visualizeStep(arr, { comp: [j, j+1], swap: [j, j + 1], pivot: i, sorted: [...currentSorted.filter(idx => idx < i)] });
                j = j - 1;
                if (j >= 0) await visualizeStep(arr, { comp: [j, i], pivot: i, sorted: [...currentSorted.filter(idx => idx < i)] });
            }
            arr[j + 1] = key;
            currentSorted = Array.from({length: i + 1}, (_, k) => k);
            await visualizeStep(arr, { sorted: [...currentSorted], pivot: -1 });
        }
        await visualizeStep(arr, { sorted: arr.map((_,idx)=>idx) });
        return arr;
    };
    
    const mergeSort = async () => {
        let arr = [...array];
        await mergeSortRecursive(arr, 0, arr.length - 1);
        await visualizeStep(arr, {sorted: arr.map((_,i)=>i)});
        return arr;
    };

    const mergeSortRecursive = async (arr, l, r) => {
        if (l >= r) {
            if(l === r) await visualizeStep(arr, { sorted: [l] }); // Mark single elements as 'sorted' in their context
            return;
        }
        const m = Math.floor(l + (r - l) / 2);
        await visualizeStep(arr, { pivot: m });
        
        await mergeSortRecursive(arr, l, m);
        await mergeSortRecursive(arr, m + 1, r);
        await merge(arr, l, m, r);
    };

    const merge = async (arr, l, m, r) => {
        let n1 = m - l + 1;
        let n2 = r - m;
        let L = new Array(n1);
        let R = new Array(n2);

        for (let i = 0; i < n1; i++) L[i] = arr[l + i];
        for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

        await visualizeStep(arr, { comp: [...Array(n1).fill(0).map((_,i)=> l+i), ...Array(n2).fill(0).map((_,i)=> m+1+i)] });

        let i = 0, j = 0, k = l;
        while (i < n1 && j < n2) {
            await visualizeStep(arr, { comp: [l+i, m+1+j], pivot: k });
            if (L[i] <= R[j]) {
                arr[k] = L[i];
                i++;
            } else {
                arr[k] = R[j];
                j++;
            }
            await visualizeStep(arr, { swap: [k], pivot:k }); // Show value placed
            k++;
        }
        while (i < n1) {
            await visualizeStep(arr, { comp: [l+i], pivot: k });
            arr[k] = L[i];
            await visualizeStep(arr, { swap: [k], pivot:k });
            i++; k++;
        }
        while (j < n2) {
             await visualizeStep(arr, { comp: [m+1+j], pivot: k });
            arr[k] = R[j];
            await visualizeStep(arr, { swap: [k], pivot:k });
            j++; k++;
        }
         // Mark merged part as provisionally sorted for this merge step
        const mergedIndices = Array.from({length: r-l+1}, (_,idx) => l+idx);
        await visualizeStep(arr, { sorted: getCurrentlySorted(arr, mergedIndices) });
    };
    
    // Helper to get which part of the array is currently sorted for merge sort visualization
    const getCurrentlySorted = (currentArr, rangeBeingMerged) => {
        // This is tricky. For merge sort, 'sorted' means sorted within its current sub-array context.
        // For simplicity, we'll just pass the range that was just merged.
        // A more complex approach would track sorted segments across the whole array.
        return sortedIndices; // Keep existing sorted ones, rely on final pass for full sort color
    };


    const quickSort = async () => {
        let arr = [...array];
        await quickSortRecursive(arr, 0, arr.length - 1);
        await visualizeStep(arr, {sorted: arr.map((_,i)=>i)});
        return arr;
    };

    const quickSortRecursive = async (arr, low, high) => {
        if (low < high) {
            let pi = await partition(arr, low, high);
            await visualizeStep(arr, { sorted: [pi] }); // Pivot is in place
            await quickSortRecursive(arr, low, pi - 1);
            await quickSortRecursive(arr, pi + 1, high);
        } else if (low === high) {
             await visualizeStep(arr, { sorted: [low] }); // Single element is sorted
        }
    };

    const partition = async (arr, low, high) => {
        let pivotValue = arr[high];
        await visualizeStep(arr, { pivot: high, comp: Array.from({length: high-low}, (_,i)=>low+i) });
        let i = low - 1; 

        for (let j = low; j < high; j++) {
            await visualizeStep(arr, { pivot: high, comp: [j, i+1] });
            if (arr[j] < pivotValue) {
                i++;
                await visualizeStep(arr, { pivot: high, comp: [j, i], swap: [i,j] });
                [arr[i], arr[j]] = [arr[j], arr[i]];
                await visualizeStep(arr, { pivot: high, comp: [j, i], swap: [i,j] });
            }
        }
        await visualizeStep(arr, { pivot: high, swap: [i+1, high] });
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        await visualizeStep(arr, { pivot: i+1, swap: [i+1, high] });
        return i + 1;
    };

    const heapSort = async () => {
        let arr = [...array];
        let n = arr.length;

        // Build heap (rearrange array)
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await heapify(arr, n, i);
        }

        let currentSorted = [];
        // One by one extract an element from heap
        for (let i = n - 1; i > 0; i--) {
            await visualizeStep(arr, { comp: [0,i], swap: [0, i], sorted: [...currentSorted] });
            [arr[0], arr[i]] = [arr[i], arr[0]]; // Move current root to end
             await visualizeStep(arr, { comp: [0,i], swap: [0, i], sorted: [...currentSorted, i] });
            currentSorted.push(i);
            await heapify(arr, i, 0); // call max heapify on the reduced heap
        }
        currentSorted.push(0);
        await visualizeStep(arr, { sorted: [...currentSorted] });
        return arr;
    };

    const heapify = async (arr, n, i) => {
        let largest = i; // Initialize largest as root
        let l = 2 * i + 1; // left = 2*i + 1
        let r = 2 * i + 2; // right = 2*i + 2

        await visualizeStep(arr, { pivot: i, comp: [l < n ? l : -1, r < n ? r : -1].filter(x => x !== -1) });

        if (l < n && arr[l] > arr[largest]) largest = l;
        if (r < n && arr[r] > arr[largest]) largest = r;

        if (largest !== i) {
            await visualizeStep(arr, { pivot: i, comp: [i, largest], swap: [i, largest] });
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            await visualizeStep(arr, { pivot: i, comp: [i, largest], swap: [i, largest] });
            await heapify(arr, n, largest);
        }
         await visualizeStep(arr, {pivot: i}); // Show current root stabilized
    };


    const countingSort = async () => {
        let arr = [...array];
        let n = arr.length;
        if (n === 0) return arr;

        let maxVal = Math.max(...arr);
        let minVal = Math.min(...arr); // For handling negative numbers or offset
        let range = maxVal - minVal + 1;
        
        let count = new Array(range).fill(0);
        let output = new Array(n).fill(0);

        // Store count of each character
        for (let i = 0; i < n; i++) {
            await visualizeStep(arr, { comp: [i], special: { type: 'COUNTING_COUNT_ARRAY_HIGHLIGHT', index: arr[i] - minVal } });
            count[arr[i] - minVal]++;
            setSpecialIndices(prev => ({...prev, countArray: [...count]})); // Show count array building
            await visualizeStep(arr, { comp: [i] });
        }

        // Change count[i] so that count[i] now contains actual position of this digit in output array
        for (let i = 1; i < range; i++) {
            count[i] += count[i - 1];
            setSpecialIndices(prev => ({...prev, countArray: [...count]}));
            await visualizeStep(arr, {special: { type: 'COUNTING_SUM_ARRAY_HIGHLIGHT', index: i}});
        }
        
        // Build the output character array
        for (let i = n - 1; i >= 0; i--) {
            await visualizeStep(arr, { comp: [i], special: { type: 'COUNTING_OUTPUT_PLACEMENT', from_index: i, to_index: count[arr[i] - minVal] - 1 } });
            output[count[arr[i] - minVal] - 1] = arr[i];
            count[arr[i] - minVal]--;
            setSpecialIndices(prev => ({...prev, countArray: [...count], outputArray: [...output] }));
            // Visualize output array building directly into arr for simplicity here
            let tempArr = [...arr]; // Create a temporary array for visualization
            tempArr[count[arr[i] - minVal]] = arr[i]; // This mapping is tricky to visualize in place directly
                                                     // Instead, we will copy output to arr at the end.
            await visualizeStep(arr, { comp: [i] });
        }

        // Copy the output array to arr, so that arr now contains sorted characters
        for (let i = 0; i < n; i++) {
            arr[i] = output[i];
            await visualizeStep(arr, { swap: [i] }); // Show element being placed
        }
        await visualizeStep(arr, { sorted: arr.map((_,idx)=>idx), special: {} });
        return arr;
    };
    
    const radixSort = async () => {
        let arr = [...array];
        let n = arr.length;
        if (n === 0) return arr;

        let maxVal = Math.max(...arr);

        for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
            await countingSortForRadix(arr, n, exp);
        }
        await visualizeStep(arr, { sorted: arr.map((_,idx)=>idx) });
        return arr;
    };

    const countingSortForRadix = async (arr, n, exp) => {
        let output = new Array(n).fill(0);
        let count = new Array(10).fill(0);
        let currentPassSpecial = { type: 'RADIX_PASS', exp };

        for (let i = 0; i < n; i++) {
            let digit = Math.floor(arr[i] / exp) % 10;
            await visualizeStep(arr, { comp: [i], special: { ...currentPassSpecial, stage: 'COUNTING_DIGITS', digit_idx: digit } });
            count[digit]++;
             setSpecialIndices(prev => ({...prev, radixCount: [...count]}));
        }

        for (let i = 1; i < 10; i++) {
            count[i] += count[i - 1];
            setSpecialIndices(prev => ({...prev, radixCount: [...count]}));
            await visualizeStep(arr, { special: { ...currentPassSpecial, stage: 'SUMMING_COUNTS', count_idx: i } });
        }

        for (let i = n - 1; i >= 0; i--) {
            let digit = Math.floor(arr[i] / exp) % 10;
            await visualizeStep(arr, { comp: [i], special: { ...currentPassSpecial, stage: 'BUILDING_OUTPUT', output_idx: count[digit] -1 } });
            output[count[digit] - 1] = arr[i];
            count[digit]--;
             setSpecialIndices(prev => ({...prev, radixCount: [...count], radixOutput: [...output] }));
        }

        for (let i = 0; i < n; i++) {
            arr[i] = output[i];
            await visualizeStep(arr, { swap: [i], special: { ...currentPassSpecial, stage: 'COPYING_OUTPUT' } });
        }
        setSpecialIndices(prev => ({...prev, radixCount: [], radixOutput: [] })); // Clear pass specific visuals
    };
    
    const bucketSort = async () => {
        let arr = [...array];
        let n = arr.length;
        if (n <= 0) return arr;

        // 1) Create n empty buckets
        let bucketCount = Math.floor(Math.sqrt(n)) || 1;
        let buckets = Array.from({ length: bucketCount }, () => []);
        let maxVal = -Infinity;
        let minVal = Infinity;
        for(let x of arr) {
            if (x > maxVal) maxVal = x;
            if (x < minVal) minVal = x;
        }
        
        let range = (maxVal - minVal) || 1; // Avoid division by zero if all elements are same

        // 2) Put array elements in different buckets
        setSpecialIndices({ type: 'BUCKET_DISTRIBUTION', buckets: buckets.map(b => [...b]) });
        for (let i = 0; i < n; i++) {
            await visualizeStep(arr, { comp: [i] });
            // Handle case where maxVal === minVal to avoid division by zero or place all in first bucket.
            let bucketIndex = (maxVal === minVal) ? 0 : Math.floor(bucketCount * (arr[i] - minVal) / range);
            // Clamp bucketIndex to be within [0, bucketCount - 1]
            bucketIndex = Math.max(0, Math.min(bucketCount - 1, bucketIndex));

            buckets[bucketIndex].push(arr[i]);
            setSpecialIndices(prev => ({...prev, buckets: buckets.map(b => [...b])})); // Show bucket filling
            await visualizeStep(arr, { comp: [i] });
        }

        // 3) Sort individual buckets (using insertion sort for simplicity on small buckets)
        arr.length = 0; // Clear original array to reconstruct from buckets
        let sortedCount = 0;

        for (let i = 0; i < bucketCount; i++) {
            setSpecialIndices(prev => ({...prev, type: 'BUCKET_SORTING', activeBucket: i, buckets: buckets.map(b=>[...b])}));
            // Simple sort for buckets (e.g., insertion sort or built-in sort)
            // For visualization, if we sort here, we'd need to visualize that too.
            // Using JS sort for speed here, visualization of this step is complex.
            buckets[i].sort((a, b) => a - b); 
            setSpecialIndices(prev => ({...prev, buckets: buckets.map(b=>[...b])}));
            await new Promise(resolve => setTimeout(resolve, delayTime * 2)); // Pause to show sorted bucket

            // 4) Concatenate all buckets into arr[]
            for (let j = 0; j < buckets[i].length; j++) {
                arr.push(buckets[i][j]);
                // Visualize the main array being rebuilt
                await visualizeStep(arr, { swap: [arr.length-1], sorted: Array.from({length: sortedCount}, (_,k)=>k) });
            }
            sortedCount = arr.length;
        }
        
        setSpecialIndices({}); // Clear bucket visuals
        await visualizeStep(arr, { sorted: arr.map((_,idx)=>idx) });
        return arr;
    };


    const runSelectedAlgorithm = async () => {
        if (isSorting) return;
        setIsSorting(true);
        setMessage(`Sorting with ${ALGORITHM_DETAILS[selectedAlgorithm].name}...`);
        resetVisualState(); // Clear previous highlights but keep the array
        setArray([...initialArrayState]); // Ensure we sort the original state for this run
        await new Promise(resolve => setTimeout(resolve, 100)); // Brief pause for UI update

        let sortedArray;
        switch (selectedAlgorithm) {
            case "BubbleSort": sortedArray = await bubbleSort(); break;
            case "SelectionSort": sortedArray = await selectionSort(); break;
            case "InsertionSort": sortedArray = await insertionSort(); break;
            case "MergeSort": sortedArray = await mergeSort(); break;
            case "QuickSort": sortedArray = await quickSort(); break;
            case "HeapSort": sortedArray = await heapSort(); break;
            case "CountingSort": sortedArray = await countingSort(); break;
            case "RadixSort": sortedArray = await radixSort(); break;
            case "BucketSort": sortedArray = await bucketSort(); break;
            default: sortedArray = [...array];
        }
        
        await markAllSorted(sortedArray); // Final green sweep
        setArray(sortedArray); // Ensure final state is set
        setIsSorting(false);
        setMessage(`${ALGORITHM_DETAILS[selectedAlgorithm].name} completed.`);
    };
    

    const getBarColor = (index) => {
        if (sortedIndices.includes(index)) return BAR_COLORS.SORTED;
        if (index === pivotIndex) return BAR_COLORS.PIVOT;
        if (swappingIndices.includes(index)) return BAR_COLORS.SWAPPING;
        if (comparingIndices.includes(index)) return BAR_COLORS.COMPARING;
        if (specialIndices[index] === 'MIN_FOUND') return BAR_COLORS.PIVOT; // Example for selection sort min
        return BAR_COLORS.DEFAULT;
    };

    // Max height for bars to keep them in container.
    // The values can range, so scale them relative to max value in array.
    const maxArrayValue = Math.max(100, ...array); // Ensure at least 100 for scaling, or actual max.

    return (
        <div className="sorting-visualizer-container">
            <div className="controls-panel">
                <div className="control-group array-inputs">
                    <p>Size:</p>
                    <input id="a_size" type="range" min="10" max="150" step="1" value={arraySize} 
                           onChange={(e) => !isSorting && setArraySize(parseInt(e.target.value))} disabled={isSorting} />
                    <span>{arraySize}</span>
                    
                    <p>Speed:</p>
                    <input id="a_speed" type="range" min="0" max="5" step="1" value={animationSpeedValue}
                           onChange={(e) => !isSorting && setAnimationSpeedValue(parseInt(e.target.value))} disabled={isSorting} />
                </div>
                 <div className="control-group array-generation">
                    <button id="a_generate" onClick={generateRandomArray} disabled={isSorting}>Random Array</button>
                    <input id="a_custom" type="text" placeholder="1,5,2,..." value={customArrayInput} 
                           onChange={(e) => setCustomArrayInput(e.target.value)} disabled={isSorting}/>
                    <button id="a_custom_generate" onClick={generateCustomArray} disabled={isSorting}>From Input</button>
                    <button id="refresh" onClick={handleRefresh} disabled={isSorting}>Reset Current Array</button>
                </div>

                <div className="control-group algos">
                    {Object.keys(ALGORITHM_DETAILS).map(algoKey => (
                        <button key={algoKey} 
                                onClick={() => handleAlgorithmChange(algoKey)}
                                className={selectedAlgorithm === algoKey ? 'butt_selected' : ''}
                                disabled={isSorting}>
                            {ALGORITHM_DETAILS[algoKey].name.replace(" Sort", "")} 
                        </button>
                    ))}
                </div>
                 <button className="run-button" onClick={runSelectedAlgorithm} disabled={isSorting}>
                    Run {ALGORITHM_DETAILS[selectedAlgorithm].name}
                </button>
            </div>

            <div id="array_container_main">
                <div id="array_container" ref={arrayContainerRef}>
                    {array.map((value, idx) => (
                        <div className="bar-wrapper" key={idx}>
                             <div className="bar-value">{value}</div>
                            <div
                                className="bar"
                                style={{
                                    height: `${(value / maxArrayValue) * 100}px`,
                                    backgroundColor: getBarColor(idx),
                                }}
                            >
                            </div>
                        </div>
                    ))}
                </div>
                 {/* Visualization for auxiliary arrays like in Counting/Radix sort */}
                {selectedAlgorithm === "CountingSort" && specialIndices.countArray && (
                    <div className="aux-array-container">
                        <p>Count Array:</p>
                        <div className="aux-array">
                        {specialIndices.countArray.map((val, i) => (
                            <div key={i} className={`aux-cell ${specialIndices.type === 'COUNTING_COUNT_ARRAY_HIGHLIGHT' && specialIndices.index === i ? 'highlight' : ''} ${specialIndices.type === 'COUNTING_SUM_ARRAY_HIGHLIGHT' && specialIndices.index === i ? 'sum-highlight' : ''}`}>
                                {val}
                            </div>
                        ))}
                        </div>
                         {specialIndices.outputArray && (
                             <>
                             <p>Output Array (during build):</p>
                             <div className="aux-array">
                             {specialIndices.outputArray.map((val, i) => (
                                <div key={i} className={`aux-cell ${specialIndices.type === 'COUNTING_OUTPUT_PLACEMENT' && specialIndices.to_index === i ? 'output-highlight' : ''}`}>
                                    {val}
                                </div>
                            ))}
                            </div>
                            </>
                        )}
                    </div>
                )}
                 {selectedAlgorithm === "RadixSort" && specialIndices.radixCount && (
                    <div className="aux-array-container">
                        <p>Radix Counts (exp: {specialIndices.exp}, digit highlighted: {specialIndices.digit_idx})</p>
                        <div className="aux-array">
                        {specialIndices.radixCount.map((val, i) => (
                            <div key={i} className={`aux-cell ${specialIndices.stage === 'COUNTING_DIGITS' && specialIndices.digit_idx === i ? 'highlight' : ''} ${specialIndices.stage === 'SUMMING_COUNTS' && specialIndices.count_idx === i ? 'sum-highlight' : ''}`}>
                                {val}
                            </div>
                        ))}
                        </div>
                         {specialIndices.radixOutput && (
                             <>
                             <p>Radix Output Array (building):</p>
                             <div className="aux-array">
                             {specialIndices.radixOutput.map((val, i) => (
                                <div key={i} className={`aux-cell ${specialIndices.stage === 'BUILDING_OUTPUT' && specialIndices.output_idx === i ? 'output-highlight' : ''}`}>
                                    {val}
                                </div>
                            ))}
                            </div>
                            </>
                        )}
                    </div>
                )}
                {selectedAlgorithm === "BucketSort" && specialIndices.buckets && (
                    <div className="buckets-container">
                        <p>Buckets ({specialIndices.type === 'BUCKET_SORTING' ? `Sorting bucket ${specialIndices.activeBucket}`: 'Distributing'})</p>
                        {specialIndices.buckets.map((bucket, bucketIdx) => (
                            <div key={bucketIdx} className={`bucket ${specialIndices.activeBucket === bucketIdx ? 'active-bucket' : ''}`}>
                                <div className="bucket-label">B{bucketIdx}</div>
                                <div className="bucket-elements">
                                    {bucket.map((val, valIdx) => (
                                        <div key={valIdx} className="bucket-element">{val}</div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            <div className="info-panel">
                <div id="Info_Cont1">
                    <h3>TIME COMPLEXITY</h3>
                    <div className="Complexity_Containers">
                        <div className="Pair_Definitions"><p className="Sub_Heading">Best case:</p><p id="Time_Best">{complexities.best}</p></div>
                        <div className="Pair_Definitions"><p className="Sub_Heading">Average case:</p><p id="Time_Average">{complexities.average}</p></div>
                        <div className="Pair_Definitions"><p className="Sub_Heading">Worst case:</p><p id="Time_Worst">{complexities.worst}</p></div>
                    </div>
                </div>
                <div id="Info_Cont2">
                    <h3>SPACE COMPLEXITY</h3>
                    <div className="Complexity_Containers">
                        <div className="Pair_Definitions"><p className="Sub_Heading">Worst case:</p><p id="Space_Worst">{complexities.space}</p></div>
                    </div>
                </div>
            </div>
            {message && <div className="message-display">{message}</div>}
        </div>
    );
};

export default QuickSort;