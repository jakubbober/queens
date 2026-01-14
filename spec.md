# **LINKEDIN QUEENS GAME - PRECISE TECHNICAL SPECIFICATION FOR CURSOR IMPLEMENTATION**

## **1. CORE GAME MECHANICS**

### **1.1 Objective**
Place exactly **one Crown symbol (Queen 👑)** in each:
- Row
- Column  
- Colored region (zone)

### **1.2 Placement Rules**
1. **Exactly one queen per row** - no more, no less
2. **Exactly one queen per column** - no more, no less
3. **Exactly one queen per colored region** - no more, no less
4. **No adjacent placements** - Queens cannot be placed in cells that touch each other, **including diagonally**
   - A queen at position (x, y) blocks all 8 surrounding cells: (x-1,y-1), (x,y-1), (x+1,y-1), (x-1,y), (x+1,y), (x-1,y+1), (x,y+1), (x+1,y+1)
5. **Unique solution guaranteed** - LinkedIn puzzles always have exactly one valid solution

### **1.3 Grid Dimensions**
- Standard: **9×9 grid** (similar to Sudoku size)
- Colored regions vary in size and shape
- Grid divided into irregular, multi-cell colored regions (like Jigsaw Sudoku)

***

## **2. CELL STATES & INTERACTION MODEL**

### **2.1 Three-State Cell System**
Each cell can be in one of three states:

1. **Empty** (default) - no symbol, clickable
2. **Marked with X** (elimination mark) - user manually marked as "no queen here"
3. **Crown/Queen (👑)** - the actual solution placement

### **2.2 Cell Interaction Flow**
- **Click/tap cycle**: Empty → Crown → Mark X → Empty (three-state toggle)
- On web: Single click cycles through states
- On mobile: Tap cycles through states
- Users build the solution incrementally by toggling states

### **2.3 Visual Cell Indicators**
- **Empty cell**: Clean, neutral background (light color with border)
- **Marked X cell**: Visual X or cross symbol displayed
- **Queen cell**: Crown emoji (👑) or crown icon displayed
- **Color coding**: Each cell belongs to one of 6-10 colored regions with distinct colors
- **Region borders**: Thick/bold borders between regions for visual clarity
- **Accessibility note**: Color-blind support via additional border thickness around regions

***

## **3. GRID LAYOUT & VISUAL DESIGN**

### **3.1 Grid Structure**
```
┌─────────────────────────────────────┐
│  Region 1 (Blue)   │  Region 2 (Red)  │
│                    │                  │
├────────────────────┼──────────────────┤
│ Region 3 (Green)   │ Region 4 (Orange)│
│                    │                  │
└────────────────────┴──────────────────┘
```

- **9×9 grid with 81 cells total**
- **6-10 colored regions** with irregular shapes
- **Region borders**: Thick (2-3px) dark lines separate regions
- **Cell borders**: Thin (1px) light grid lines within regions
- **Region colors**: Distinct, contrasting colors (e.g., blue, red, green, orange, purple, yellow, teal, etc.)

### **3.2 Cell Sizing**
- Each cell should be **60-80px** (web) or **45-60dp** (mobile) to accommodate:
  - Crown emoji (readable)
  - X mark (visible)
  - Border space
  - Touch target area (min 44×44px on mobile)

### **3.3 Header/Status Area**
- **Game title**: "Queens" or "Daily Queens Puzzle"
- **Puzzle number/date**: Shows which day's puzzle
- **Timer**: Elapsed time display (MM:SS format)
- **Score/performance**: Compares to average times (after completion)

### **3.4 Controls/Button Area**
- **Hint button**: Highlights a region where a queen must be placed OR shows incorrect placements
- **Undo button**: Removes last placement (state change)
- **Clear button**: Removes ALL queens and marks (reset board)
- **Settings icon**: Opens settings menu
- **Submit/Check button**: May appear when puzzle complete to verify and submit score

***

## **4. SETTINGS & GAME ASSISTANCE**

### **4.1 Auto-Check Feature**
- When enabled, highlights rule violations in **red stripes** or red highlighting
- Shows cells with too many queens placed in that row/column/region
- Helps users self-correct without explicit "error" messages

### **4.2 Auto-Place X's Feature**
- When enabled, automatically marks (X) cells that cannot contain queens based on current placements
- Uses logical deduction from the three rules
- Significantly speeds up solving

### **4.3 Hint System**
- **Hint button**: Reveals one queen placement (lights up the cell) OR
- Alternative: Highlights a specific region where queen placement is forced
- Can be clicked multiple times (limited hints per game, typically 3)

***

