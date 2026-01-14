import { useDebugStore } from '../../store/debugStore'
import './UI.css'

export function DebugPanel() {
  const enabled = useDebugStore(state => state.enabled)
  const messages = useDebugStore(state => state.messages)
  const clear = useDebugStore(state => state.clear)
  const toggleDebug = useDebugStore(state => state.toggleDebug)

  if (!enabled) {
    return (
      <button
        className="debug-toggle"
        onClick={toggleDebug}
        title="Enable debug mode"
      >
        Bug
      </button>
    )
  }

  return (
    <div className="debug-panel">
      <div className="debug-header">
        <span>Debug Console ({messages.length})</span>
        <div className="debug-actions">
          <button onClick={clear}>Clear</button>
          <button onClick={toggleDebug}>Close</button>
        </div>
      </div>
      <div className="debug-messages">
        {messages.length === 0 ? (
          <div className="debug-empty">No messages yet. Interact with the game to see logs.</div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`debug-message debug-${msg.level}`}>
              <span className="debug-time">
                {msg.timestamp.toLocaleTimeString()}
              </span>
              <span className="debug-source">[{msg.source}]</span>
              <span className="debug-text">{msg.message}</span>
              {msg.data !== undefined && (
                <pre className="debug-data">
                  {typeof msg.data === 'object'
                    ? JSON.stringify(msg.data, null, 2)
                    : String(msg.data)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
