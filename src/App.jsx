import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from "react-router-dom"; // 1. Import useLocation
import Header from "./components/Header/Header";
import Loader from "./components/Loader/Loader";

// --- All your React.lazy imports remain the same ---
// const Hero = React.lazy(() => import("./components/hero/Hero"));
const ActivitySelection = React.lazy(() => import("./algorithms/Activity_Selection/activitySelection"));
const BellmanFord = React.lazy(() => import("./algorithms/Bellman_Ford/bellmanFord"));
const BinarySearch = React.lazy(() => import("./algorithms/Binary_Search/binarySearch"));
const BreadthFirstSearch = React.lazy(() => import("./algorithms/Breadth_First_Search/breadthFirstSearch"));
const BubbleSort = React.lazy(() => import("./algorithms/BubbleSort/bubbleSort"));
const BucketSort = React.lazy(() => import("./algorithms/BucketSort/bucketSort"));
const CountingSort = React.lazy(() => import("./algorithms/CountingSort/countingSort"));
const DepthFirstSearch = React.lazy(() => import("./algorithms/Depth_First_Search/depthFirstSearch"));
const DijkstraAlgorithm = React.lazy(() => import("./algorithms/Dijkstra's_Algorithms/dijkstrasAlgorithm"));
const FloydWarshall = React.lazy(() => import("./algorithms/Floyd_Warshall/floydWarshall"));
const HeapSort = React.lazy(() => import("./algorithms/HeapSort/heapSort"));
const HuffmanCoding = React.lazy(() => import("./algorithms/Huffman_Coding/huffmanCoding"));
const InsertionSort = React.lazy(() => import("./algorithms/InsertionSort/insertionSort"));
const KnapsackAlgorithm = React.lazy(() => import("./algorithms/Knapsack_Algorithm/knapsackAlgorithm"));
const KosarajusAlgorithm = React.lazy(() => import("./algorithms/Kosaraju's_Algorithm/kosarajusAlgorithm"));
const KruskalAlgorithms = React.lazy(() => import("./algorithms/Kruskal_Algorithms/kruskalAlgorithms"));
const LinearSearch = React.lazy(() => import("./algorithms/linear_search/linearSearch"));
const LongestCommonSubsequence = React.lazy(() => import("./algorithms/Longest_Common_Subsequence/longestCommonSubsequence"));
const MatrixChainMultiplication = React.lazy(() => import("./algorithms/Matrix_Chain_Multiplication/matrixChainMultiplication"));
const MergeSort = React.lazy(() => import("./algorithms/MergeSort/mergeSort"));
const NQueenProblem = React.lazy(() => import("./algorithms/N-Queen_Problem/nQueenProblem"));
const PrimsAlgirithms = React.lazy(() => import("./algorithms/Prim's_Algorithms/primsAlgirithms"));
const QuickSort = React.lazy(() => import("./algorithms/QuickSort/quickSort"));
const Rate_in_The_Maze = React.lazy(() => import("./algorithms/Rate_in_The_Maze/rate_in_the_maze"));
const ReduxSort = React.lazy(() => import("./algorithms/ReduxSort/reduxSort"));
const SelectionSort = React.lazy(() => import("./algorithms/SelectionSort/selectionSort"));
const SortestPath = React.lazy(() => import("./algorithms/Shortest_path/sortestPath"));
const StrassenMatrixMultiplication = React.lazy(() => import("./algorithms/Strassen_Matrix_Multiplication/strassenMatrixMultiplication"));
const SubsetSum = React.lazy(() => import("./algorithms/Subset_Sum/subsetSum"));
const SudokuSolver = React.lazy(() => import("./algorithms/Sudoku_Solver/sudokuSolver"));
const TarjansAlgorithm = React.lazy(() => import("./algorithms/Tarjan's_Algorithms/tarjansAlgorithm"));
const AvlTree = React.lazy(()=> import("./algorithms/AVL_tree/avlTree"));
const BinaryTree = React.lazy(()=>import("./algorithms/Binary_tree/binaryTree"))
const BinarySearchTree = React.lazy(()=>import("./algorithms/Binary_search_tree/binarySearchTree"))
const BalanceTree = React.lazy(()=> import("./algorithms/Balance_Tree/balanceTree"))


const Home = React.lazy(() => import("./components/home/Home")); // temp


function App() {
  
  // 2. Get the current location object
  const location = useLocation();

  // 3. Check if the current path is the home page ('/')
  const isHomePage = location.pathname === '/';

  return (
    <>
      <Suspense fallback={<Loader />}>
      
      {/* 4. Conditionally render the Header component */}
      {!isHomePage && <Header />}

      <main>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/ActivitySelection" element={<ActivitySelection/>}/>
            <Route path="/BellmanFord" element={<BellmanFord/>}/>
            <Route path="/BinarySearch" element={<BinarySearch/>}/>
            <Route path="/BreadthFirstSearch" element={<BreadthFirstSearch/>}/>
            <Route path="/BubbleSort" element={<BubbleSort/>}/>
            <Route path="/BucketSort" element={<BucketSort/>}/>
            <Route path="/CountingSort" element={<CountingSort/>}/>
            <Route path="/DepthFirstSearch" element={<DepthFirstSearch/>}/>
            <Route path="/DijkstraAlgorithm" element={<DijkstraAlgorithm/>}/>
            <Route path="/FloydWarshall" element={<FloydWarshall/>}/>
            <Route path="/HeapSort" element={<HeapSort/>}/>
            <Route path="/HuffmanCoding" element={<HuffmanCoding/>}/>
            <Route path="/InsertionSort" element={<InsertionSort/>}/>
            <Route path="/KnapsackAlgorithm" element={<KnapsackAlgorithm/>}/>
            <Route path="/KosarajusAlgorithm" element={<KosarajusAlgorithm/>}/>
            <Route path="/KruskalAlgorithms" element={<KruskalAlgorithms/>}/>
            <Route path="/LinearSearch" element={<LinearSearch/>}/>
            <Route path="/LongestCommonSubsequence" element={<LongestCommonSubsequence/>}/>
            <Route path="/MatrixChainMultiplication" element={<MatrixChainMultiplication/>}/>
            <Route path="/MergeSort" element={<MergeSort/>}/>
            <Route path="/NQueenProblem" element={<NQueenProblem/>}/>
            <Route path="/PrimsAlgirithms" element={<PrimsAlgirithms/>}/>
            <Route path="/QuickSort" element={<QuickSort/>}/>
            <Route path="/RateInTheMaze" element={<Rate_in_The_Maze/>}/>
            <Route path="/ReduxSort" element={<ReduxSort/>}/>
            <Route path="/SelectionSort" element={<SelectionSort/>}/>
            <Route path="/SortestPath" element={<SortestPath/>}/>
            <Route path="/StrassenMatrixMultiplication" element={<StrassenMatrixMultiplication/>}/>
            <Route path="/SubsetSum" element={<SubsetSum/>}/>
            <Route path="/SudokuSolver" element={<SudokuSolver/>}/>
            <Route path="/TarjansAlgorithm" element={<TarjansAlgorithm/>}/>
            <Route path='/avlTree' element={<AvlTree/>} />
            <Route path='/binaryTree' element={<BinaryTree/>} />
            <Route path='/balanceTree' element={<BalanceTree/>} />
            <Route path='/binarySearchTree' element={<BinarySearchTree/>}/>
          </Routes>
      </main>
      </Suspense>
    </>
  )
}

export default App;