import React, { useState, useEffect } from 'react';
import {
  Map,
  List,
  Shield,
  User,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Sliders,
  Clock
} from 'lucide-react';
import { INITIAL_LOTS } from './mocks/mockData';
import { fetchParkingLots } from './services/parkingService';

export default function App() {
  // Core Data States
  const [lots, setLots] = useState(INITIAL_LOTS);
  const [loading, setLoading] = useState(false);
  const [timeoutError, setTimeoutError] = useState(null);
  const [systemLogs, setSystemLogs] = useState([
    '[SYSTEM] Fresno State Parking Demo initialized.'
  ]);

  // User Preferences & Filtering
  const [permitFilter, setPermitFilter] = useState(() => {
    const savedUser = localStorage.getItem('dronepark_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser).permitType || 'All';
      } catch {
        return 'All';
      }
    }
    return 'All';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('dronepark_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // View States
  const [mobileTab, setMobileTab] = useState('split'); // 'split' | 'list' | 'map'
  const [selectedForecastLot, setSelectedForecastLot] = useState(null);
  const [forecastInterval, setForecastInterval] = useState('hourly');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Admin State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  // Demo Control Toolbar State (Hidden by default; toggled via SHIFT + D)
  const [simulatedDelayMs, setSimulatedDelayMs] = useState(200);
  const [showDemoPanel, setShowDemoPanel] = useState(false);

  const appendSystemLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setSystemLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 14)]);
  };

  // Listen for SHIFT + D to toggle Demo Controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        return;
      }
      if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setShowDemoPanel((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('dronepark_seen_onboarding');
    if (!hasSeenPrompt && !currentUser) {
      localStorage.setItem('dronepark_seen_onboarding', 'true');
    }
  }, [currentUser]);

  const loadLots = (delayOverride = simulatedDelayMs, updatedLots = lots) => {
    setLoading(true);
    setTimeoutError(null);
    fetchParkingLots({
      simulatedDelayMs: delayOverride,
      customLots: updatedLots,
      permitFilter,
      onSystemLog: appendSystemLog
    })
      .then((data) => {
        setLots(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setTimeoutError(err.message);
        appendSystemLog(`[TIMEOUT] ${err.message}`);
      });
  };

  const handlePermitChange = (newPermit) => {
    setPermitFilter(newPermit);
    loadLots(simulatedDelayMs, lots);
  };

  // Toggle a lot between 'OK' and 'UPDATING'
  const toggleLotUpdatingState = (lotId) => {
    const nextLots = lots.map((lot) => {
      if (lot.id !== lotId) return lot;
      const nextStatus = lot.status === 'UPDATING' ? 'OK' : 'UPDATING';
      return {
        ...lot,
        status: nextStatus,
        percentFull: nextStatus === 'OK' ? 64 : null
      };
    });
    setLots(nextLots);
    appendSystemLog(`[DEMO] Toggled ${lotId} status.`);
  };

  // Status Bar Color Helper (Reversed to show Percentage Full)
  const getStatusBarColor = (lot) => {
    if (lot.status === 'UPDATING' || lot.percentFull === null) {
      return '#64748b';
    }
    const full = lot.percentFull;
    if (full >= 80) return '#ef4444';
    if (full >= 50) return '#eab308';
    return '#22c55e';
  };

  // Map Polygon Color Helper: Matches Fresno State Map Permit Colors
  const getMapPolygonColor = (lot) => {
    if (lot.status === 'UPDATING' || lot.percentFull === null) {
      return '#64748b';
    }
    return lot.permitType === 'Student' ? '#16a34a' : '#eab308';
  };

  const filteredLots = lots.filter((lot) =>
    permitFilter === 'All' ? true : lot.permitType === permitFilter
  );

  // Account Login Handler
  const handleUserLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username')?.trim();
    if (username) {
      const userObj = { username };
      localStorage.setItem('dronepark_user', JSON.stringify(userObj));
      setCurrentUser(userObj);
      setShowAccountModal(false);
      appendSystemLog(`[ACCOUNT] User login successful for ${username}.`);
      alert(`Login successful for ${username}.`);
    }
  };

  // Admin Login Handler
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminUser.trim() === 'admin' && adminPass === 'admin') {
      setIsAdminAuthenticated(true);
      appendSystemLog('[ADMIN] Admin login successful.');
      alert('Admin login successful.');
      setShowAdminModal(false);
    } else {
      alert('Demo credentials: username "admin", password "admin"');
    }
  };

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <header className="navbar">
        <div className="brand">
          <span className="brand-badge">FRESNO STATE</span>
          <div>
            <h1>Campus Parking Lot Occupancy</h1>
            <span className="subtitle">Real-Time Aerial Telemetry • Status Bars Show % Full</span>
          </div>
        </div>

        {/* Permit Type Filter (Green Student vs Yellow Employee/Staff) */}
        <div className="permit-filter" role="group" aria-label="Permit Filter">
          <span className="filter-label">Permit:</span>
          {[
            { id: 'All', label: 'All Lots (8)' },
            { id: 'Student', label: 'Green (Student)' },
            { id: 'Staff', label: 'Yellow (Staff)' }
          ].map((item) => (
            <button
              key={item.id}
              className={`chip ${permitFilter === item.id ? 'active' : ''}`}
              onClick={() => handlePermitChange(item.id)}
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
              onClick={() => setMobileTab('split')}
              title="Split Screen View"
            >
              Split
            </button>
            <button
              className={`chip ${mobileTab === 'list' ? 'active' : ''}`}
              onClick={() => setMobileTab('list')}
              title="List View"
            >
              <List size={15} /> List
            </button>
            <button
              className={`chip ${mobileTab === 'map' ? 'active' : ''}`}
              onClick={() => setMobileTab('map')}
              title="Map View"
            >
              <Map size={15} /> Map
            </button>
          </div>

          <button className="btn btn-outline" onClick={() => setShowAccountModal(true)}>
            <User size={16} />
            {currentUser ? currentUser.username : 'Account'}
          </button>

          <button className="btn btn-outline" onClick={() => setShowAdminModal(true)}>
            <Shield size={16} /> Admin
          </button>
        </div>
      </header>

      {/* 15-Second Timeout Banner */}
      {timeoutError && (
        <div className="error-banner">
          <div>
            <strong>Timeout Error:</strong> {timeoutError}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSimulatedDelayMs(200);
              loadLots(200, lots);
            }}
          >
            <RefreshCw size={15} /> Reset Latency &amp; Refresh Now
          </button>
        </div>
      )}

      {/* Main Content Area: Split-Screen on Desktop or Toggled View */}
      <main className={`dashboard-grid mode-${mobileTab}`}>
        {/* Left Column: Parking Lot List & Reversed Status Bars (% Full) */}
        {(mobileTab === 'split' || mobileTab === 'list') && (
          <section className="panel list-panel">
            <div className="panel-header">
              <div>
                <h2>Lot Occupancy Status</h2>
                <p className="muted">
                  Showing {filteredLots.length} of {lots.length} lot(s) • Bars fill from 0% (Empty) to 100% (Full)
                </p>
              </div>
              <button
                className="btn btn-sm"
                onClick={() => loadLots(simulatedDelayMs, lots)}
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            <div className="lot-cards">
              {filteredLots.map((lot) => {
                const isUpdating = lot.status === 'UPDATING' || lot.percentFull === null;
                const barColor = getStatusBarColor(lot);
                const openPct = isUpdating ? null : 100 - lot.percentFull;

                return (
                  <div key={lot.id} className="lot-card">
                    <div className="lot-card-top">
                      <div>
                        <span className={`permit-tag ${lot.permitType.toLowerCase()}`}>
                          {lot.permitType === 'Student' ? 'Green Permit • Student' : 'Yellow Permit • Staff'}
                        </span>
                        <h3>{lot.name}</h3>
                      </div>

                      <div className="lot-pct-box">
                        {isUpdating ? (
                          <span className="updating-badge">Still Updating...</span>
                        ) : (
                          <div className="pct-stack">
                            <span className="pct-number" style={{ color: barColor }}>
                              {lot.percentFull}% Full
                            </span>
                            <span className="pct-sub">({openPct}% Open)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reversed Status Progress Bar: Width = % Full */}
                    <div className="progress-track" title={isUpdating ? 'Updating' : `${lot.percentFull}% Full`}>
                      <div
                        className="progress-fill"
                        style={{
                          width: isUpdating ? '100%' : `${lot.percentFull}%`,
                          backgroundColor: barColor
                        }}
                      />
                    </div>

                    <div className="lot-card-footer">
                      <span className="timestamp">
                        <Clock size={13} /> {lot.lastUpdated}
                        {!isUpdating && (
                          <span className="delta">
                            ({lot.fiveMinDelta >= 0 ? `+${lot.fiveMinDelta}%` : `${lot.fiveMinDelta}%`} full / 5m)
                          </span>
                        )}
                      </span>

                      <div className="card-actions">
                        <button
                          className="btn-link"
                          onClick={() => setSelectedForecastLot(lot)}
                        >
                          <TrendingUp size={14} /> Forecast
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Right Column: Customized Fresno State Static Parking Map */}
        {(mobileTab === 'split' || mobileTab === 'map') && (
          <section className="panel map-panel">
            <div className="panel-header">
              <div>
                <h2>Fresno State Campus Parking Map</h2>
                <p className="muted">
                  Click any highlighted lot on the map to view hourly and daily occupancy forecasts
                </p>
              </div>
            </div>

            {/* Map Legend */}
            <div className="map-legend">
              <span><strong>Permit Legend:</strong></span>
              <span className="legend-item">
                <i className="dot" style={{ background: '#16a34a' }} /> Green Permit — Student
              </span>
              <span className="legend-item">
                <i className="dot" style={{ background: '#eab308' }} /> Yellow Permit — Staff
              </span>
              <span className="legend-item">
                <i className="dot" style={{ background: '#64748b' }} /> Still Updating
              </span>
            </div>

            {/* Customized Fresno State Campus SVG Map */}
            <div className="static-map-canvas">
              <svg viewBox="0 0 1000 860" preserveAspectRatio="xMidYMid meet" className="campus-svg">
                <rect x="0" y="0" width="1000" height="860" fill="#0b1120" />

                {/* Major Campus Landmarks / Building Blocks */}
                <g fill="#1e293b" stroke="#334155" strokeWidth="1">
                  <rect x="42" y="340" width="60" height="105" rx="6" />
                  <rect x="115" y="360" width="65" height="65" rx="4" />
                  <rect x="115" y="450" width="65" height="60" rx="4" />
                  <rect x="42" y="485" width="58" height="85" rx="4" />
                  <rect x="230" y="480" width="65" height="90" rx="4" />
                  <rect x="160" y="545" width="55" height="55" rx="4" />
                  <rect x="125" y="625" width="120" height="130" rx="4" />
                  <rect x="225" y="204" width="75" height="80" rx="4" />
                  <rect x="225" y="305" width="75" height="35" rx="4" />
                  <rect x="320" y="295" width="90" height="45" rx="4" />
                  <rect x="320" y="365" width="90" height="75" rx="4" />
                  <rect x="425" y="360" width="65" height="60" rx="4" />
                  <rect x="540" y="365" width="95" height="55" rx="4" />
                  <rect x="575" y="440" width="78" height="55" rx="4" />
                  <rect x="565" y="515" width="82" height="52" rx="4" />
                  <rect x="315" y="445" width="90" height="55" rx="4" />
                  <rect x="365" y="585" width="80" height="70" rx="4" />
                  <rect x="415" y="510" width="70" height="60" rx="4" />
                  <rect x="455" y="590" width="50" height="65" rx="4" />
                  <rect x="268" y="715" width="42" height="55" rx="4" />
                  <rect x="385" y="715" width="95" height="65" rx="4" />
                  <rect x="512" y="585" width="48" height="65" rx="4" />
                  <rect x="595" y="660" width="60" height="42" rx="4" />
                  <rect x="750" y="290" width="75" height="140" rx="6" />
                  <rect x="750" y="505" width="215" height="115" rx="6" fill="#172554" fillOpacity="0.35" />
                  <rect x="835" y="685" width="130" height="125" rx="6" />
                  <rect x="780" y="695" width="50" height="110" rx="4" />
                </g>

                {/* Building Text Labels */}
                <g fill="#94a3b8" fontSize="10" fontFamily="sans-serif" textAnchor="middle">
                  <text x="72" y="395">Warmerdam</text>
                  <text x="147" y="395">North Gym</text>
                  <text x="147" y="485">South Gym</text>
                  <text x="262" y="530">Library</text>
                  <text x="185" y="690">Student Housing</text>
                  <text x="262" y="248">IT Building</text>
                  <text x="262" y="326">Eng. West</text>
                  <text x="365" y="322">Eng. East</text>
                  <text x="365" y="405">McLane Hall</text>
                  <text x="587" y="395">Science</text>
                  <text x="614" y="470">Peters Business</text>
                  <text x="606" y="544">Conley Art</text>
                  <text x="360" y="475">Student Union</text>
                  <text x="405" y="625">Resnick Union</text>
                  <text x="289" y="745" fontSize="8.5">Health Ctr</text>
                  <text x="536" y="622">Joyal</text>
                  <text x="625" y="684">Smittcamp</text>
                  <text x="432" y="750">Kremen Education</text>
                  <text x="857" y="565" fill="#64748b">Save Mart Center Parking</text>
                  <text x="900" y="748" fill="#94a3b8">Save Mart Center</text>
                  <text x="805" y="748">Rec Ctr</text>
                </g>

                {/* Primary Road Network Matching Fresno State Map */}
                <g
                  stroke="#334155"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                >
                  <line x1="24" y1="20" x2="24" y2="835" />
                  <line x1="976" y1="20" x2="976" y2="835" />
                  <line x1="24" y1="186" x2="976" y2="186" />
                  <line x1="24" y1="830" x2="976" y2="830" strokeWidth="16" />

                  <line x1="190" y1="186" x2="190" y2="510" strokeWidth="8" />
                  <line x1="308" y1="186" x2="308" y2="350" strokeWidth="8" />
                  <line x1="506" y1="186" x2="506" y2="420" strokeWidth="9" />
                  <line x1="506" y1="670" x2="506" y2="830" strokeWidth="10" />
                  <line x1="738" y1="186" x2="738" y2="830" strokeWidth="10" />
                  <line x1="190" y1="346" x2="738" y2="346" strokeWidth="8" />
                  <line x1="738" y1="495" x2="976" y2="495" strokeWidth="8" />
                  <line x1="24" y1="620" x2="112" y2="620" strokeWidth="7" />
                  <line x1="112" y1="620" x2="112" y2="830" strokeWidth="7" />
                  <line x1="260" y1="620" x2="260" y2="830" strokeWidth="7" />
                  <line x1="260" y1="700" x2="506" y2="700" strokeWidth="7" />
                  <path d="M 506 700 Q 610 725 738 640 L 976 640" strokeWidth="8" />
                </g>

                {/* Street Name Labels */}
                <g fill="#e2e8f0" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                  <text x="18" y="450" transform="rotate(-90 18,450)">CEDAR AVE</text>
                  <text x="982" y="450" transform="rotate(-90 982,450)">CHESTNUT AVE</text>
                  <text x="105" y="182">BARSTOW AVE</text>
                  <text x="815" y="182">BARSTOW AVE</text>
                  <text x="120" y="834">SHAW AVE</text>
                  <text x="506" y="852" textAnchor="middle" fill="#38bdf8">▲ MAIN ENTRANCE (MAPLE &amp; SHAW)</text>
                  <text x="830" y="834">SHAW AVE</text>
                  <text x="502" y="285" transform="rotate(-90 502,285)" fontSize="9.5">MAPLE AVE</text>
                  <text x="734" y="440" transform="rotate(-90 734,440)" fontSize="9.5">WOODROW AVE</text>
                  <text x="445" y="343" fontSize="9.5">SAN RAMON AVE</text>
                  <text x="845" y="491" fontSize="9.5">BULLDOG LN</text>
                  <text x="845" y="636" fontSize="9.5">MATOIAN WAY</text>
                  <text x="256" y="775" transform="rotate(-90 256,775)" fontSize="9">BARTON AVE</text>
                  <text x="380" y="696" fontSize="9.5">KEATS AVE</text>
                </g>

                {/* Interactive Fresno State Demo Parking Lot Polygons (P1, P2, P5, P6, P15, P20, P30, P31) */}
                {filteredLots.map((lot) => {
                  const isUpdating = lot.status === 'UPDATING' || lot.percentFull === null;
                  const polyColor = getMapPolygonColor(lot);
                  const { x, y, width, height } = lot.coordinates;

                  return (
                    <g
                      key={lot.id}
                      className="map-lot-group"
                      onClick={() => setSelectedForecastLot(lot)}
                    >
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        rx="5"
                        fill={polyColor}
                        fillOpacity="0.42"
                        stroke={polyColor}
                        strokeWidth="2.4"
                      />
                      <text
                        x={x + width / 2}
                        y={y + height / 2 - 4}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={width < 48 ? '10.5' : '13'}
                        fontWeight="800"
                      >
                        {lot.code}
                      </text>
                      <text
                        x={x + width / 2}
                        y={y + height / 2 + 11}
                        textAnchor="middle"
                        fill="#fef08a"
                        fontSize={width < 48 ? '8.5' : '11'}
                        fontWeight="bold"
                      >
                        {isUpdating ? 'Updating...' : `${lot.percentFull}% Full`}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </section>
        )}
      </main>

      {/* Occupancy Forecast Modal */}
      {selectedForecastLot && (
        <div className="modal-backdrop" onClick={() => setSelectedForecastLot(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Occupancy Forecast: {selectedForecastLot.name}</h3>
                <span className="muted">{selectedForecastLot.permitColorName}</span>
              </div>
              <button className="close-btn" onClick={() => setSelectedForecastLot(null)}>×</button>
            </div>

            <div className="interval-tabs">
              <button
                className={`chip ${forecastInterval === 'hourly' ? 'active' : ''}`}
                onClick={() => setForecastInterval('hourly')}
              >
                Hourly Interval
              </button>
              <button
                className={`chip ${forecastInterval === 'daily' ? 'active' : ''}`}
                onClick={() => setForecastInterval('daily')}
              >
                Daily Interval
              </button>
            </div>

            {!selectedForecastLot.hasForecastData ? (
              <div className="empty-forecast">
                <AlertTriangle size={32} color="#eab308" />
                <p>
                  <strong>Forecast Unavailable:</strong> Insufficient historical parking trend data for {selectedForecastLot.name}.
                </p>
              </div>
            ) : (
              <div className="forecast-list">
                {selectedForecastLot.forecasts[forecastInterval].map((item, idx) => (
                  <div key={idx} className="forecast-row">
                    <span>{item.label}</span>
                    <div className="forecast-bar-wrap">
                      <div
                        className="forecast-bar"
                        style={{
                          width: `${item.pctFull}%`,
                          backgroundColor: item.pctFull >= 80 ? '#ef4444' : item.pctFull >= 50 ? '#eab308' : '#22c55e'
                        }}
                      />
                    </div>
                    <strong>{item.pctFull}% Full</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Login Modal */}
      {showAccountModal && (
        <div className="modal-backdrop" onClick={() => setShowAccountModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Login</h3>
              <button className="close-btn" onClick={() => setShowAccountModal(false)}>×</button>
            </div>
            <form onSubmit={handleUserLogin} className="form-stack">
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
                    onClick={() => {
                      localStorage.removeItem('dronepark_user');
                      setCurrentUser(null);
                      appendSystemLog('[ACCOUNT] Logged out.');
                      setShowAccountModal(false);
                    }}
                  >
                    Log Out
                  </button>
                )}
                <button type="submit" className="btn btn-primary">
                  Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminModal && (
        <div className="modal-backdrop" onClick={() => setShowAdminModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Admin Login</h3>
              <button className="close-btn" onClick={() => setShowAdminModal(false)}>×</button>
            </div>

            <form onSubmit={handleAdminLogin} className="form-stack">
              <p className="muted">Failed to Login</p>
              <p className="muted">Full account features will be implemented later.</p>
              {isAdminAuthenticated && (
                <p className="muted" style={{ color: '#4ade80' }}>
                  Currently authenticated as <strong>admin</strong>
                </p>
              )}
              <label>
                Admin User ID
                <input
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  placeholder="username"
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
                {isAdminAuthenticated && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setIsAdminAuthenticated(false);
                      setAdminUser('');
                      setAdminPass('');
                      appendSystemLog('[ADMIN] Admin logged out.');
                      setShowAdminModal(false);
                    }}
                  >
                    Log Out
                  </button>
                )}
                <button type="submit" className="btn btn-primary">
                  Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Demo Control Panel: Only visible when toggled with SHIFT + D */}
      {showDemoPanel && (
        <aside className="demo-toolbar">
          <div className="demo-toolbar-header">
            <span><Sliders size={15} /> Demo Simulation Controls (Press SHIFT + D to hide)</span>
            <button
              className="demo-close-btn"
              onClick={() => setShowDemoPanel(false)}
              title="Hide Demo Controls"
            >
              ×
            </button>
          </div>

          <div className="demo-toolbar-body">
            <div className="demo-control-group">
              <label>Simulate Backend Latency (3s Warning / 15s Timeout):</label>
              <div className="btn-group">
                <button
                  className={`chip ${simulatedDelayMs === 200 ? 'active' : ''}`}
                  onClick={() => {
                    setSimulatedDelayMs(200);
                    loadLots(200, lots);
                  }}
                >
                  200ms (Normal)
                </button>
                <button
                  className={`chip ${simulatedDelayMs === 3500 ? 'active' : ''}`}
                  onClick={() => {
                    setSimulatedDelayMs(3500);
                    loadLots(3500, lots);
                  }}
                >
                  3.5s (Slow Render Log)
                </button>
                <button
                  className={`chip ${simulatedDelayMs === 15500 ? 'active' : ''}`}
                  onClick={() => {
                    setSimulatedDelayMs(15500);
                    loadLots(15500, lots);
                  }}
                >
                  15.5s (Timeout Error)
                </button>
              </div>
            </div>

            <div className="demo-control-group">
              <label>Simulate Image Processor Failure ("Still Updating..."):</label>
              <div className="btn-group">
                {lots.map((l) => (
                  <button
                    key={l.id}
                    className={`chip ${l.status === 'UPDATING' ? 'active' : ''}`}
                    onClick={() => toggleLotUpdatingState(l.id)}
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
      )}
    </div>
  );
}
