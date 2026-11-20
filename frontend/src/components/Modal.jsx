// Shared modal shell: backdrop click or the × button closes it.
export default function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {subtitle !== undefined ? (
            <div>
              <h3>{title}</h3>
              <span className="muted">{subtitle}</span>
            </div>
          ) : (
            <h3>{title}</h3>
          )}
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {children}
      </div>
    </div>
  );
}
