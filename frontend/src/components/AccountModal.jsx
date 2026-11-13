import Modal from './Modal';

// User Login Modal
export default function AccountModal({ currentUser, onLogin, onLogout, onClose }) {
  return (
    <Modal title="User Login" onClose={onClose}>
      <form onSubmit={onLogin} className="form-stack">
        <p className="muted">Full account features will be implemented later.</p>
        {currentUser && (
          <p className="muted" style={{ color: '#4ade80' }}>
            Currently signed in as <strong>{currentUser.username}</strong>
          </p>
        )}
        <label>
          Username or Email
          <input
            name="username"
            type="text"
            required
            defaultValue={currentUser?.username || ''}
            placeholder="e.g., bulldog_student"
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
          />
        </label>
        <div className="form-actions">
          {currentUser && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={onLogout}
            >
              Log Out
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            Log In
          </button>
        </div>
      </form>
    </Modal>
  );
}
