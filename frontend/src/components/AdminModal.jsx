import { useState } from 'react';
import Modal from './Modal';

// Admin Login Modal
// Stays mounted while closed so the entered credentials are kept between opens.
export default function AdminModal({ open, isAuthenticated, onLogin, onLogout, onClose }) {
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  if (!open) return null;

  // Admin Login Handler
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminUser.trim() === 'admin' && adminPass === 'admin') {
      onLogin();
      alert('Admin login successful.');
      onClose();
    } else {
      alert('Demo credentials: username "admin", password "admin"');
    }
  };

  const handleAdminLogout = () => {
    setAdminUser('');
    setAdminPass('');
    onLogout();
    onClose();
  };

  return (
    <Modal title="Admin Login" onClose={onClose}>
      <form onSubmit={handleAdminLogin} className="form-stack">
        <p className="muted">Admin Login Failed</p>
        <p className="muted">Full account features will be implemented later.</p>
        {isAuthenticated && (
          <p className="muted" style={{ color: '#4ade80' }}>
            Currently authenticated as <strong>admin</strong>
          </p>
        )}
        <label>
          Admin User ID
          <input
            value={adminUser}
            onChange={(e) => setAdminUser(e.target.value)}
            placeholder="admin"
            required
          />
        </label>
        <label>
          Admin Password
          <input
            type="password"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            placeholder="password"
            required
          />
        </label>
        <div className="form-actions">
          {isAuthenticated && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleAdminLogout}
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
