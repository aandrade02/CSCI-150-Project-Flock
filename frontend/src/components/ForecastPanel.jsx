import { useEffect, useState } from 'react';
import { ChevronLeft, Clock, CalendarDays, CircleParking, Car, Ban, AlertTriangle } from 'lucide-react';
import { LotCard } from './LotList';
import { CampusMapSvg } from './CampusMap';
import { isLotUpdating, getOccupancyColor } from '../services/lotStatus';
import { getFocusViewBox } from '../services/mapView';

// Weather-style "condition" for an occupancy level: icon + word, colored like the status bars.
function OccupancyIcon({ pctFull, size = 22 }) {
  const color = getOccupancyColor(pctFull);
  if (pctFull >= 80) return <Ban size={size} color={color} aria-label="Nearly full" />;
  if (pctFull >= 50) return <Car size={size} color={color} aria-label="Busy" />;
  return <CircleParking size={size} color={color} aria-label="Open" />;
}

// Horizontal hourly strip, like the iOS Weather hourly card.
function HourlyCard({ lot, hourly }) {
  const peak = hourly.reduce((max, item) => (!max || item.pctFull > max.pctFull ? item : max), null);
  const columns = isLotUpdating(lot) ? hourly : [{ label: 'Now', pctFull: lot.percentFull }, ...hourly];

  return (
    <section className="wx-card" aria-label="Hourly forecast">
      {peak && (
        <p className="wx-summary">
          Expected to peak at {peak.pctFull}% full around {peak.label}.
        </p>
      )}
      <h4 className="wx-card-title">
        <Clock size={13} /> Hourly Forecast
      </h4>
      <ol className="wx-hourly">
        {columns.map((item) => (
          <li key={item.label} className={item.label === 'Now' ? 'now' : ''}>
            <span className="wx-hour-label">{item.label}</span>
            <OccupancyIcon pctFull={item.pctFull} />
            <strong>{item.pctFull}%</strong>
          </li>
        ))}
      </ol>
    </section>
  );
}

// Stacked daily rows with a 0–100% bar, like the iOS Weather 10-day card.
// The gradient spans the whole track so each fill shows the color of the level it reaches.
function DailyCard({ daily }) {
  return (
    <section className="wx-card" aria-label="Daily forecast">
      <h4 className="wx-card-title">
        <CalendarDays size={13} /> Daily Forecast
      </h4>
      <ul className="wx-daily">
        {daily.map((item) => (
          <li key={item.label}>
            <span className="wx-day-label">{item.label}</span>
            <OccupancyIcon pctFull={item.pctFull} size={20} />
            <div className="wx-range-track">
              <div
                className="wx-range-fill"
                style={{
                  width: `${item.pctFull}%`,
                  backgroundSize: `${10000 / Math.max(item.pctFull, 1)}% 100%`
                }}
              />
            </div>
            <strong>{item.pctFull}% Full</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Slide-over panel that covers the lot list with one lot's card, a mini map (mobile), and its forecast.
// Stays mounted after closing so it can slide back out with the last lot still showing.
export default function ForecastPanel({ lot, lots, isMobile, onSelectLot, onClose }) {
  const [shownLot, setShownLot] = useState(lot);
  const open = Boolean(lot);
  if (lot && lot !== shownLot) setShownLot(lot);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!shownLot) return null;

  return (
    <aside
      className={`forecast-panel ${open ? 'open' : ''}`}
      aria-label={`${shownLot.name} forecast`}
      aria-hidden={!open}
      inert={!open}
    >
      <div className="forecast-panel-header">
        <button className="back-btn" onClick={onClose}>
          <ChevronLeft size={20} /> Lots
        </button>
        <h2>{shownLot.name} Forecast</h2>
      </div>

      <div className="forecast-panel-body">
        <LotCard lot={shownLot} />

        {isMobile && shownLot.coordinates && (
          <div className="wx-card mini-map">
            <CampusMapSvg
              lots={lots}
              onSelectLot={onSelectLot}
              selectedLotId={shownLot.id}
              viewBox={getFocusViewBox(shownLot)}
            />
          </div>
        )}

        {!shownLot.hasForecastData ? (
          <section className="wx-card empty-forecast">
            <AlertTriangle size={28} color="#eab308" />
            <p>
              <strong>Forecast Unavailable:</strong> Insufficient historical parking trend data for {shownLot.name}.
            </p>
          </section>
        ) : (
          <>
            <HourlyCard lot={shownLot} hourly={shownLot.forecasts.hourly} />
            <DailyCard daily={shownLot.forecasts.daily} />
          </>
        )}
      </div>
    </aside>
  );
}
