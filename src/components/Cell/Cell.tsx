import { memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { getRegionColor } from '../../utils/colors'
import './Cell.css'

interface CellProps {
  row: number
  col: number
  regionId: number
  hasQueen: boolean
  hasManualX: boolean
  hasAutoX: boolean
  hasError: boolean
  borderTop: boolean
  borderBottom: boolean
  borderLeft: boolean
  borderRight: boolean
  onClick: () => void
  isHinted?: boolean
}

export const Cell = memo(function Cell({
  row,
  col,
  regionId,
  hasQueen,
  hasManualX,
  hasAutoX,
  hasError,
  borderTop,
  borderBottom,
  borderLeft,
  borderRight,
  onClick,
  isHinted = false
}: CellProps) {
  const backgroundColor = getRegionColor(regionId)

  const classNames = [
    'cell',
    hasError && 'cell-error',
    isHinted && 'cell-hinted',
    borderTop && 'border-top',
    borderBottom && 'border-bottom',
    borderLeft && 'border-left',
    borderRight && 'border-right'
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classNames}
      style={{ backgroundColor }}
      onClick={onClick}
      data-row={row}
      data-col={col}
    >
      <AnimatePresence mode="wait">
        {hasQueen && (
          <motion.span
            key="queen"
            className="cell-queen"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            👑
          </motion.span>
        )}
        {hasManualX && !hasQueen && (
          <motion.span
            key="manual-x"
            className="cell-x cell-x-manual"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            ✕
          </motion.span>
        )}
        {hasAutoX && !hasQueen && !hasManualX && (
          <motion.span
            key="auto-x"
            className="cell-x cell-x-auto"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            ✕
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
})