## **5. SOLVING LOGIC & CONSTRAINT PROPAGATION**

### **5.1 Rule Enforcement Algorithm**
For each placement, check:
```
1. Queen placed in row → All other cells in that row cannot have queens
2. Queen placed in column → All other cells in that column cannot have queens
3. Queen placed in region → All other cells in that region cannot have queens
4. Queen placed at (x,y) → All 8 adjacent cells (including diagonals) cannot have queens
5. If a region still needs a queen → Mark all cells that violate rules (adjacent to existing queens, etc.)
```

### **5.2 Constraint Propagation (for auto-X feature)**
After each queen placement, propagate constraints:
- Mark all adjacent cells (8 directions) as invalid
- Mark all cells in same row/column as invalid if that row/column already has a queen
- Mark all cells in same region as invalid if that region already has a queen
- Check if any region has only one possible placement left → Auto-place queen

### **5.3 Unique Solution Verification**
- Puzzles should be **pre-generated with verification** that exactly one solution exists
- Use backtracking solver to validate during generation
- If generating on-the-fly: Run solver to confirm uniqueness before presenting puzzle

***

## **6. UI/UX INTERACTION FLOW**

### **6.1 Game Screen Layout**
```
┌─────────────────────────────────────────┐
│  Queens - Daily Puzzle #157              │
│  Time: 05:34                             │
├─────────────────────────────────────────┤
│                                          │
│          [9x9 GRID WITH COLORS]         │
│                                          │
├─────────────────────────────────────────┤
│  [Hint] [Undo] [Clear] [⚙️ Settings]    │
└─────────────────────────────────────────┘
```

### **6.2 Cell Interaction (Desktop)**
- **Left click**: Cycle state (Empty → Crown → X → Empty)
- **Right click/Long press** (mobile): Quick mark X
- **Hover effect**: Slight highlight/shadow when hovering over cell
- **Immediate feedback**: Cell state changes instantly on click

### **6.3 Visual Feedback for Interactions**
- **Active cell**: Slight shadow/outline when clicked
- **Valid placement**: No visual error (proceeds silently)
- **Rule violation** (if auto-check on): Red stripes or red background
- **Completed row/column/region**: Subtle visual indication (e.g., slight glow)

### **6.4 Win Condition**
- **All cells placed correctly**: Game automatically detects completion
- **Results screen appears**: Shows:
  - Completion time
  - Your score/percentile vs average players
  - Company/CEO leaderboard (if applicable)
  - Streak count
  - Share score button
  - Play again button

***

## **7. COLORS & STYLING PALETTE (LinkedIn Style)**

