import { Sliders } from 'lucide-react';

const LATENCY_OPTIONS = [
  { ms: 200, label: '200ms (Normal)' },
  { ms: 3500, label: '3.5s (Slow Render Log)' },
  { ms: 15500, label: '15.5s (Timeout Error)' }
];

// Hidden Demo Control Panel: Only visible when toggled with SHIFT + D
export default function DemoToolbar({
  lots,
  simulatedDelayMs,
  systemLogs,
  onDelayChange,
  onToggleLot,
  onClose
}) {
  return (
    <aside className="demo-toolbar">
      <div className="demo-toolbar-header">
        <span><Sliders size={15} /> Demo Simulation Controls (Press SHIFT + D to hide)</span>
        <button
          className="demo-close-btn"
          onClick={onClose}
          title="Hide Demo Controls"
        >
          ×
        </button>
      </div>

      <div className="demo-toolbar-body">
        <div className="demo-control-group">
          <label>Simulate Backend Latency (3s Warning / 15s Timeout):</label>
          <div className="btn-group">
            {LATENCY_OPTIONS.map((option) => (
              <button
                key={option.ms}
                className={`chip ${simulatedDelayMs === option.ms ? 'active' : ''}`}
                onClick={() => onDelayChange(option.ms)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="demo-control-group">
          <label>Simulate Image Processor Failure ("Still Updating..."):</label>
          <div className="btn-group">
            {lots.map((l) => (
              <button
                key={l.id}
                className={`chip ${l.status === 'UPDATING' ? 'active' : ''}`}
                onClick={() => onToggleLot(l.id)}
              >
                {l.code}: {l.status}
              </button>
            ))}
          </div>
        </div>

        <div className="demo-logs">
          <strong>System Telemetry Log:</strong>
          {systemLogs.map((log, index) => (
            <div key={index} className="sys-log-line">{log}</div>
          ))}
        </div>
      </div>
    </aside>
  );
}
