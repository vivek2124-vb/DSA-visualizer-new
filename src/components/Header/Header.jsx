import { NavLink } from "react-router-dom";

export default function Header() {
    
    function HandleNavigation(e){

        const CurrentDropDownElement = e.currentTarget.nextElementSibling
        let IsInsideDropDown=false;

        if(e.currentTarget.nextElementSibling.style.display=="block"){
            e.currentTarget.nextElementSibling.style.display="none";
        }else{
            e.currentTarget.nextElementSibling.style.display="block";
        }


        CurrentDropDownElement.addEventListener("mouseenter",()=>{
            IsInsideDropDown=true;
        })
        CurrentDropDownElement.addEventListener("mouseleave",()=>{
            CurrentDropDownElement.style.display="none";
            IsInsideDropDown=false;
        })

        e.currentTarget.addEventListener("mouseleave",()=>{
            setTimeout(() => {
                if(IsInsideDropDown===false){
                    CurrentDropDownElement.style.display="none";
                }
            }, 100);
        })
    }
    
    function NavItems(props) {
        return (
            <div className="nav_items">
                <p onMouseEnter={(e)=>HandleNavigation(e)}>{props.nav_Title}</p>
                <ul>
                    {props.children}
                </ul>
            </div>
        )
    }
    
    function DropdownItem(props){
        return(
            <>
                {/* <li><a href="#">{props.children}</a></li> */}
                <li><NavLink to={props.algopath}>{props.children}</NavLink></li>
            </>
        )
    }

    return (
        <header>
            <div className="logoTitle">
                <NavLink to={"/"}>
                    <h2>DSA</h2>
                    <h6>visualizer</h6>
                </NavLink>
            </div>
            <NavItems nav_Title="Sorting">
                <DropdownItem algopath="/BubbleSort">Bubble Sort</DropdownItem>
                <DropdownItem algopath="/SelectionSort">Selection Sort</DropdownItem>
                <DropdownItem algopath="/InsertionSort">Insertion Sort</DropdownItem>
                <DropdownItem algopath="/BucketSort">Bucket Sort</DropdownItem>
                <DropdownItem algopath="/CountingSort">Counting Sort</DropdownItem>
                <DropdownItem algopath="/ReduxSort">Radux Sort</DropdownItem>
                <DropdownItem algopath="/HeapSort">Heap Sort</DropdownItem>
            </NavItems>
            <NavItems nav_Title="searching">
                <DropdownItem algopath="/LinearSearch">Linear Search</DropdownItem>
                <DropdownItem algopath="/BinarySearch">Binary Search</DropdownItem>
                <DropdownItem algopath="/DepthFirstSearch">Depth First Search</DropdownItem>
                <DropdownItem algopath="/BreadthFirstSearch">Breadth First Search</DropdownItem>
            </NavItems>
            <NavItems nav_Title="Backtracking Algo.">
                <DropdownItem algopath="/RateInTheMaze">Rate in the maze</DropdownItem>
                <DropdownItem algopath="/NQueenProblem">N-Queens Problem</DropdownItem>
                <DropdownItem algopath="/SudokuSolver">Sudoku Solver</DropdownItem>
                <DropdownItem algopath="/SubsetSum">Subset sum</DropdownItem>
            </NavItems>
            <NavItems nav_Title="Divide_&_Conquer">
                <DropdownItem algopath="/MergeSort">Merge Sort</DropdownItem>
                <DropdownItem algopath="/QuickSort">Quick Sort</DropdownItem>
                <DropdownItem algopath="/StrassenMatrixMultiplication">Strassen Matrix Multiplication</DropdownItem>
            </NavItems>
            <NavItems nav_Title="Greedy">
                <DropdownItem algopath="/HuffmanCoding">Huffman Coding</DropdownItem>
                <DropdownItem algopath="/DijkstraAlgorithm">Dijkstra's Algorithms</DropdownItem>
                <DropdownItem algopath="/ActivitySelection">Activity Selection</DropdownItem>
            </NavItems>
            <NavItems nav_Title="Tree">
                <DropdownItem algopath="/avlTree">AVL Tree</DropdownItem>
                <DropdownItem algopath="/binaryTree">Binary Tree</DropdownItem>
                <DropdownItem algopath="/balanceTree">Balance Tree</DropdownItem>
                <DropdownItem algopath="binarySearchTree">Binary search Tree</DropdownItem>
            </NavItems>
            <NavItems nav_Title="Graph Algorithms">
                <NavItems nav_Title="Shortest Path">
                    <DropdownItem algopath="/BellmanFord">Bellman Ford</DropdownItem>
                    <DropdownItem algopath="/FloydWarshall">Floyd Warshall</DropdownItem>
                </NavItems>
                <NavItems nav_Title="Minimum Spanning Tree">
                    <DropdownItem algopath="/KruskalAlgorithms">Kruskal Algorithms</DropdownItem>
                    <DropdownItem algopath="/PrimsAlgirithms">prim's Algorithms</DropdownItem>
                </NavItems>
                <NavItems nav_Title="Connectivity">
                    <DropdownItem algopath="/TarjansAlgorithm">Tarjan's Algorithm</DropdownItem>
                    <DropdownItem algopath="/KosarajusAlgorithm">Kosaraju's Algorithm</DropdownItem>
                </NavItems>
            </NavItems>
            <NavItems nav_Title="Dynamic Algorithms">
                <NavItems nav_Title="Optimization Problums">
                    <DropdownItem algopath="/KnapsackAlgorithm">Knapsack</DropdownItem>
                    <DropdownItem algopath="/LongestCommonSubsequence">Longest Commom Subsequence</DropdownItem>
                </NavItems>
                <NavItems nav_Title="Path Findings">
                    <DropdownItem algopath="/SortestPath">Shortest Path</DropdownItem>
                    <DropdownItem algopath="/MatrixChainMultiplication">Matrix chain multiplication</DropdownItem>
                </NavItems>
            </NavItems>
        </header>
    )
}