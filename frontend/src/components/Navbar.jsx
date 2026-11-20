import { Map, List, Shield, User } from 'lucide-react';

const PERMIT_OPTIONS = [
  { id: 'All', label: 'All Lots' },
  { id: 'Student', label: 'Green (General)' },
  { id: 'Staff', label: 'Yellow (Staff)' }
];

// Top Navigation Bar
export default function Navbar({
  permitFilter,
  onPermitChange,
  mobileTab,
  onTabChange,
  currentUser,
  onOpenAccount,
  onOpenAdmin
}) {
  return (
    <header className="navbar">
      <div className="brand">
        <span className="brand-badge">FlockLite</span>
        <div>
          <h1>Fresno State Parking Lot Occupancy</h1>
          <span className="subtitle">Real-Time Aerial Telemetry • Status Bars Show % Full</span>
        </div>
      </div>

      {/* Permit Type Filter (Green Student vs Yellow Staff) */}
      <div className="permit-filter" role="group" aria-label="Permit Filter">
        <span className="filter-label">Permit:</span>
        {PERMIT_OPTIONS.map((item) => (
          <button
            key={item.id}
            className={`chip ${permitFilter === item.id ? 'active' : ''}`}
            onClick={() => onPermitChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* View Mode & Modals */}
      <div className="nav-actions">
        <div className="view-switcher">
          <button
            className={`chip ${mobileTab === 'split' ? 'active' : ''}`}
            onClick={() => onTabChange('split')}
            title="Split Screen View"
          >
            Split
          </button>
          <button
            className={`chip ${mobileTab === 'list' ? 'active' : ''}`}
            onClick={() => onTabChange('list')}
            title="List View"
          >
            <List size={15} /> List
          </button>
          <button
            className={`chip ${mobileTab === 'map' ? 'active' : ''}`}
            onClick={() => onTabChange('map')}
            title="Map View"
          >
            <Map size={15} /> Map
          </button>
        </div>

        <button className="btn btn-outline" onClick={onOpenAccount}>
          <User size={16} />
          {currentUser ? currentUser.username : 'Account'}
        </button>

        <button className="btn btn-outline" onClick={onOpenAdmin}>
          <Shield size={16} /> Admin
        </button>
      </div>
    </header>
  );
}
