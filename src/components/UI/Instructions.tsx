import { useState } from 'react'
import './UI.css'

export function Instructions() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="instructions">
      <button
        className="instructions-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="instructions-icon">?</span>
        <span>How to Play</span>
        <span className={`instructions-arrow ${isExpanded ? 'expanded' : ''}`}>
          {isExpanded ? '\u25B2' : '\u25BC'}
        </span>
      </button>

      {isExpanded && (
        <div className="instructions-content">
          <div className="instructions-section">
            <h4>Goal</h4>
            <p>Place exactly <strong>9 queens</strong> on the board - one in each row, column, and colored region.</p>
          </div>

          <div className="instructions-section">
            <h4>Rules</h4>
            <ul>
              <li><strong>One queen per row</strong> - Each horizontal row must have exactly one queen</li>
              <li><strong>One queen per column</strong> - Each vertical column must have exactly one queen</li>
              <li><strong>One queen per region</strong> - Each colored region must have exactly one queen</li>
              <li><strong>No adjacent queens</strong> - Queens cannot touch each other, not even diagonally</li>
            </ul>
          </div>

          <div className="instructions-section">
            <h4>Controls</h4>
            <ul>
              <li><strong>Click once</strong> - Place an X mark (to mark cells you've ruled out)</li>
              <li><strong>Click twice</strong> - Place a queen</li>
              <li><strong>Click again</strong> - Clear the cell</li>
              <li><strong>Drag</strong> - Mark multiple cells with X</li>
            </ul>
          </div>

          <div className="instructions-section">
            <h4>Tips</h4>
            <ul>
              <li>Start by looking for regions, rows, or columns with limited options</li>
              <li>Use X marks to eliminate impossible cells</li>
              <li>Enable "Auto X" in settings to automatically mark cells when you place a queen</li>
              <li>Enable "Auto Check" to highlight mistakes as you play</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
