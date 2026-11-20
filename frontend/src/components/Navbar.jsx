import { useState } from 'react';
import { Menu, X, Shield, User } from 'lucide-react';

const PERMIT_OPTIONS = [
  { id: 'All', label: 'All Lots' },
  { id: 'Student', label: 'Green (General)' },
  { id: 'Staff', label: 'Yellow (Staff)' }
];

// Permit filter chips, account, and admin buttons, shared by the desktop bar and the mobile menu.
// onAction runs after any choice so the mobile menu can close itself.
function NavOptions({ permitFilter, onPermitChange, currentUser, onOpenAccount, onOpenAdmin, onAction = () => {} }) {
  const run = (fn) => () => {
    fn();
    onAction();
  };

  return (
    <>
      {/* Permit Type Filter (Green Student vs Yellow Staff) */}
      <div className="permit-filter" role="group" aria-label="Permit Filter">
        <span className="filter-label">Permit:</span>
        {PERMIT_OPTIONS.map((item) => (
          <button
            key={item.id}
            className={`chip ${permitFilter === item.id ? 'active' : ''}`}
            onClick={run(() => onPermitChange(item.id))}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="nav-actions">
        <button className="btn btn-outline" onClick={run(onOpenAccount)}>
          <User size={16} />
          {currentUser ? currentUser.username : 'Account'}
        </button>

        <button className="btn btn-outline" onClick={run(onOpenAdmin)}>
          <Shield size={16} /> Admin
        </button>
      </div>
    </>
  );
}

// Top Navigation Bar: inline options on desktop, hamburger slide-out menu on mobile
export default function Navbar({ isMobile, ...options }) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isMobile) {
    return (
      <header className="navbar">
        <div className="brand">
          <span className="brand-badge">FlockLite</span>
          <div>
            <h1>Fresno State Parking Lot Occupancy</h1>
            <span className="subtitle">Real-Time Aerial Telemetry • Status Bars Show % Full</span>
          </div>
        </div>
        <NavOptions {...options} />
      </header>
    );
  }

  return (
    <header className="navbar mobile">
      <div className="brand">
        <span className="brand-badge">FlockLite</span>
        <h1>Fresno State Parking</h1>
      </div>

      <button
        className="icon-btn"
        aria-label="Open menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(true)}
      >
        <Menu size={22} />
      </button>

      <div
        className={`menu-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <nav
        className={`mobile-menu ${menuOpen ? 'open' : ''}`}
        aria-label="Main menu"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className="mobile-menu-header">
          <span className="brand-badge">FlockLite</span>
          <button className="icon-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <X size={22} />
          </button>
        </div>
        <NavOptions {...options} onAction={() => setMenuOpen(false)} />
      </nav>
    </header>
  );
}
