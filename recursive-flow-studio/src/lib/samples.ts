import { RecursionNode } from '../types';

export const ALGORITHM_SAMPLES = {
  fibonacci: {
    name: 'Fibonacci',
    code: `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

fib(5);`,
  },
  factorial: {
    name: 'Factorial',
    code: `function fact(n) {
  if (n <= 1) return 1;
  return n * fact(n - 1);
}

fact(5);`,
  },
  subsets: {
    name: 'Subsets (Backtracking)',
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
  },
  nQueens: {
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
  },
  binarySearch: {
    name: 'Binary Search',
    code: `function binarySearch(arr, target, left, right) {
  if (left > right) return -1;
  const mid = Math.floor((left + right) / 2);
  log(\`Checking mid: \${mid}, val: \${arr[mid]}\`);
  if (arr[mid] === target) return mid;
  if (arr[mid] > target) return binarySearch(arr, target, left, mid - 1);
  return binarySearch(arr, target, mid + 1, right);
}

binarySearch([1, 3, 5, 7, 9, 11], 7, 0, 5);`,
  },
  pythonFib: {
    name: 'Python Fibonacci (Sim)',
    code: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

fib(5)`,
  },
  cppFact: {
    name: 'C++ Factorial (Sim)',
    code: `int fact(int n) {
    if (n <= 1) return 1;
    return n * fact(n - 1);
}

fact(5)`,
  }
};
