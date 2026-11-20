import { RefreshCw, TrendingUp, Clock } from 'lucide-react';
import { isLotUpdating, isStaffLot, getStatusBarColor } from '../services/lotStatus';

function LotCard({ lot, onSelectLot }) {
  const isUpdating = isLotUpdating(lot);
  const barColor = getStatusBarColor(lot);
  const openPct = isUpdating ? null : 100 - lot.percentFull;

  return (
    <div className="lot-card">
      <div className="lot-card-top">
        <div>
          <span className={`permit-tag ${(lot.permitType || 'Student').toLowerCase()}`}>
            {isStaffLot(lot) ? 'Yellow Permit • Staff' : 'Green Permit • Student'}
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
            onClick={() => onSelectLot(lot)}
          >
            <TrendingUp size={14} /> Forecast
          </button>
        </div>
      </div>
    </div>
  );
}

// Left Column: Parking Lot List & Reversed Status Bars (% Full)
export default function LotList({ lots, totalCount, loading, onRefresh, onSelectLot }) {
  return (
    <section className="panel list-panel">
      <div className="panel-header">
        <div>
          <h2>Lot Occupancy Status</h2>
          <p className="muted">
            Showing {lots.length} of {totalCount} lot(s) • Bars fill from 0% (Empty) to 100% (Full)
          </p>
        </div>
        <button
          className="btn btn-sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="lot-cards">
        {lots.map((lot) => (
          <LotCard key={lot.id} lot={lot} onSelectLot={onSelectLot} />
        ))}
      </div>
    </section>
  );
}
