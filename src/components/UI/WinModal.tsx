import { motion, AnimatePresence } from 'motion/react'
import { useGameStore } from '../../store/gameStore'
import './UI.css'

export function WinModal() {
  const isWon = useGameStore(state => state.isWon)
  const elapsed = useGameStore(state => state.timer.elapsed)
  const newGame = useGameStore(state => state.newGame)

  const minutes = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, '0')
  const seconds = (elapsed % 60).toString().padStart(2, '0')

  return (
    <AnimatePresence>
      {isWon && (
        <motion.div
          className="win-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="win-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="crown-icon">👑</div>
            <h2>Congratulations!</h2>
            <p>You solved the puzzle!</p>
            <div className="final-time">{minutes}:{seconds}</div>
            <button className="btn btn-primary" onClick={newGame}>
              Play Again
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
