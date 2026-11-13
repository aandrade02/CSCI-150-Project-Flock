import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { INITIAL_LOTS } from './mocks/mockData';
import { fetchParkingLots } from './services/parkingService';
import { loadSavedUser, saveUser, clearSavedUser } from './services/userStorage';
import Navbar from './components/Navbar';
import LotList from './components/LotList';
import CampusMap from './components/CampusMap';
import ForecastModal from './components/ForecastModal';
import AccountModal from './components/AccountModal';
import AdminModal from './components/AdminModal';
import DemoToolbar from './components/DemoToolbar';

export default function App() {
  // Core Data States
  const [lots, setLots] = useState(INITIAL_LOTS);
  const [loading, setLoading] = useState(false);
  const [timeoutError, setTimeoutError] = useState(null);
  const [systemLogs, setSystemLogs] = useState([
    '[SYSTEM] FlockLite Demo initialized.'
  ]);

  // User Preferences & Filtering
  const [permitFilter, setPermitFilter] = useState(() => loadSavedUser()?.permitType || 'All');
  const [currentUser, setCurrentUser] = useState(loadSavedUser);

  // View States
  const [mobileTab, setMobileTab] = useState('split'); // 'split' | 'list' | 'map'
  const [selectedForecastLot, setSelectedForecastLot] = useState(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Admin State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

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
    const hasSeenPrompt = localStorage.getItem('flocklite_seen_onboarding');
    if (!hasSeenPrompt && !currentUser) {
      localStorage.setItem('flocklite_seen_onboarding', 'true');
    }
  }, [currentUser]);

  // Load live parking lot occupancy on mount
  useEffect(() => {
    loadLots();
  }, []);

  // Fetch Parking Lots with Simulated Delay and Error Handling
  // This function is supposed to load parking lot data from the backend
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

  const handleDelayChange = (delayMs) => {
    setSimulatedDelayMs(delayMs);
    loadLots(delayMs, lots);
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

  const filteredLots = lots.filter((lot) =>
    permitFilter === 'All' ? true : (lot.permitType || '').toLowerCase() === permitFilter.toLowerCase()
  );

  // User Login Handler
  const handleUserLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username')?.trim();
    if (username) {
      const userObj = { username };
      saveUser(userObj);
      setCurrentUser(userObj);
      setShowAccountModal(false);
      appendSystemLog(`[ACCOUNT] User login successful for ${username}.`);
      alert(`Login successful for ${username}.`);
    }
  };

  const handleUserLogout = () => {
    clearSavedUser();
    setCurrentUser(null);
    appendSystemLog('[ACCOUNT] Logged out.');
    setShowAccountModal(false);
  };

  return (
    <div className="app-container">
      <Navbar
        permitFilter={permitFilter}
        onPermitChange={handlePermitChange}
        mobileTab={mobileTab}
        onTabChange={setMobileTab}
        currentUser={currentUser}
        onOpenAccount={() => setShowAccountModal(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
      />

      {/* 15-Second Timeout Banner */}
      {timeoutError && (
        <div className="error-banner">
          <div>
            <strong>Timeout Error:</strong> {timeoutError}
          </div>
          <button className="btn btn-primary" onClick={() => handleDelayChange(200)}>
            <RefreshCw size={15} /> Reset Latency &amp; Refresh Now
          </button>
        </div>
      )}

      {/* Main Content Area: Split-Screen on Desktop or Toggled View */}
      <main className={`dashboard-grid mode-${mobileTab}`}>
        {(mobileTab === 'split' || mobileTab === 'list') && (
          <LotList
            lots={filteredLots}
            totalCount={lots.length}
            loading={loading}
            onRefresh={() => loadLots(simulatedDelayMs, lots)}
            onSelectLot={setSelectedForecastLot}
          />
        )}

        {(mobileTab === 'split' || mobileTab === 'map') && (
          <CampusMap lots={filteredLots} onSelectLot={setSelectedForecastLot} />
        )}
      </main>

      <ForecastModal lot={selectedForecastLot} onClose={() => setSelectedForecastLot(null)} />

      {showAccountModal && (
        <AccountModal
          currentUser={currentUser}
          onLogin={handleUserLogin}
          onLogout={handleUserLogout}
          onClose={() => setShowAccountModal(false)}
        />
      )}

      <AdminModal
        open={showAdminModal}
        isAuthenticated={isAdminAuthenticated}
        onLogin={() => {
          setIsAdminAuthenticated(true);
          appendSystemLog('[ADMIN] Admin login successful.');
        }}
        onLogout={() => {
          setIsAdminAuthenticated(false);
          appendSystemLog('[ADMIN] Admin logged out.');
        }}
        onClose={() => setShowAdminModal(false)}
      />

      {showDemoPanel && (
        <DemoToolbar
          lots={lots}
          simulatedDelayMs={simulatedDelayMs}
          systemLogs={systemLogs}
          onDelayChange={handleDelayChange}
          onToggleLot={toggleLotUpdatingState}
          onClose={() => setShowDemoPanel(false)}
        />
      )}
    </div>
  );
}
