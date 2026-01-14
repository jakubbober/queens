import { useGameStore } from '../../store/gameStore'
import './UI.css'

export function Settings() {
  const settings = useGameStore(state => state.settings)
  const toggleAutoCheck = useGameStore(state => state.toggleAutoCheck)
  const toggleAutoX = useGameStore(state => state.toggleAutoX)

  return (
    <div className="settings">
      <h3>Settings</h3>
      <div className="setting-row">
        <label htmlFor="autoCheck">Auto-check (highlight errors)</label>
        <label className="toggle">
          <input
            type="checkbox"
            id="autoCheck"
            checked={settings.autoCheck}
            onChange={toggleAutoCheck}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>
      <div className="setting-row">
        <label htmlFor="autoX">Auto-place X's</label>
        <label className="toggle">
          <input
            type="checkbox"
            id="autoX"
            checked={settings.autoX}
            onChange={toggleAutoX}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>
    </div>
  )
}
