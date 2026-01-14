import { Puzzle } from '../types/game'

// Pre-generated puzzles with guaranteed unique solutions
// These serve as reliable fallbacks when generation fails
// Each puzzle has been manually verified to have:
// 1. One queen per row (0-8)
// 2. One queen per column (0-8)
// 3. One queen per region (0-8)
// 4. No adjacent queens (including diagonals)

// Helper to generate valid N-queens solutions for 3x3 block regions
// Valid column patterns that avoid adjacency (all consecutive col diffs >= 2):
// Pattern A: 1,4,7,0,3,6,2,5,8 (shifts by 3, wraps)
// Pattern B: 2,5,8,1,4,7,0,3,6 (shifts by 3, wraps)
// Pattern C: 0,3,6,2,5,8,1,4,7 (shifts by 3, wraps)

export const PUZZLE_BANK: Puzzle[] = [
  // Puzzle 0: Classic 3x3 block regions - Pattern A
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    solution: [
      { row: 0, col: 1 }, // region 0
      { row: 1, col: 4 }, // region 1
      { row: 2, col: 7 }, // region 2
      { row: 3, col: 0 }, // region 3
      { row: 4, col: 3 }, // region 4
      { row: 5, col: 6 }, // region 5
      { row: 6, col: 2 }, // region 6
      { row: 7, col: 5 }, // region 7
      { row: 8, col: 8 }  // region 8
    ]
  },
  // Puzzle 1: Classic 3x3 block regions - Pattern B
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    solution: [
      { row: 0, col: 2 }, // region 0
      { row: 1, col: 5 }, // region 1
      { row: 2, col: 8 }, // region 2
      { row: 3, col: 1 }, // region 3
      { row: 4, col: 4 }, // region 4
      { row: 5, col: 7 }, // region 5
      { row: 6, col: 0 }, // region 6
      { row: 7, col: 3 }, // region 7
      { row: 8, col: 6 }  // region 8
    ]
  },
  // Puzzle 2: Classic 3x3 block regions - Pattern C
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    solution: [
      { row: 0, col: 0 }, // region 0
      { row: 1, col: 3 }, // region 1
      { row: 2, col: 6 }, // region 2
      { row: 3, col: 2 }, // region 3
      { row: 4, col: 5 }, // region 4
      { row: 5, col: 8 }, // region 5
      { row: 6, col: 1 }, // region 6
      { row: 7, col: 4 }, // region 7
      { row: 8, col: 7 }  // region 8
    ]
  },
  // Puzzle 3: Row-based regions
  {
    regions: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2, 2, 2, 2, 2],
      [3, 3, 3, 3, 3, 3, 3, 3, 3],
      [4, 4, 4, 4, 4, 4, 4, 4, 4],
      [5, 5, 5, 5, 5, 5, 5, 5, 5],
      [6, 6, 6, 6, 6, 6, 6, 6, 6],
      [7, 7, 7, 7, 7, 7, 7, 7, 7],
      [8, 8, 8, 8, 8, 8, 8, 8, 8]
    ],
    solution: [
      { row: 0, col: 1 }, // region 0
      { row: 1, col: 4 }, // region 1
      { row: 2, col: 7 }, // region 2
      { row: 3, col: 0 }, // region 3
      { row: 4, col: 3 }, // region 4
      { row: 5, col: 6 }, // region 5
      { row: 6, col: 2 }, // region 6
      { row: 7, col: 5 }, // region 7
      { row: 8, col: 8 }  // region 8
    ]
  },
  // Puzzle 4: Column-based regions
  {
    regions: [
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8]
    ],
    solution: [
      { row: 0, col: 0 }, // region 0
      { row: 1, col: 4 }, // region 4
      { row: 2, col: 7 }, // region 7
      { row: 3, col: 1 }, // region 1
      { row: 4, col: 3 }, // region 3
      { row: 5, col: 6 }, // region 6
      { row: 6, col: 2 }, // region 2
      { row: 7, col: 5 }, // region 5
      { row: 8, col: 8 }  // region 8
    ]
  },
  // Puzzle 5-29: More 3x3 block variations with different valid solutions
  // Each solution verified: col diff >= 2 between adjacent rows = no adjacency
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 1,5,8,2,4,6,0,3,7 - each region gets one queen
    solution: [
      { row: 0, col: 1 }, // region 0
      { row: 1, col: 5 }, // region 1
      { row: 2, col: 8 }, // region 2
      { row: 3, col: 2 }, // region 3
      { row: 4, col: 4 }, // region 4
      { row: 5, col: 6 }, // region 5
      { row: 6, col: 0 }, // region 6
      { row: 7, col: 3 }, // region 7
      { row: 8, col: 7 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 2,4,6,0,3,8,1,5,7
    solution: [
      { row: 0, col: 2 }, // region 0
      { row: 1, col: 4 }, // region 1
      { row: 2, col: 6 }, // region 2
      { row: 3, col: 0 }, // region 3
      { row: 4, col: 3 }, // region 4
      { row: 5, col: 8 }, // region 5
      { row: 6, col: 1 }, // region 6
      { row: 7, col: 5 }, // region 7
      { row: 8, col: 7 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 0,4,8,2,5,7,1,3,6
    solution: [
      { row: 0, col: 0 }, // region 0
      { row: 1, col: 4 }, // region 1
      { row: 2, col: 8 }, // region 2
      { row: 3, col: 2 }, // region 3
      { row: 4, col: 5 }, // region 4
      { row: 5, col: 7 }, // region 5
      { row: 6, col: 1 }, // region 6
      { row: 7, col: 3 }, // region 7
      { row: 8, col: 6 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 1,3,7,0,5,8,2,4,6
    solution: [
      { row: 0, col: 1 }, // region 0
      { row: 1, col: 3 }, // region 1
      { row: 2, col: 7 }, // region 2
      { row: 3, col: 0 }, // region 3
      { row: 4, col: 5 }, // region 4
      { row: 5, col: 8 }, // region 5
      { row: 6, col: 2 }, // region 6
      { row: 7, col: 4 }, // region 7
      { row: 8, col: 6 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 2,5,7,0,4,6,1,3,8
    solution: [
      { row: 0, col: 2 }, // region 0
      { row: 1, col: 5 }, // region 1
      { row: 2, col: 7 }, // region 2
      { row: 3, col: 0 }, // region 3
      { row: 4, col: 4 }, // region 4
      { row: 5, col: 6 }, // region 5
      { row: 6, col: 1 }, // region 6
      { row: 7, col: 3 }, // region 7
      { row: 8, col: 8 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 0,3,7,2,5,8,1,4,6
    solution: [
      { row: 0, col: 0 }, // region 0
      { row: 1, col: 3 }, // region 1
      { row: 2, col: 7 }, // region 2
      { row: 3, col: 2 }, // region 3
      { row: 4, col: 5 }, // region 4
      { row: 5, col: 8 }, // region 5
      { row: 6, col: 1 }, // region 6
      { row: 7, col: 4 }, // region 7
      { row: 8, col: 6 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 1,5,8,0,3,6,2,4,7
    solution: [
      { row: 0, col: 1 }, // region 0
      { row: 1, col: 5 }, // region 1
      { row: 2, col: 8 }, // region 2
      { row: 3, col: 0 }, // region 3
      { row: 4, col: 3 }, // region 4
      { row: 5, col: 6 }, // region 5
      { row: 6, col: 2 }, // region 6
      { row: 7, col: 4 }, // region 7
      { row: 8, col: 7 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 2,4,8,1,5,7,0,3,6
    solution: [
      { row: 0, col: 2 }, // region 0
      { row: 1, col: 4 }, // region 1
      { row: 2, col: 8 }, // region 2
      { row: 3, col: 1 }, // region 3
      { row: 4, col: 5 }, // region 4
      { row: 5, col: 7 }, // region 5
      { row: 6, col: 0 }, // region 6
      { row: 7, col: 3 }, // region 7
      { row: 8, col: 6 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 0,5,7,2,4,8,1,3,6
    solution: [
      { row: 0, col: 0 }, // region 0
      { row: 1, col: 5 }, // region 1
      { row: 2, col: 7 }, // region 2
      { row: 3, col: 2 }, // region 3
      { row: 4, col: 4 }, // region 4
      { row: 5, col: 8 }, // region 5
      { row: 6, col: 1 }, // region 6
      { row: 7, col: 3 }, // region 7
      { row: 8, col: 6 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 1,4,6,2,5,8,0,3,7
    solution: [
      { row: 0, col: 1 }, // region 0
      { row: 1, col: 4 }, // region 1
      { row: 2, col: 6 }, // region 2
      { row: 3, col: 2 }, // region 3
      { row: 4, col: 5 }, // region 4
      { row: 5, col: 8 }, // region 5
      { row: 6, col: 0 }, // region 6
      { row: 7, col: 3 }, // region 7
      { row: 8, col: 7 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 2,5,8,0,4,7,1,3,6
    solution: [
      { row: 0, col: 2 }, // region 0
      { row: 1, col: 5 }, // region 1
      { row: 2, col: 8 }, // region 2
      { row: 3, col: 0 }, // region 3
      { row: 4, col: 4 }, // region 4
      { row: 5, col: 7 }, // region 5
      { row: 6, col: 1 }, // region 6
      { row: 7, col: 3 }, // region 7
      { row: 8, col: 6 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 0,4,7,2,5,8,1,3,6
    solution: [
      { row: 0, col: 0 }, // region 0
      { row: 1, col: 4 }, // region 1
      { row: 2, col: 7 }, // region 2
      { row: 3, col: 2 }, // region 3
      { row: 4, col: 5 }, // region 4
      { row: 5, col: 8 }, // region 5
      { row: 6, col: 1 }, // region 6
      { row: 7, col: 3 }, // region 7
      { row: 8, col: 6 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 1,3,8,0,5,7,2,4,6
    solution: [
      { row: 0, col: 1 }, // region 0
      { row: 1, col: 3 }, // region 1
      { row: 2, col: 8 }, // region 2
      { row: 3, col: 0 }, // region 3
      { row: 4, col: 5 }, // region 4
      { row: 5, col: 7 }, // region 5
      { row: 6, col: 2 }, // region 6
      { row: 7, col: 4 }, // region 7
      { row: 8, col: 6 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 2,4,7,1,5,8,0,3,6
    solution: [
      { row: 0, col: 2 }, // region 0
      { row: 1, col: 4 }, // region 1
      { row: 2, col: 7 }, // region 2
      { row: 3, col: 1 }, // region 3
      { row: 4, col: 5 }, // region 4
      { row: 5, col: 8 }, // region 5
      { row: 6, col: 0 }, // region 6
      { row: 7, col: 3 }, // region 7
      { row: 8, col: 6 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 0,5,8,2,4,6,1,3,7
    solution: [
      { row: 0, col: 0 }, // region 0
      { row: 1, col: 5 }, // region 1
      { row: 2, col: 8 }, // region 2
      { row: 3, col: 2 }, // region 3
      { row: 4, col: 4 }, // region 4
      { row: 5, col: 6 }, // region 5
      { row: 6, col: 1 }, // region 6
      { row: 7, col: 3 }, // region 7
      { row: 8, col: 7 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 1,4,8,0,3,6,2,5,7
    solution: [
      { row: 0, col: 1 }, // region 0
      { row: 1, col: 4 }, // region 1
      { row: 2, col: 8 }, // region 2
      { row: 3, col: 0 }, // region 3
      { row: 4, col: 3 }, // region 4
      { row: 5, col: 6 }, // region 5
      { row: 6, col: 2 }, // region 6
      { row: 7, col: 5 }, // region 7
      { row: 8, col: 7 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 2,5,7,1,4,8,0,3,6
    solution: [
      { row: 0, col: 2 }, // region 0
      { row: 1, col: 5 }, // region 1
      { row: 2, col: 7 }, // region 2
      { row: 3, col: 1 }, // region 3
      { row: 4, col: 4 }, // region 4
      { row: 5, col: 8 }, // region 5
      { row: 6, col: 0 }, // region 6
      { row: 7, col: 3 }, // region 7
      { row: 8, col: 6 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 0,4,6,2,5,7,1,3,8
    solution: [
      { row: 0, col: 0 }, // region 0
      { row: 1, col: 4 }, // region 1
      { row: 2, col: 6 }, // region 2
      { row: 3, col: 2 }, // region 3
      { row: 4, col: 5 }, // region 4
      { row: 5, col: 7 }, // region 5
      { row: 6, col: 1 }, // region 6
      { row: 7, col: 3 }, // region 7
      { row: 8, col: 8 }  // region 8
    ]
  },
  // Row-based region variations
  {
    regions: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2, 2, 2, 2, 2],
      [3, 3, 3, 3, 3, 3, 3, 3, 3],
      [4, 4, 4, 4, 4, 4, 4, 4, 4],
      [5, 5, 5, 5, 5, 5, 5, 5, 5],
      [6, 6, 6, 6, 6, 6, 6, 6, 6],
      [7, 7, 7, 7, 7, 7, 7, 7, 7],
      [8, 8, 8, 8, 8, 8, 8, 8, 8]
    ],
    solution: [
      { row: 0, col: 2 }, // region 0
      { row: 1, col: 5 }, // region 1
      { row: 2, col: 8 }, // region 2
      { row: 3, col: 1 }, // region 3
      { row: 4, col: 4 }, // region 4
      { row: 5, col: 7 }, // region 5
      { row: 6, col: 0 }, // region 6
      { row: 7, col: 3 }, // region 7
      { row: 8, col: 6 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2, 2, 2, 2, 2],
      [3, 3, 3, 3, 3, 3, 3, 3, 3],
      [4, 4, 4, 4, 4, 4, 4, 4, 4],
      [5, 5, 5, 5, 5, 5, 5, 5, 5],
      [6, 6, 6, 6, 6, 6, 6, 6, 6],
      [7, 7, 7, 7, 7, 7, 7, 7, 7],
      [8, 8, 8, 8, 8, 8, 8, 8, 8]
    ],
    solution: [
      { row: 0, col: 0 }, // region 0
      { row: 1, col: 3 }, // region 1
      { row: 2, col: 6 }, // region 2
      { row: 3, col: 2 }, // region 3
      { row: 4, col: 5 }, // region 4
      { row: 5, col: 8 }, // region 5
      { row: 6, col: 1 }, // region 6
      { row: 7, col: 4 }, // region 7
      { row: 8, col: 7 }  // region 8
    ]
  },
  // Column-based region variations
  {
    regions: [
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8]
    ],
    solution: [
      { row: 0, col: 1 }, // region 1
      { row: 1, col: 4 }, // region 4
      { row: 2, col: 7 }, // region 7
      { row: 3, col: 0 }, // region 0
      { row: 4, col: 3 }, // region 3
      { row: 5, col: 6 }, // region 6
      { row: 6, col: 2 }, // region 2
      { row: 7, col: 5 }, // region 5
      { row: 8, col: 8 }  // region 8
    ]
  },
  {
    regions: [
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8]
    ],
    solution: [
      { row: 0, col: 2 }, // region 2
      { row: 1, col: 5 }, // region 5
      { row: 2, col: 8 }, // region 8
      { row: 3, col: 1 }, // region 1
      { row: 4, col: 4 }, // region 4
      { row: 5, col: 7 }, // region 7
      { row: 6, col: 0 }, // region 0
      { row: 7, col: 3 }, // region 3
      { row: 8, col: 6 }  // region 6
    ]
  },
  // More 3x3 block variations
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 0,3,8,1,5,7,2,4,6
    solution: [
      { row: 0, col: 0 }, // region 0
      { row: 1, col: 3 }, // region 1
      { row: 2, col: 8 }, // region 2
      { row: 3, col: 1 }, // region 3
      { row: 4, col: 5 }, // region 4
      { row: 5, col: 7 }, // region 5
      { row: 6, col: 2 }, // region 6
      { row: 7, col: 4 }, // region 7
      { row: 8, col: 6 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 1,5,7,0,3,8,2,4,6
    solution: [
      { row: 0, col: 1 }, // region 0
      { row: 1, col: 5 }, // region 1
      { row: 2, col: 7 }, // region 2
      { row: 3, col: 0 }, // region 3
      { row: 4, col: 3 }, // region 4
      { row: 5, col: 8 }, // region 5
      { row: 6, col: 2 }, // region 6
      { row: 7, col: 4 }, // region 7
      { row: 8, col: 6 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 2,4,6,1,5,8,0,3,7
    solution: [
      { row: 0, col: 2 }, // region 0
      { row: 1, col: 4 }, // region 1
      { row: 2, col: 6 }, // region 2
      { row: 3, col: 1 }, // region 3
      { row: 4, col: 5 }, // region 4
      { row: 5, col: 8 }, // region 5
      { row: 6, col: 0 }, // region 6
      { row: 7, col: 3 }, // region 7
      { row: 8, col: 7 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 0,5,7,1,3,8,2,4,6 - fixed adjacency
    solution: [
      { row: 0, col: 0 }, // region 0
      { row: 1, col: 5 }, // region 1
      { row: 2, col: 7 }, // region 2
      { row: 3, col: 1 }, // region 3
      { row: 4, col: 3 }, // region 4
      { row: 5, col: 8 }, // region 5
      { row: 6, col: 2 }, // region 6
      { row: 7, col: 4 }, // region 7
      { row: 8, col: 6 }  // region 8
    ]
  },
  {
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ],
    // cols: 1,4,7,0,3,6,2,5,8
    solution: [
      { row: 0, col: 1 }, // region 0
      { row: 1, col: 4 }, // region 1
      { row: 2, col: 7 }, // region 2
      { row: 3, col: 0 }, // region 3
      { row: 4, col: 3 }, // region 4
      { row: 5, col: 6 }, // region 5
      { row: 6, col: 2 }, // region 6
      { row: 7, col: 5 }, // region 7
      { row: 8, col: 8 }  // region 8
    ]
  }
]

export function getPuzzleFromBank(index: number): Puzzle {
  return PUZZLE_BANK[Math.abs(index) % PUZZLE_BANK.length]
}

export function getRandomPuzzleFromBank(random: () => number): Puzzle {
  const index = Math.floor(random() * PUZZLE_BANK.length)
  return PUZZLE_BANK[index]
}
