import { ProblemCategory } from '../types';

export const PROBLEM_LIBRARY: ProblemCategory[] = [
  {
    id: 'fundamentals',
    name: 'Fundamentals',
    problems: [
      {
        id: 'print-1-to-n',
        name: 'Print 1 to N',
        code: `function print1ToN(n) {
  if (n === 0) return;
  print1ToN(n - 1);
  log(n);
}

print1ToN(5);`,
        explanation: 'Prints numbers from 1 to N using recursion by calling the function for n-1 first.',
        complexity: {
          time: 'O(N)',
          space: 'O(N)',
          recurrence: 'T(N) = T(N-1) + O(1)',
          explanation: 'Each call takes constant time and there are N calls.'
        }
      },
      {
        id: 'fibonacci',
        name: 'Fibonacci',
        code: `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

fib(5);`,
        explanation: 'Calculates the Nth Fibonacci number using the standard recursive formula.',
        complexity: {
          time: 'O(2^N)',
          space: 'O(N)',
          recurrence: 'T(N) = T(N-1) + T(N-2) + O(1)',
          explanation: 'The recursion tree has a branching factor of 2 and depth N.'
        }
      },
      {
        id: 'factorial',
        name: 'Factorial',
        code: `function fact(n) {
  if (n <= 1) return 1;
  return n * fact(n - 1);
}

fact(5);`,
        explanation: 'Calculates the factorial of N.',
        complexity: {
          time: 'O(N)',
          space: 'O(N)',
          recurrence: 'T(N) = T(N-1) + O(1)',
          explanation: 'N recursive calls are made.'
        }
      }
    ]
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    problems: [
      {
        id: 'subsets',
        name: 'Subsets',
        code: `function subsets(nums) {
  const result = [];
  function backtrack(start, path) {
    choose(\`Start: \${start}, Path: [\${path}]\`, { start, path });
    result.push([...path]);
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1, path);
      path.pop();
      backtrack(\`Backtrack from \${nums[i]}\`);
    }
  }
  backtrack(0, []);
  return result;
}

subsets([1, 2, 3]);`,
        explanation: 'Generates all possible subsets (power set) of a set of numbers.',
        complexity: {
          time: 'O(2^N)',
          space: 'O(N)',
          recurrence: 'T(N) = 2 * T(N-1)',
          explanation: 'Each element can either be included or not included in a subset.'
        }
      },
      {
        id: 'n-queens',
        name: 'N-Queens',
        code: `function solveNQueens(n) {
  const res = [];
  const board = Array.from({ length: n }, () => Array(n).fill('.'));
  
  function backtrack(row) {
    if (row === n) {
      res.push(board.map(r => r.join('')));
      return;
    }
    for (let col = 0; col < n; col++) {
      if (isValid(row, col)) {
        choose(\`Place at (\${row}, \${col})\`);
        board[row][col] = 'Q';
        backtrack(row + 1);
        board[row][col] = '.';
        backtrack(\`Remove from (\${row}, \${col})\`);
      }
    }
  }
  
  function isValid(row, col) {
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 'Q') return false;
    }
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 'Q') return false;
    }
    for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
      if (board[i][j] === 'Q') return false;
    }
    return true;
  }
  
  backtrack(0);
  return res;
}

solveNQueens(4);`,
        explanation: 'Places N queens on an NxN board such that no two queens threaten each other.',
        complexity: {
          time: 'O(N!)',
          space: 'O(N^2)',
          recurrence: 'T(N) = N * T(N-1)',
          explanation: 'There are N choices for the first row, N-1 for the second, and so on.'
        }
      }
    ]
  },
  {
    id: 'divide-and-conquer',
    name: 'Divide and Conquer',
    problems: [
      {
        id: 'merge-sort',
        name: 'Merge Sort',
        code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  let result = [], l = 0, r = 0;
  while (l < left.length && r < right.length) {
    if (left[l] < right[r]) result.push(left[l++]);
    else result.push(right[r++]);
  }
  return result.concat(left.slice(l)).concat(right.slice(r));
}

mergeSort([4, 2, 7, 1, 3]);`,
        explanation: 'Sorts an array using the divide and conquer strategy.',
        complexity: {
          time: 'O(N log N)',
          space: 'O(N)',
          recurrence: 'T(N) = 2T(N/2) + O(N)',
          explanation: 'The array is split in half at each step, and merging takes linear time.'
        }
      }
    ]
  }
];
