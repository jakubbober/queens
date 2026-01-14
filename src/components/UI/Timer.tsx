import { useGameStore } from '../../store/gameStore'

export function Timer() {
  const elapsed = useGameStore(state => state.timer.elapsed)

  const minutes = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, '0')
  const seconds = (elapsed % 60).toString().padStart(2, '0')

  return <div className="timer">{minutes}:{seconds}</div>
}
