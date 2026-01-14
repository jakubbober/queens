import { motion, AnimatePresence } from 'motion/react'
import { useGameStore } from '../../store/gameStore'
import './UI.css'

export function HintDisplay() {
  const currentHint = useGameStore(state => state.currentHint)
  const applyHint = useGameStore(state => state.applyHint)
  const clearHint = useGameStore(state => state.clearHint)

  if (!currentHint) return null

  const getHintIcon = () => {
    switch (currentHint.type) {
      case 'conflict':
        return '⚠️'
      case 'naked_single_row':
      case 'naked_single_col':
      case 'naked_single_region':
        return '💡'
      case 'elimination':
        return '🔍'
      default:
        return '💡'
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="hint-display"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <div className="hint-header">
          <span className="hint-icon">{getHintIcon()}</span>
          <span className="hint-title">
            {currentHint.type === 'conflict' ? 'Conflict Found' : 'Hint'}
          </span>
        </div>
        <p className="hint-explanation">{currentHint.explanation}</p>
        <div className="hint-actions">
          {currentHint.canApply && (
            <button className="btn btn-primary btn-small" onClick={applyHint}>
              Apply
            </button>
          )}
          <button className="btn btn-secondary btn-small" onClick={clearHint}>
            Dismiss
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