### **7.1 Suggested Color Regions**
- **Blue** (#0A66C2 or similar LinkedIn blue)
- **Red** (#E74C3C)
- **Green** (#27AE60)
- **Orange** (#F39C12)
- **Purple** (#9B59B6)
- **Teal** (#1ABC9C)
- **Yellow** (#F1C40F)
- **Gray** (#95A5A6)
- **Brown** (#8B4513)
- **Magenta** (#E91E63)

### **7.2 Cell Styling**
- **Cell background**: Light (near white for light regions) with opacity/tint of region color (~80% saturation)
- **Cell border (within region)**: #CCCCCC (light gray), 1px
- **Region border**: #333333 or #222222 (dark gray/black), 2-3px
- **Cell padding**: 2-4px internal padding
- **Corner radius**: 0px (sharp corners, no rounding)

### **7.3 Text & Icons**
- **Crown emoji size**: 32-48px inside cell (depends on cell size)
- **X mark**: Bold sans-serif X, ~36px, dark color (#333)
- **Font family**: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif (system fonts)
- **Buttons**: Rounded corners (8-12px), LinkedIn blue background, white text, hover darkening

***

## **8. IMPLEMENTATION CHECKLIST FOR CURSOR**

### **Phase 1: Core Structure**
- [ ] 9×9 grid data structure (array of arrays)
- [ ] Cell state enum (EMPTY, QUEEN, MARKED_X)
- [ ] Colored region mapping (which cells belong to which region)
- [ ] Region color palette definition
- [ ] Grid rendering (HTML/Canvas/SVG)

### **Phase 2: Interaction & State Management**
- [ ] Click handler for cell cycling through states
- [ ] Undo stack (store previous board states)
- [ ] Clear function (reset all cells to EMPTY)
- [ ] Auto-check constraint validation
- [ ] Auto-place X's logic (constraint propagation)

### **Phase 3: Solving Logic**
- [ ] Rule violation detection (rows, columns, regions, adjacency)
- [ ] Hint generator (find forced placements)
- [ ] Win condition checker (all rules satisfied, all cells filled)
- [ ] Backtracking solver (for validation/hints)

### **Phase 4: UI/UX Polish**
- [ ] Game timer
- [ ] Settings panel (auto-check, auto-place X's)
- [ ] Results/score screen
- [ ] Responsive design (mobile & desktop)
- [ ] Visual feedback (highlights, animations, state changes)
- [ ] Accessibility (color-blind support, keyboard navigation)

### **Phase 5: Puzzle Generation (Optional)**
- [ ] Puzzle generator (place queens → remove clues)
- [ ] Difficulty levels
- [ ] Pre-generation with uniqueness verification

***

## **9. TECHNICAL SPECIFICATIONS FOR CURSOR PROMPT**

### **High-Level Prompt for Cursor**
```
Build a fully functional LinkedIn Queens puzzle game with these specs:

CORE MECHANICS:
- 9×9 grid divided into 6-10 irregular colored regions
- Place exactly one Crown (👑) per row, column, and colored region
- No queens can be adjacent (including diagonally)
- Three-state cells: Empty → Crown → Marked X → Empty (cycling on click)

UI:
- 60-80px cells with colored region backgrounds and dark region borders
- Distinct colors for each region (blues, reds, greens, oranges, purples, teals)
- Header with puzzle number and elapsed timer
- Controls: Hint, Undo, Clear, Settings
- Mobile responsive design

FEATURES:
- Auto-check: Highlights rule violations in red when enabled
- Auto-place X's: Automatically marks invalid cells based on placements
- Hint system: Reveals one queen or highlights a forced region
- Undo: Removes last placement
- Win detection: Auto-shows results screen with time and score
- Keyboard support: Arrow keys to navigate, Enter to place, X to mark

LOGIC:
- Validate all three rules (row, column, region) on every placement
- Constraint propagation for auto-X feature
- Backtracking solver for hints/validation
- Ensure unique solution

STYLING:
- LinkedIn-style colors and fonts (system fonts)
- Clean, professional UI
- Visual feedback on interactions (hover, click, validation)

START with the grid structure and rendering, then add interaction logic, then solver.
```

***

## **10. KEY POINTS FOR ACCURATE VIBE-CODING**

1. **Three-state toggle is critical** - this is the primary interaction model
2. **Region borders are THICK** - this visual distinction is essential for gameplay
3. **Adjacency check includes diagonals** - this is often overlooked but game-critical
4. **Auto-X logic is constraint propagation** - it's not just simple rule checking, it's iterative
5. **Unique solution guarantee** - LinkedIn always has exactly one answer (verify during generation)
6. **Color accessibility** - thick region borders help color-blind players
7. **No animations needed initially** - focus on correctness, then add polish
8. **Settings are user preferences** - auto-check and auto-X are toggles, not always-on
9. **Hint system is powerful** - revealing one queen or showing forced regions significantly helps
10. **Score comparison is post-game** - timing and percentile comparisons appear after completion

***

[1](https://www.linkedin.com/help/linkedin/answer/a6269510)
[2](https://www.reddit.com/r/gamedev/comments/1e6w9g8/need_help_ensuring_a_unique_solution_for_queens/)
[3](https://www.linkedin.com/posts/animesh-chouhan_chess-algorithm-queensgame-activity-7218208683539800065-ASV8)
[4](https://www.youtube.com/watch?v=4Uz92RqjlUE)
[5](https://github.com/KristiyanCholakov/LinkedIn-Games-Agents)
[6](https://www.reddit.com/r/LinkedInTips/comments/1fwr251/linkedin_queens_a_list_of_strategies/)
[7](https://www.queensgame.org/blog/linkedin-queens-game-complete-strategy-guide)
[8](https://www.reddit.com/r/proceduralgeneration/comments/1cspuna/creating_a_queens_game_map_on_linkedin/)
[9](https://www.linkedin.com/posts/peter-tong-kw_i-made-this-queens-puzzle-app-in-just-a-weekend-activity-7281570221679616000-YF4t)
[10](https://mathspp.com/blog/beating-linkedin-queens-with-python)
[11](https://cs4fn.blog/2024/10/20/the-logic-of-queens/)
[12](https://www.linkedin.com/posts/jan-verwey_if-there-were-a-world-record-for-linkedins-activity-7284921037920632833-vGlw)
[13](https://pitr.ca/2025-06-14-queens)
[14](https://www.linkedin.com/posts/franchiseeattorney_games-which-solve-themself-queens-by-linkedin-activity-7228409041809522688-lC8Y)
[15](https://www.linkedin.com/posts/queens-game_queens-activity-7282301190560722944-LyFr)
